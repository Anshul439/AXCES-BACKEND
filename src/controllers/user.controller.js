import User from "../models/user.model.js";
import Coins from "../models/coins.model.js";
import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/error.js";
import dotenv from 'dotenv';
dotenv.config();

export const createProfile = async (req, res, next) => {
  try {
    const { number } = req.body;
    // Check if user exists with the given phone number

    let user = await User.findOne({ number });

    if (user) {
      // User exists, return user details with token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

      return res.status(200).json({
        status: "success",
        data: { id: user._id, name: user.name, email: user.email, token },
        message: "User found successfully",
      });
    } else {
      const { number, name, email } = req.body;
      if (!number || !name || !email) {
        return next(
          errorHandler(400, res, "Please provide all the required fields")
        );
      }

      user = await User.findOne({ email });

      if (user) {
        return next(errorHandler(400, res, "email already exists"));
      }
      // User does not exist, create a new profile
      user = new User({ number, name, email });
      await user.save();

      const coins = new Coins({ userId: user._id });
      await coins.save();

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

      return res.status(201).json({
        status: "success",
        data: { id: user._id, name: user.name, email: user.email, token },
        message: "User registered successfully",
      });
    }
  } catch (error) {
    console.error("Error handling user:", error);
    next(error);
  }
};

export const verifyNumber = async (req, res, next) => {
  try {
    const { number } = req.body;
    // Check if user exists with the given phone number

    let user = await User.findOne({ number });

    if(!number) {
      return next(errorHandler(400, res, "Number is required"));
    }

    if (user) {
      // User exists, return user details with token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

      return res.status(200).json({
        status: "success",
        data: { id: user._id, name: user.name, email: user.email, token },
        message: "User found successfully",
      });
    } else {
      return next(errorHandler(404, res, "User not found"));
    }
  } catch (error) {
    console.error("Error handling user:", error);
    next(error);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { otp } = req.body;

    if (!otp || !/^\d{6}$/.test(otp)) {
      return next(errorHandler(400, res, "It must be a 6-digit number."));
    }

    // Simulate OTP verification and always return success
    return res.status(200).json({
      status: "success",
      message: "OTP verified successfully"
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    next(error);
  }
};


export const updateUserProfile = async (req, res, next) => {
  const { name, email } = req.body;
  console.log(req.user);
  try {
    // Find and update the user by ID from the decoded token
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { name, email } },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      code: 200,
      data: user,
      message: "Success",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    next(error);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    // Fetch user details by ID from the decoded token
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return next(errorHandler(404, res, "User not found"));
    }

    res.status(200).json({
      code: 200,
      data: user,
      message: "Success",
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    next(error);
  }
};


import fetch from 'node-fetch';

const API_KEY = process.env['2FACTOR_API_KEY'];
const BASE_URL = process.env['2FACTOR_BASE_URL'];

export const sendOtp = async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({
      code: 400,
      message: "Phone number is required",
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        module: 'TRANS_SMS',
        apikey: API_KEY,
        to: phoneNumber,
        from: 'YOUR_SENDER_ID', // Replace with your DLT approved sender ID
        msg: `Your OTP is ${otp}.`,
      }).toString(),
    });

    const data = await response.json();

    if (data.Status === 'Success') {
      // OTP sent successfully
      res.status(200).json({
        code: 200,
        message: "OTP sent successfully",
        otp: otp, // For testing, remove this in production
      });
    } else {
      console.error("API response error:", data);
      res.status(500).json({
        code: 500,
        message: "Failed to send OTP",
        details: data,
      });
    }
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({
      code: 500,
      message: "An error occurred while sending OTP",
    });
  }
};



// Function to verify OTP (always shows as verified)
export const verifyNewOtp = (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({
      code: 400,
      message: "OTP is required",
    });
  }

  // Since we're not storing OTPs, we assume verification is always successful
  res.status(200).json({
    code: 200,
    message: "OTP verified successfully",
  });
};