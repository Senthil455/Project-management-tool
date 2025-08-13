import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const getRoleForProject = (project, userId) => {
  if (!project) return null;
  if (project.lead && project.lead.toString() === userId.toString()) return 'admin';
  const member = (project.members || []).find(
    (m) => m.user && m.user.toString() === userId.toString()
  );
  return member ? member.role : null;
};

export const requireProjectAccess = (minRole = 'viewer') => {
  return (req, res, next) => {
    const role = getRoleForProject(req.project, req.user._id);
    if (!role) {
      return res.status(403).json({ message: 'You are not a member of this project' });
    }
    const roleLevel = { viewer: 1, member: 2, admin: 3 };
    if (roleLevel[role] < roleLevel[minRole]) {
      return res.status(403).json({
        message: `You need at least "${minRole}" role to perform this action`,
      });
    }
    next();
  };
};
