const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Required schema for account objects
const AccountSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    accountType: {
        type: String,
        enum: ['clerk', 'maintainer', 'manager', 'operator', 'supervisor'],
        required: true,
    },
    isActive: {type: Boolean, default: false, required: false},
    company: { type: String, required: false },
});

// Pre-save hook to hash password
AccountSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to verify password
AccountSchema.methods.verifyPassword = async function (inputPassword) {
    return await bcrypt.compare(inputPassword, this.password);
};

// Static method for supervisor to create a new user
AccountSchema.statics.createUser = async function (supervisorId, userDetails) {
    const supervisor = await this.findById(supervisorId);
    if (!supervisor || supervisor.accountType !== 'supervisor') {
        throw new Error('Only supervisors can create accounts');
    }

    // Validate accountType if needed
    if (userDetails.accountType === 'supervisor') {
        throw new Error('Supervisors cannot create other supervisors');
    }

    const newUser = new this(userDetails);
    return await newUser.save();
};

// Static method for supervisor to activate a user
AccountSchema.statics.activateUser = async function (supervisorId, userId) {
    const supervisor = await this.findById(supervisorId);
    if (!supervisor || supervisor.accountType !== 'supervisor') {
        throw new Error('Only supervisors can activate accounts');
    }

    const user = await this.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    if (user.isActive) {
        throw new Error('User is already active');
    }

    user.isActive = true;
    await user.save();
    return user;

}

module.exports = mongoose.model("Account", AccountSchema);
