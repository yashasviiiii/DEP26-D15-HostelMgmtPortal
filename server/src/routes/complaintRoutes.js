import express from "express";
const router = express.Router();
import { createComplaint, getMyComplaints, getCaretakerComplaints, toggleUpvote, bulkUpdateComplaints, submitStudentSlots, scheduleVisit, resolveOrReset, quickResolve, getStudentHistory, requestReschedule, deleteComplaint, sendReminder, rejectComplaint } from "../controllers/complaintController.js";
import { protect, caretakerOnly, allowRoles } from "../middleware/auth.js"; // Your JWT protector
import Complaint from "../models/Complaint.js";

router.post("/", protect, createComplaint);
router.get("/my-complaints", protect, getMyComplaints);



router.get("/caretaker", protect, allowRoles("caretaker", "warden"), getCaretakerComplaints);
router.patch("/bulk-update", protect, caretakerOnly, bulkUpdateComplaints);

// Add 'sendReminder' to your imports at the top
// ...
router.post("/:id/remind", protect, sendReminder);
router.get("/:id/history", protect, caretakerOnly, getStudentHistory);
router.patch("/:id/upvote", protect, toggleUpvote);
router.patch("/:id/submit-slots", protect, submitStudentSlots);
router.patch("/:id/schedule-visit", protect, caretakerOnly, scheduleVisit);
router.patch("/:id/resolve-reset", protect, caretakerOnly, resolveOrReset);
router.patch("/:id/reject", protect, caretakerOnly, rejectComplaint);
router.patch("/:id/quick-resolve", protect, quickResolve);
router.patch("/:id/reschedule",protect, requestReschedule)
router.patch("/:id/manage", protect, async (req, res) => {
  try {
    const { action, reason } = req.body; 
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    if (action === "Resolve") {
      complaint.status = "Resolved";
      // Ensure your schema has a 'timeline' object and 'resolvedAt' field
      if (!complaint.timeline) complaint.timeline = {}; 
      complaint.timeline.resolvedAt = new Date();
    } 
    else if (action === "Reject") {
      complaint.status = "Rejected";
      complaint.rejectionReason = reason;
      if (!complaint.timeline) complaint.timeline = {};
      complaint.timeline.resolvedAt = new Date(); 
    }
    else if (action === "Get Slot") {
      complaint.status = "Get Slot";
      complaint.scheduledVisit = undefined;
    }
    
    await complaint.save();
    res.json({ message: `Complaint ${action}ed successfully`, complaint });
  } catch (error) {
    // Log the ACTUAL error to your terminal so you can see what failed
    console.error("Database Update Error:", error); 
    res.status(500).json({ message: "Update failed", details: error.message });
  }
});
router.delete('/:id', protect, deleteComplaint);
export default router;