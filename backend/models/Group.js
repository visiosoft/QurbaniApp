const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    groupName: {
        type: String,
        required: [true, 'Group name is required'],
        trim: true
    },
    representative: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Representative is required']
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    qurbaniType: {
        type: String,
        enum: ['Sheep'],
        default: 'Sheep',
        required: [true, 'Qurbani type is required']
    },
    status: {
        type: String,
        enum: ['pending', 'ready', 'done'],
        default: 'ready'
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


// Virtual for member count
groupSchema.virtual('memberCount').get(function () {
    return this.members.length;
});

// Index for faster queries
groupSchema.index({ qurbaniType: 1 });
groupSchema.index({ status: 1 });

module.exports = mongoose.model('Group', groupSchema);
