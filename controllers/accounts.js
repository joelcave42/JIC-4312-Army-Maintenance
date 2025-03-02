const bcrypt = require("bcryptjs");
const Account = require('../models/Account');

// Create a new account
const createAccount = async (req, res) => {
    try {
        const { username, password, accountType } = req.body;

        // Regular account creation (for admin or default roles)
        const account = new Account({ username, password, accountType });
        await account.save();
        res.status(201).json({ success: true, data: account });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Create account as a supervisor
const createAccountAsSupervisor = async (req, res) => {
    try {
        const { username, password, accountType } = req.body;

        // Validate that the account type is not another supervisor
        if (accountType === "supervisor") {
            return res.status(400).json({ success: false, message: "Cannot create another supervisor" });
        }

        const account = new Account({ username, password, accountType });
        await account.save();

        res.status(201).json({ success: true, data: account });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get all accounts
const getAccounts = async (req, res) => {
    try {
        const accounts = await Account.find({});
        res.status(200).json({ success: true, data: accounts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all unnaproved accounts
const getUnapprovedAccounts = async (req, res) => {
    try {
        const accounts = await Account.find({ isActive: false });
        res.status(200).json({ success: true, data: accounts });

    } catch(error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Allows supervisor to approve accounts
const approveAccount = async (req, res) => {
    try { 
        const userId = req.params.userId;

        const user = await Account.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.isActive) {
            return res.status(400).json({ success: false, message: "User is already active" });
        }

        user.isActive = true; 
        await user.save(); 

        res.status(200).json({ success: true, message: "Account approved", data: user });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



// Login user
const loginUser = async (req, res) => {
    try {

        const { username, password } = req.body;

        // Check if the user exists
        const user = await Account.findOne({ username });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, message: "Supervisor must verify account before you can login" });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // Successful login
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                username: user.username,
                accountType: user.accountType,
                userID: user._id,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createAccount,
    createAccountAsSupervisor,
    getAccounts,
    loginUser,
    getUnapprovedAccounts,
    approveAccount,
};
