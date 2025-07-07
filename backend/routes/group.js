const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group');

router.post('/create', groupController.createGroup);
router.post('/add-member', groupController.addMemberToGroup);
router.get('/user/:userId', groupController.getUserGroups);
router.get('/:groupId/members', groupController.getGroupMembers);

module.exports = router;