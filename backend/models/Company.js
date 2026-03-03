const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: [true, 'Company name is required'],
        unique: true,
        trim: true
    },
    companyCode: {
        type: String,
        required: [true, 'Company code is required'],
        unique: true,
        uppercase: true,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    contactPerson: {
        type: String,
        trim: true
    },
    contactNumber: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
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

// Index for faster searches
companySchema.index({ companyName: 1 });
companySchema.index({ companyCode: 1 });

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
