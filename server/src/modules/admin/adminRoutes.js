const express = require('express');
const {
    getAllUsers,
    promoteUserToAdmin,
    removeUser,
    getAdminStats
} = require('../admin/adminController');
const { requireAdmin } = require('../middleware/roleCheck');

const router = express.Router();

router.use(requireAdmin);

router.get('/users', getAllUsers);
router.post('/users/promote', promoteUserToAdmin);
router.delete('/users/:userId', removeUser);
router.get('/stats', getAdminStats);

module.exports = router;