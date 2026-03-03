const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    passwordHash: {
        type: String,
        required: [true, 'Password is required']
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: [true, 'Company is required']
    },
    role: {
        type: String,
        enum: ['super_admin', 'company_admin'],
        default: 'company_admin'
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

// Hash password before saving
adminSchema.pre('save', async function (next) {
    if (!this.isModified('passwordHash')) {
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
adminSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Index for faster queries
adminSchema.index({ username: 1 });
adminSchema.index({ email: 1 });
adminSchema.index({ companyId: 1 });

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
