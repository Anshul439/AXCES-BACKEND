import jwt from 'jsonwebtoken';
import Admin from '../models/admin.model.js';

const adminMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(verified.id);
    if (!admin) return res.status(401).json({ message: 'Access Denied' });

    req.admin = admin;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};

const adminCheck = (req, res, next) => {
  if (req.admin.role !== 'admin') {
    return res.status(403).json({ message: 'Access Denied: Admins Only' });
  }
  next();
};

export { adminMiddleware, adminCheck };
