// Import necessary modules
import jwt from 'jsonwebtoken';
import Admin from '../models/admin.model.js'; // Adjust the path as needed

// Secret key for JWT, should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify the admin token and details
export const verifyAdminToken = async (req, res, next) => {
  // Extract token from headers
  const token = req.headers['authorization']?.split(' ')[1]; // Assuming Bearer token

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(decoded);
    console.log(decoded);
    console.log(decoded);
    

    // Fetch the admin details from the database
    const admin = await Admin.findOne({email: decoded.email}); // Assuming the token contains admin ID
    console.log(admin);
    
    
    if (!admin) {
      return res.status(401).json({ message: 'Invalid token or admin not found' });
    }

    // Add admin details to request object for further use
    req.admin = admin;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: 'Invalid token' });
    
  }
};

// Middleware to verify token details (username and email)
export const verifyAdminDetails = (requiredUsername, requiredEmail) => async (req, res, next) => {
  try {
    const { admin } = req;

    if (requiredUsername && admin.username !== requiredUsername) {
      return res.status(403).json({ message: 'Username does not match' });
    }

    if (requiredEmail && admin.email !== requiredEmail) {
      return res.status(403).json({ message: 'Email does not match' });
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Error verifying admin details' });
  }
};
