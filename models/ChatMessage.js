const mongoose = require("mongoose");

const ChatMessageSchema = new mongoose.Schema(
  {
    chatRoomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom", // Reference the ChatRoom model
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference the User model
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true, // Removes extra spaces
    },
    type: {
      type: String,
      enum: ['user', 'system'], // Allow for future expansion
      default: 'user',
    },
  },
  {
    timestamps: true, // Automatically include createdAt and updatedAt
  }
);

// Indexes for efficient querying
ChatMessageSchema.index({ chatRoomId: 1 });
ChatMessageSchema.index({ chatRoomId: 1, sender: 1 });

module.exports = mongoose.model("ChatMessage", ChatMessageSchema);
