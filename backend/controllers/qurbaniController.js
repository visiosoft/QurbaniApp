const Qurbani = require('../models/Qurbani');
const User = require('../models/User');
const Group = require('../models/Group');

// TODO: Implement notification service (email/push)
const sendNotification = async (recipient, message) => {
    // Mock notification - replace with actual email/push service
    console.log(`Notification to ${recipient}: ${message}`);

    // Example integration points:
    // - Email: nodemailer, sendgrid, AWS SES
    // - SMS: Twilio, AWS SNS
    // - Push: Firebase Cloud Messaging

    return { sent: true, recipient, message };
};

// Get all Qurbani requests with filters
const getAllQurbani = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            qurbaniType,
            status,
            accountType,
            search
        } = req.query;

        // Build query
        const query = {};

        if (qurbaniType) query.qurbaniType = qurbaniType;
        if (status) query.status = status;
        if (accountType) query.accountType = accountType;

        // Populate first to enable searching in populated fields
        let qurbaniQuery = Qurbani.find(query)
            .populate('userId', 'name passportNumber phoneNumber')
            .populate({
                path: 'groupId',
                select: 'groupName qurbaniType members',
                populate: {
                    path: 'members',
                    select: 'name passportNumber phoneNumber'
                }
            });

        const allResults = await qurbaniQuery;

        // Filter by search if provided (after population)
        let filteredResults = allResults;
        if (search) {
            const searchLower = search.toLowerCase();
            filteredResults = allResults.filter(q => {
                // Search in user name, passport, phone
                if (q.userId) {
                    return (
                        q.userId.name?.toLowerCase().includes(searchLower) ||
                        q.userId.passportNumber?.toLowerCase().includes(searchLower) ||
                        q.userId.phoneNumber?.toLowerCase().includes(searchLower)
                    );
                }
                // Search in group name
                if (q.groupId) {
                    return q.groupId.groupName?.toLowerCase().includes(searchLower);
                }
                return false;
            });
        }

        // Manual pagination
        const total = filteredResults.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedResults = filteredResults.slice(startIndex, endIndex);

        res.json({
            qurbaniRequests: paginatedResults,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total: total
        });

    } catch (error) {
        console.error('Get Qurbani error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

// Get Qurbani statistics
const getQurbaniStats = async (req, res) => {
    try {
        const stats = await Qurbani.aggregate([
            {
                $group: {
                    _id: {
                        qurbaniType: '$qurbaniType',
                        status: '$status',
                        accountType: '$accountType'
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalPending = await Qurbani.countDocuments({ status: 'pending' });
        const totalReady = await Qurbani.countDocuments({ status: 'ready' });
        const totalDone = await Qurbani.countDocuments({ status: 'done' });
        const totalIndividual = await Qurbani.countDocuments({ accountType: 'individual' });
        const totalGroup = await Qurbani.countDocuments({ accountType: 'group' });

        const bySheep = await Qurbani.countDocuments({ qurbaniType: 'Sheep' });
        const byCow = await Qurbani.countDocuments({ qurbaniType: 'Cow' });
        const byCamel = await Qurbani.countDocuments({ qurbaniType: 'Camel' });

        res.json({
            summary: {
                totalPending,
                totalReady,
                totalDone,
                totalIndividual,
                totalGroup
            },
            byType: {
                Sheep: bySheep,
                Cow: byCow,
                Camel: byCamel
            },
            detailed: stats
        });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

// Get single Qurbani by ID
const getQurbaniById = async (req, res) => {
    try {
        const qurbani = await Qurbani.findById(req.params.id)
            .populate('userId', 'name passportNumber phoneNumber')
            .populate({
                path: 'groupId',
                select: 'groupName qurbaniType members representative',
                populate: [
                    { path: 'members', select: 'name passportNumber phoneNumber' },
                    { path: 'representative', select: 'name passportNumber phoneNumber' }
                ]
            });

        if (!qurbani) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Qurbani request not found'
            });
        }

        res.json(qurbani);

    } catch (error) {
        console.error('Get Qurbani error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

// Update Qurbani status
const updateQurbaniStatus = async (req, res) => {
    try {
        const { status, notes } = req.body;

        if (!status) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Status is required'
            });
        }

        const qurbani = await Qurbani.findById(req.params.id)
            .populate('userId', 'name phoneNumber')
            .populate({
                path: 'groupId',
                select: 'groupName members',
                populate: { path: 'members', select: 'name phoneNumber' }
            });

        if (!qurbani) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Qurbani request not found'
            });
        }

        const oldStatus = qurbani.status;
        qurbani.status = status;

        if (notes) {
            qurbani.notes = notes;
        }

        if (status === 'done' && oldStatus !== 'done') {
            qurbani.completedAt = new Date();
        }

        await qurbani.save();

        // Update corresponding User or Group status
        if (qurbani.userId) {
            await User.findByIdAndUpdate(qurbani.userId, { status });
        } else if (qurbani.groupId) {
            await Group.findByIdAndUpdate(qurbani.groupId, { status });
            await User.updateMany({ groupId: qurbani.groupId }, { status });
        }

        // Send notification if marked as done
        if (status === 'done' && oldStatus !== 'done') {
            if (qurbani.userId) {
                // Individual notification
                const user = qurbani.userId;
                await sendNotification(
                    user.phoneNumber,
                    `Your Qurbani (${qurbani.qurbaniType}) has been completed successfully!`
                );
            } else if (qurbani.groupId) {
                // Group notification - notify all members
                const group = qurbani.groupId;
                for (const member of group.members) {
                    await sendNotification(
                        member.phoneNumber,
                        `Group "${group.groupName}" Qurbani (${qurbani.qurbaniType}) has been completed successfully!`
                    );
                }
            }
        }

        res.json({
            success: true,
            message: `Qurbani status updated to ${status}`,
            qurbani,
            notificationSent: status === 'done'
        });

    } catch (error) {
        console.error('Update Qurbani status error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

// Mark Qurbani as done (shortcut endpoint)
const markAsDone = async (req, res) => {
    try {
        const qurbani = await Qurbani.findById(req.params.id)
            .populate('userId', 'name phoneNumber')
            .populate({
                path: 'groupId',
                select: 'groupName members',
                populate: { path: 'members', select: 'name phoneNumber' }
            });

        if (!qurbani) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Qurbani request not found'
            });
        }

        if (qurbani.status === 'done') {
            return res.status(400).json({
                error: 'Already completed',
                message: 'This Qurbani is already marked as done'
            });
        }

        qurbani.status = 'done';
        qurbani.completedAt = new Date();
        await qurbani.save();

        // Update User or Group
        if (qurbani.userId) {
            await User.findByIdAndUpdate(qurbani.userId, { status: 'done' });

            // Send notification
            const user = qurbani.userId;
            await sendNotification(
                user.phoneNumber,
                `Your Qurbani (${qurbani.qurbaniType}) has been completed successfully!`
            );
        } else if (qurbani.groupId) {
            await Group.findByIdAndUpdate(qurbani.groupId, { status: 'done' });
            await User.updateMany({ groupId: qurbani.groupId }, { status: 'done' });

            // Send notification to all members
            const group = qurbani.groupId;
            for (const member of group.members) {
                await sendNotification(
                    member.phoneNumber,
                    `Group "${group.groupName}" Qurbani (${qurbani.qurbaniType}) has been completed successfully!`
                );
            }
        }

        res.json({
            success: true,
            message: 'Qurbani marked as done and notifications sent',
            qurbani
        });

    } catch (error) {
        console.error('Mark as done error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

// Delete Qurbani request
const deleteQurbani = async (req, res) => {
    try {
        const qurbani = await Qurbani.findById(req.params.id);

        if (!qurbani) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Qurbani request not found'
            });
        }

        await Qurbani.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Qurbani request deleted successfully'
        });

    } catch (error) {
        console.error('Delete Qurbani error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

// Get current user's qurbani record
const getMyQurbani = async (req, res) => {
    try {
        // Get userId from session (admin) or JWT (mobile user)
        const userId = req.session?.userId || req.user?._id;

        if (!userId) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not authenticated'
            });
        }

        // Find qurbani record for this user or their group
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                error: 'Not found',
                message: 'User not found'
            });
        }

        let qurbani;
        if (user.accountType === 'individual') {
            qurbani = await Qurbani.findOne({ userId: userId })
                .populate('userId', 'name passportNumber phoneNumber');
        } else {
            // If user is in a group, find group's qurbani
            qurbani = await Qurbani.findOne({ groupId: user.groupId })
                .populate('groupId')
                .populate('userId', 'name passportNumber phoneNumber');
        }

        if (!qurbani) {
            return res.status(404).json({
                error: 'Not found',
                message: 'No qurbani record found'
            });
        }

        // For group members, return their individual status instead of group qurbani status
        const displayStatus = user.accountType === 'group' ? user.status : qurbani.status;

        res.json({
            success: true,
            qurbani: {
                id: qurbani._id,
                qurbaniType: qurbani.qurbaniType,
                accountType: qurbani.accountType,
                status: displayStatus, // User status for group members, qurbani status for individual
                userId: qurbani.userId,
                groupId: qurbani.groupId,
                createdAt: qurbani.createdAt,
                completedAt: qurbani.completedAt,
                notes: qurbani.notes
            }
        });

    } catch (error) {
        console.error('Get my qurbani error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

// Update my qurbani status (for mobile users)
const updateMyQurbaniStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const user = req.user; // From JWT middleware

        if (!status) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Status is required'
            });
        }

        // Validate status value
        const validStatuses = ['pending', 'ready', 'done'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Invalid status value. Must be: pending, ready, or done'
            });
        }

        // Update user's own status - works for both individual and group members
        const oldStatus = user.status;

        // Use findByIdAndUpdate to avoid validation issues with existing data
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { status, updatedAt: new Date() },
            { new: true, runValidators: false }
        );

        // Update qurbani record
        let qurbani;
        if (user.accountType === 'individual') {
            // For individual accounts, update their qurbani record
            qurbani = await Qurbani.findOne({ userId: user._id });

            if (!qurbani) {
                return res.status(404).json({
                    error: 'Not found',
                    message: 'No qurbani record found'
                });
            }

            qurbani.status = status;
            if (status === 'done' && oldStatus !== 'done') {
                qurbani.completedAt = new Date();
            }
            await qurbani.save();
        } else {
            // For group members, just update their user status
            // Group qurbani status is managed separately by the admin
            qurbani = await Qurbani.findOne({ groupId: user.groupId });

            // Note: We don't update group qurbani status here
            // Only individual user status within the group
        }

        res.json({
            success: true,
            message: `Your status updated to ${status}`,
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                status: updatedUser.status,
                accountType: updatedUser.accountType
            },
            qurbani: qurbani ? {
                id: qurbani._id,
                qurbaniType: qurbani.qurbaniType,
                accountType: qurbani.accountType,
                status: updatedUser.accountType === 'individual' ? qurbani.status : updatedUser.status, // Return user status for group members
                createdAt: qurbani.createdAt,
                completedAt: qurbani.completedAt,
                notes: qurbani.notes
            } : null
        });

    } catch (error) {
        console.error('Update my qurbani status error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

module.exports = {
    getAllQurbani,
    getQurbaniStats,
    getQurbaniById,
    getMyQurbani,
    updateQurbaniStatus,
    updateMyQurbaniStatus,
    markAsDone,
    deleteQurbani
};
