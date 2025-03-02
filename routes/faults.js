const express = require("express");
const router = express.Router();
const { getAllFaults, getPendingFaults, getCompletedFaults, addFault, getFault, updateFault, markFaultCorrected, deleteFault, getOperatorFaults } = require("../controllers/faults");

router.route("/operator/:username").get(getOperatorFaults);
router.route("/").get(getAllFaults).post(addFault);
router.route("/pending").get(getPendingFaults);
router.route("/completed").get(getCompletedFaults);
router.route("/:id").get(getFault).patch(updateFault).delete(deleteFault); // Ensure this line exists
router.route("/:id/correct").patch(markFaultCorrected);

module.exports = router;
