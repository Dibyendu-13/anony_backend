const Discussion = require('../models/Discussion');
const User = require('../models/User'); // Assuming you have a User model for author validation

// Fetch all discussions for a given topic
exports.getDiscussionsByTopic = async (req, res) => {
  const { topic } = req.params;

  try {
    // Fetch discussions filtered by topic, populate author details, and limit to some number of discussions if needed
    const discussions = await Discussion.find({ topic })
      .populate('author', 'username') // Populate with author details
      .exec();

    if (discussions.length === 0) {
      return res.status(404).json({ message: 'No discussions found for this topic' });
    }

    res.status(200).json({ discussions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Post a message under a specific topic
exports.postMessage = async (req, res) => {
  const { topic } = req.params;
  const { content } = req.body;

  // Input validation
  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Content cannot be empty' });
  }

  try {
    // Fetch the author from the authenticated user in req.user (authMiddleware should set this)
    const author = req.user.id;

    // Create a new discussion message
    const newMessage = new Discussion({
      content,
      author,
      topic,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Create a new discussion under a specific topic (Only need topic name)
exports.createDiscussion = async (req, res) => {
  const { discussionId } = req.params;
  console.log('Received create discussion message:', discussionId);


  // Validate topic presence
  if (!discussionId) {
    return res.status(400).json({ error: 'Topic is required' });
  }
  try {
    // Fetch the author from the authenticated user in req.user (authMiddleware should set this)
    const author = req.user.id;

    // Generate default title and description (or customize as needed)
    const title = `${discussionId} Discussion`;
    const description = `Discuss anything related to ${discussionId}`;

    // Create a new discussion
    const newDiscussion = new Discussion({
      title,
      description,
      topic: discussionId,
      author,
    });

    await newDiscussion.save();
    res.status(201).json(newDiscussion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};
