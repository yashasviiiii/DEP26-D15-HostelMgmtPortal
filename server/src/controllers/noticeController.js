import Notice from "../models/Notice.js";
import { processAndSaveFile } from "../utils/localUpload.js";
import { sendNotification } from "../utils/sendNotification.js"; 
import User from "../models/User.js";

export const createNotice = async (req, res) => {
    try {
        const { title, content, category, isPinned } = req.body;
        
        // Handle Links Parsing
        let parsedLinks = [];
        if (req.body.links) {
            try {
                parsedLinks = JSON.parse(req.body.links);
            } catch (e) {
                parsedLinks = [];
            }
        }

        // Handle File Attachments for Local Storage
        const fileAttachments = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                // Process each file (Resize if image, save as-is if PDF)
                const savedPath = await processAndSaveFile(file, 'notices');
                
                fileAttachments.push({
                    fileName: file.originalname,
                    fileType: file.mimetype,
                    url: savedPath // This now stores the local path like /uploads/notices/...
                });
            }
        }

        // Author and Hostel are pulled from the 'auth' middleware
        const newNotice = new Notice({
            title,
            content,
            author: req.user._id,
            hostel: req.user.hostelId || null, // Allow unassigned caretaker to create notice
            links: parsedLinks,
            attachments: fileAttachments,
            category: category || "Events",
            isPinned: isPinned === 'true' || isPinned === true,
        });

        await newNotice.save();
        // Only send if the notice is associated with a hostel
        if (newNotice.hostel) {
            try {
                // 1. Find all students in this hostel
                const students = await User.find({ 
                    hostelId: newNotice.hostel, 
                    role: 'student' 
                });

                // 2. Define the message payload
                const payload = {
                    title: `📢 New ${newNotice.category} Notice`,
                    body: newNotice.title,
                    url: "/dashboard/student/notices"
                };

                // 3. Send to each student's devices
                // We use Promise.all to handle multiple students concurrently
                await Promise.all(
                    students.map(student => sendNotification(student, payload))
                );
            } catch (notifyError) {
                // We log the error but don't stop the request 
                // because the notice itself was successfully created
                console.error("Push Notification Error:", notifyError);
            }
        }
        
        res.status(201).json({ msg: "Notice posted successfully", notice: newNotice });
    } catch (error) {
        console.error("Notice Creation Error:", error);
        res.status(500).json({ msg: "Error creating notice", error: error.message });
    }
};

export const getNotices = async (req, res) => {
  try {
    const { hostel } = req.query;
    
    let query = {};

    if (hostel) {
      query = { hostel: { $in: [hostel, null] } };
    } else if (req.user) {
      if (req.user.role === 'admin') {
        query = {}; // Admin sees all notices
      } else if (req.user.hostelId) {
        query = { hostel: { $in: [req.user.hostelId, null] } };
      } else {
        query = { hostel: null };
      }
    } else {
      query = { hostel: null };
    }

    const notices = await Notice.find(query)
      .select("title content category isPinned createdAt attachments links author")
      .populate("author", "name role")
      .sort({ isPinned: -1, createdAt: -1 })
      .lean();

    res.status(200).json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateNotice = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedNotice = await Notice.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedNotice) return res.status(404).json({ msg: "Notice not found" });
        res.json(updatedNotice);
    } catch (error) {
        res.status(500).json({ msg: "Error updating notice", error: error.message });
    }
};

export const deleteNotice = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedNotice = await Notice.findByIdAndDelete(id);
        if (!deletedNotice) return res.status(404).json({ msg: "Notice not found" });
        res.json({ msg: "Notice deleted successfully" });
    } catch (error) {
        res.status(500).json({ msg: "Error deleting notice", error: error.message });
    }
};