import Admin from '../models/admin.model.js';
import User from '../models/user.model.js';
import Property from '../models/property.model.js';
import { errorHandler } from '../utils/error.js';
import Coins from "../models/coins.model.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const HARD_CODED_SECRET_TOKEN = 'ADMIN'; // Hard-coded token for verification

// Admin Sign-In Function
export const signinAdmin = async (req, res) => {
  const { token, username, password } = req.body;

  // Verify the hard-coded token
  if (token !== HARD_CODED_SECRET_TOKEN) {
    return res.status(403).json({ message: 'Invalid hard-coded token' });
  }

  try {
    // Check if admin exists
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, username: admin.username, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Set token expiration time as needed
    );

    // Send token back in the response
    res.status(200).json({ message: 'Sign in successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};




// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get User Details
export const getUserDetails = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Update User
export const updateUser = async (req, res) => {
  const { userId } = req.params;
  const {name, email} = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { name, email } },
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};




// View All Properties
export const viewAllProperties = async (req, res, next) => {
  try {
    const properties = await Property.find();
    res.status(200).json({
      code: 200,
      data: properties,
      message: "All properties fetched successfully"
    });
  } catch (error) {
    console.error("Error fetching all properties:", error);
    next(errorHandler(500, res, "Something went wrong"));
  }
};

// View Property Details
export const viewPropertyDetails = async (req, res, next) => {
  const { propertyId } = req.params;

  try {
    const property = await Property.findById(propertyId);
    if (!property) {
      return next(errorHandler(404, res, "Property not found"));
    }

    res.status(200).json({
      code: 200,
      data: property,
      message: "Property details fetched successfully"
    });
  } catch (error) {
    console.error("Error fetching property details:", error);
    next(errorHandler(500, res, "Something went wrong"));
  }
};

// Update Property
export const updateProperty = async (req, res, next) => {
  const { propertyId } = req.params;
  const updateFields = req.body;

  try {
    const property = await Property.findById(propertyId);
    if (!property) {
      return next(errorHandler(404, res, "Property not found"));
    }

    // Update each field individually
    Object.keys(updateFields).forEach((field) => {
      property[field] = updateFields[field];
    });

    await property.save();

    res.status(200).json({
      code: 200,
      data: property,
      message: "Property updated successfully"
    });
  } catch (error) {
    console.error("Error updating property:", error);
    next(errorHandler(500, res, "Something went wrong"));
  }
};



// Update a user's coin balance as admin
export const adminUpdateBalance = async (req, res, next) => {
  const { userId } = req.params; // Admin provides the user ID
  const { amount } = req.body; // Amount to update the balance with

  try {
    let coins = await Coins.findOne({ userId });

    if (!coins) {
      coins = new Coins({ userId, balance: 0 }); // Initialize with balance 0 or any default value
    }

    coins.balance += amount;
    await coins.save();

    res.status(200).json({ code: 200, data: { balance: coins.balance }, message: "Coins updated successfully." });
  } catch (error) {
    console.error("Error updating balance:", error);
    next(error);
  }
};




// Utility function to parse date in DD/MM/YYYY format
const parseDate = (dateStr) => {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
};

export const adminGetTransactions = async (req, res, next) => {
  const { userId } = req.params;
  const { startDate, endDate } = req.body;

  try {
    // Parse startDate and endDate
    const start = parseDate(startDate);
    start.setHours(0, 0, 0, 0); // Set start time to 12:00 AM

    const end = parseDate(endDate);
    end.setHours(23, 59, 59, 999); // Set end time to 11:59 PM

    console.log(`Fetching transactions from ${start} to ${end}`);

    // Fetch the coins document
    const coins = await Coins.findOne({ userId });

    if (!coins) {
      return res.status(404).json({ code: 404, data: {}, message: "Coins not found for this user." });
    }

    // Filter transactions within the specified date range
    const transactions = coins.transactions.filter(transaction =>
      new Date(transaction.timestamp) >= start && new Date(transaction.timestamp) <= end
    );

    console.log('Filtered Transactions:', transactions);

    if (!transactions.length) {
      return res.status(404).json({ code: 404, data: {}, message: "No transactions found for this user in the specified period." });
    }

    res.status(200).json({ code: 200, data: { transactions }, message: "Transactions fetched successfully." });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    next(error);
  }
};





export const updateDefaultCoinValues = async (req, res, next) => {
  const { newDefaultPropertyPostCost, newDefaultOwnerDetailsCost } = req.body;

  try {
    // Prepare the update object
    const updateFields = {};

    if (newDefaultPropertyPostCost !== undefined) {
      // Ensure the new default value is a valid number
      if (typeof newDefaultPropertyPostCost !== 'number' || newDefaultPropertyPostCost < 0) {
        return res.status(400).json({ code: 400, message: "Invalid property post coin value" });
      }
      updateFields.defaultPropertyPostCost = newDefaultPropertyPostCost;
    }

    if (newDefaultOwnerDetailsCost !== undefined) {
      // Ensure the new default value is a valid number
      if (typeof newDefaultOwnerDetailsCost !== 'number' || newDefaultOwnerDetailsCost < 0) {
        return res.status(400).json({ code: 400, message: "Invalid owner details coin value" });
      }
      updateFields.defaultOwnerDetailsCost = newDefaultOwnerDetailsCost;
    }

    // Check if there are fields to update
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ code: 400, message: "No fields to update" });
    }

    // Update the default coin values in the Coins collection
    const updatedCoinConfig = await Coins.updateOne({}, { $set: updateFields });

    if (updatedCoinConfig.nModified === 0) {
      return res.status(404).json({ code: 404, message: "Failed to update default coin values" });
    }

    res.status(200).json({ code: 200, message: "Default coin values updated successfully" });
  } catch (error) {
    console.error("Error updating default coin values:", error);
    next(error);
  }
};


