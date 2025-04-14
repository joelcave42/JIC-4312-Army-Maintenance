const bcrypt = require("bcryptjs");
const Account = require('../models/Account');

// Create a new account
const createAccount = async (req, res) => {
    try {
        const { username, password, accountType, company } = req.body;

        // Regular account creation (for admin or default roles)
        const account = new Account({ username, password, accountType, company });
        await account.save();
        res.status(201).json({ success: true, data: account });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Create account as a supervisor
const createAccountAsSupervisor = async (req, res) => {
    try {
        const { username, password, accountType, company } = req.body;

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
                company: user.company,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateCompany = async (req, res) => {
    try {
        const { requesterId, userId, newCompany } = req.body;

        if (!requesterId || !userId || !newCompany) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const user = await Account.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const requester = await Account.findById(requesterId);
        if (!requester) {
            return res.status(404).json({ success: false, message: "Requester not found" });
        }

        const isSelf = requesterId.toString() === userId.toString();
        const isSupervisor = requester.accountType === "supervisor";

        if (!isSelf && !isSupervisor) {
            return res.status(403).json({ success: false, message: "Only the account owner or a supervisor can update the company" });
        }

        user.company = newCompany;
        await user.save();

        res.status(200).json({ success: true, message: "Company updated successfully", data: user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getAccountInfoById = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const user = await Account.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            data: {
                userID: user._id,
                username: user.username,
                accountType: user.accountType,
                company: user.company,
            }
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
    updateCompany,
    getAccountInfoById,
};
