const jwt = require('jsonwebtoken');
const JWT_SECRET = 'supergizli';

function authRequired(...roles) {
  return (req, res, next) => {
    const auth = req.headers['authorization'];
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token gerekli' });
    }

    try {
      const token = auth.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Yetkin yok' });
      }

      req.user = decoded;
      next();
    } catch {
      return res.status(401).json({ message: 'Token geçersiz' });
    }
  };
}

module.exports = { authRequired };
