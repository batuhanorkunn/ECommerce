const { User } = require('../models/User');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'supergizli';

module.exports = {
  register: async (req, res) => {
    const { fullName, email, password, role } = req.body;
    try {
      // Role kontrolü (sadece 'user' veya 'admin' kabul)
      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Geçersiz rol' });
      }

      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: 'Email kayıtlı' });

      const user = await User.create({ fullName, email, password, role });
      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({ user, token });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(400).json({ message: 'Geçersiz bilgiler' });
      }

      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ user, token });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};
