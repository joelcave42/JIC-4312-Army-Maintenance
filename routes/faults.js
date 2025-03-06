const express = require("express");
const router = express.Router();
const { getAllFaults, getPendingFaults, getCompletedFaults, addFault, getFault, updateFault, markFaultInProgress, markFaultAwaitingPart, markFaultCorrected, deleteFault, getOperatorFaults, claimFault } = require("../controllers/faults");

router.route("/operator/:username").get(getOperatorFaults);
router.route("/").get(getAllFaults).post(addFault);
router.route("/pending").get(getPendingFaults);
router.route("/completed").get(getCompletedFaults);
router.route("/:id").get(getFault).patch(updateFault).delete(deleteFault); // Ensure this line exists
router.route("/:id/in-progress").patch(markFaultInProgress);
router.route("/:id/awaiting-part").patch(markFaultAwaitingPart);
router.route("/:id/correct").patch(markFaultCorrected);
router.route("/:id/claim").patch(claimFault);

module.exports = router;
