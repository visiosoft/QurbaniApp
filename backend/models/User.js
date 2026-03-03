const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    passportNumber: {
        type: String,
        required: [true, 'Passport number is required'],
        unique: true,
        uppercase: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    qurbaniType: {
        type: String,
        enum: ['Sheep'],
        default: 'Sheep',
        required: [true, 'Qurbani type is required']
    },
    accountType: {
        type: String,
        enum: ['individual', 'group'],
        required: [true, 'Account type is required']
    },
    passwordHash: {
        type: String,
        default: null // Optional for users, they can set password later
    },
    status: {
        type: String,
        enum: ['pending', 'ready', 'done'],
        default: 'pending'
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        default: null
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: [true, 'Company is required']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('passwordHash') || !this.passwordHash) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.passwordHash) return false;
    return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Index for faster queries
userSchema.index({ passportNumber: 1 });
userSchema.index({ accountType: 1 });
userSchema.index({ status: 1 });

module.exports = mongoose.model('User', userSchema);
