const express = require('express');
const { signup, login } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);


router.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Protected content accessed', userId: req.userId });
});

module.exports = router;
