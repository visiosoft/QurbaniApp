const mongoose = require('mongoose');

const qurbaniSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        default: null
    },
    qurbaniType: {
        type: String,
        enum: ['Sheep', 'Cow', 'Camel'],
        required: [true, 'Qurbani type is required']
    },
    accountType: {
        type: String,
        enum: ['individual', 'group'],
        required: [true, 'Account type is required']
    },
    status: {
        type: String,
        enum: ['pending', 'ready', 'done'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    readyAt: {
        type: Date,
        default: null
    },
    completedAt: {
        type: Date,
        default: null
    },
    notes: {
        type: String,
        default: ''
    }
}, { timestamps: true });

// Validation: Either userId or groupId must be present
qurbaniSchema.pre('save', function (next) {
    if (!this.userId && !this.groupId) {
        return next(new Error('Either userId or groupId must be provided'));
    }

    if (this.userId && this.groupId) {
        return next(new Error('Only one of userId or groupId should be provided'));
    }

    next();
});

// Index for faster queries
qurbaniSchema.index({ userId: 1 });
qurbaniSchema.index({ groupId: 1 });
qurbaniSchema.index({ qurbaniType: 1 });
qurbaniSchema.index({ status: 1 });
qurbaniSchema.index({ accountType: 1 });

module.exports = mongoose.model('Qurbani', qurbaniSchema);
