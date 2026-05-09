import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  hostel: { type: mongoose.Schema.Types.ObjectId, ref: "Hostel" }, // removed required: true
  category: { 
    type: String, 
    enum: ["Academic", "Maintenance", "Events", "Other"],
    default: "Events" 
  },
  isPinned: { type: Boolean, default: false },
  
  // For images and documents (PDFs, Docx, etc.)
  attachments: [{
    url: { type: String, required: true },
    fileType: { type: String }, // e.g., "image", "pdf"
    fileName: { type: String }  // e.g., "water_outage_schedule.pdf"
  }],

  // For external resources
  links: [{
    label: { type: String }, // e.g., "Register here"
    url: { type: String }
  }],

  priority: { type: String, enum: ["normal", "urgent"], default: "normal" }
}, { timestamps: true });

noticeSchema.index({ hostel: 1, createdAt: -1 })
export default mongoose.model("Notice", noticeSchema);