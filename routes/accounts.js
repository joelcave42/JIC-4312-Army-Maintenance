const express = require("express");
const router = express.Router();
const { createAccount, createAccountAsSupervisor, getAccounts, loginUser, getUnapprovedAccounts, approveAccount, updateCompany, getAccountInfoById } = require("../controllers/accounts");

const Account = require ("../models/Account")



// Routes


router.get("/user-info", async (req, res) => {


    try {
        const { username } = req.query;

        if(!username) {
            return res.status(400).json({ success: false, message: "Username required" });
        }

        const user = await Account.findOne({ username });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ accountType: user.accountType , userID: user._id });

    } catch(error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});


router.route("/")
    .post(createAccount) // General account creation
    .get(getAccounts);   // Get all accounts

router.route("/supervisor")
    .post(createAccountAsSupervisor); // Supervisor-specific route for account creation

router.route("/login")
    .post(loginUser); // Login route

router.route("/unapproved")
    .get(getUnapprovedAccounts); // Get all unapproved accounts

router.route("/approve/:userId")
    .put(approveAccount); // Approve an account

router.route("/company")
    .patch(updateCompany);

router.route("/account-info")
    .get(getAccountInfoById);

module.exports = router;
