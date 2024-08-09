import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/admin.model.js';
import User from '../models/user.model.js';
import Property from '../models/property.model.js';
import { errorHandler } from '../utils/error.js';
import Coins from "../models/coins.model.js";


export const createAdmin = async (req, res) => {
  const { username, password, email } = req.body;

  try {
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin document
    const admin = new Admin({
      username,
      password: hashedPassword,
      email,
    });

    // Save the admin document
    await admin.save();

    res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};


// Admin Sign-in
export const signinAdmin = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ isAdmin: true }, process.env.JWT_SECRET);

    // Update last login time
    admin.last_login = new Date();
    await admin.save();

    res.status(200).json({ token });
  } catch (error) {
    next(error)
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


// Admin get user's transactions for the last month
export const adminGetTransactions = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1); // Set the start date to one month ago

    const coins = await Coins.findOne({ userId });

    if (!coins) {
      return res.status(404).json({ code: 404, data: {}, message: "Coins not found for this user." });
    }

    const transactions = coins.transactions.filter(transaction => 
      transaction.timestamp >= start && transaction.timestamp <= end
    );

    if (!transactions.length) {
      return res.status(404).json({ code: 404, data: {}, message: "No transactions found for this user in the last month." });
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


