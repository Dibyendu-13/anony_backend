// discussionRoutes.js
const express = require('express');
const discussionController = require('../controllers/discussionController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Fetch all discussions for a specific topic
router.get('/:discussionId', authMiddleware, discussionController.getDiscussionsByTopic);
router.post('/:discussionId', authMiddleware, discussionController.createDiscussion);


module.exports = router;
