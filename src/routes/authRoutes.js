const router = require('express').Router();
const authController = require('../controllers/authController');

// Kullanıcı kaydı
router.post('/register', authController.register);

// Kullanıcı girişi
router.post('/login', authController.login);

module.exports = router;
