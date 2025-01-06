const ChatRoom = require("../models/ChatRoom");
const ChatMessage = require("../models/ChatMessage");

// Send a message in a chat room
exports.sendMessage = async (req, res) => {
  try {
    const { chatRoomId, content } = req.body;

    // Validate input
    if (!chatRoomId || !content) {
      return res.status(400).json({ error: "Chat room ID and content are required." });
    }

    // Validate chat room existence
    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({ error: "Chat room not found." });
    }

    // Validate user authorization
    if (!chatRoom.participants.includes(req.user.id)) {
      return res.status(403).json({ error: "You are not authorized to send messages in this chat room." });
    }

    // Check total messages in the room
    const totalMessages = await ChatMessage.countDocuments({ chatRoomId });

    // Check messages sent by the current user
    const userMessages = await ChatMessage.countDocuments({ chatRoomId, sender: req.user.id });

    // Enforce limits: Close room if total messages >= 10 or user messages >= 5
    if (totalMessages >= 10 || userMessages >= 5) {
      // Delete the chat room
      await ChatRoom.findByIdAndDelete(chatRoomId);

      // Notify all participants that the room is closed
      req.io.to(chatRoomId).emit("room-closed", {
        message: "Chat room has been closed due to message limits.",
      });

      // Respond to the user
      return res.status(200).json({ message: "Chat room closed due to message limits." });
    }

    // Create and save the message
    const message = await ChatMessage.create({
      chatRoomId,
      sender: req.user.id,
      content,
    });

    // Broadcast the message to the room
    const populatedMessage = await message.populate("sender", "username");
    req.io.to(chatRoomId).emit("new-message", populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error("Error sending message:", err.message);
    res.status(500).json({ error: "An error occurred while sending the message." });
  }
};


// Get all messages in a chat room
exports.getMessages = async (req, res) => {
  const { chatRoomId } = req.params;

  try {
    // Validate chat room existence
    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({ error: "Chat room not found." });
    }

    // Validate user authorization
    if (!chatRoom.participants.includes(req.user.id)) {
      return res.status(403).json({ error: "You are not authorized to view messages in this chat room." });
    }

    // Fetch messages for the chat room, sorted by creation time (oldest first)
    const messages = await ChatMessage.find({ chatRoomId })
      .sort({ createdAt: 1 })
      .populate("sender", "username email"); // Optional: Populate sender details

    res.status(200).json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err.message);
    res.status(500).json({ error: "An error occurred while fetching messages." });
  }
};

// Delete a chat room and its messages
exports.deleteChatRoom = async (req, res) => {
  const { chatRoomId } = req.params;

  try {
    // Validate chat room existence
    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({ error: 'Chat room not found.' });
    }

    // Validate user authorization (e.g., only admin or participants can delete)
    if (!chatRoom.participants.includes(req.user.id)) {
      return res.status(403).json({ error: 'You are not authorized to delete this chat room.' });
    }

    // Delete all messages in the chat room
    await ChatMessage.deleteMany({ chatRoomId });

    // Delete the chat room itself
    await ChatRoom.findByIdAndDelete(chatRoomId);

    res.status(200).json({ message: 'Chat room and all associated messages have been deleted successfully.' });
  } catch (error) {
    console.error('Error deleting chat room:', error.message);
    res.status(500).json({ error: 'Failed to delete chat room. Please try again.' });
  }
};