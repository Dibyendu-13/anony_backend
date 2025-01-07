const mongoose = require('mongoose');

const discussionMessageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  username: { type: String, required: true },

  sender: { type: String, required: true },
  discussion: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const DiscussionMessage = mongoose.model('DiscussionMessage', discussionMessageSchema);

module.exports = DiscussionMessage;
