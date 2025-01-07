const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    topic: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the User model
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Discussion = mongoose.model('Discussion', discussionSchema);

module.exports = Discussion;
