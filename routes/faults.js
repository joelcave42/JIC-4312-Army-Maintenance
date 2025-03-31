const express = require("express");
const router = express.Router();
const { getAllFaults, getPendingFaults, getCompletedFaults, addFault, getFault, updateFault, markFaultInProgress, markFaultAwaitingPart, markFaultCorrected, deleteFault, getOperatorFaults, claimFault, addFaultComment, undoDeleteFault, markFaultValidated } = require("../controllers/faults");

// Add this console log to see all routes being registered
console.log('Registering fault routes...');

router.route("/operator/:username").get(getOperatorFaults);
router.route("/").get(getAllFaults).post(addFault);
router.route("/pending").get(getPendingFaults);
router.route("/completed").get(getCompletedFaults);
router.route("/:id").get(getFault).patch(updateFault).delete(deleteFault);
router.route("/:id/validated").patch(markFaultValidated);
router.route("/:id/in-progress").patch(markFaultInProgress);
router.route("/:id/awaiting-part").patch(markFaultAwaitingPart);
router.route("/:id/correct").patch(markFaultCorrected);
router.route("/:id/claim").patch(claimFault);
router.route("/:id/comment").patch(addFaultComment);
router.route("/:id/undo-delete").patch(undoDeleteFault);

// Add this to see all registered routes
console.log('Routes registered:', router.stack.map(r => r.route?.path).filter(Boolean));

module.exports = router;
