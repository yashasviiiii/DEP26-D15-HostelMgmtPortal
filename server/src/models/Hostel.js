import mongoose from "mongoose";

const hostelSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    unique:true,
    trim: true,
    set: v => v.toUpperCase()
  },

  type: { 
    type: String, 
    enum: ["Boys", "Girls", "Mixed"], 
    default: "Mixed" 
  },

  totalRooms: { 
    type: Number, 
    default: 0 
  },

  roomConfigs: [
    {
      capacity: { 
        type: Number, 
        required: true,
        min: 1
      },

      rooms: { 
        type: Number, 
        required: true,
        min: 1
      }
    }
  ]

}, { timestamps: true });


hostelSchema.pre("save", async function() {
  if (this.isModified('roomConfigs')) {
    this.totalRooms = this.roomConfigs.reduce(
      (sum, config) => sum + (Number(config.rooms) || 0),
      0
    );
  }
});


hostelSchema.index({ name: 1, type: 1 }, { unique: true });


export default mongoose.model("Hostel", hostelSchema);