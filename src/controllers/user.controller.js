import User from "../models/user.model.js";
import Coins from "../models/coins.model.js";
import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/error.js";
import dotenv from 'dotenv';
import { uploadOnCloudinary } from "../utils/cloudinary.js";
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
        return next(errorHandler(400, res, "Email already exists"));
      }

      // Get the default coin balance
      const defaultBalanceDoc = await Coins.findOne({});
      // console.log(defaultBalanceDoc);
      const balance = defaultBalanceDoc ? defaultBalanceDoc.balance : 200;

      // User does not exist, create a new profile
      user = new User({ number, name, email, balance });
      await user.save();

      const coins = new Coins({ userId: user._id, balance });
      await coins.save();

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

      return res.status(201).json({
        status: "success",
        data: { id: user._id, name: user.name, email: user.email, balance, token },
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




export const sendOtp = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      return next(errorHandler(400, res, "Invalid phone number."));
    }

    // Simulate sending OTP
    console.log(`Sending OTP to phone number ${phoneNumber}`);

    return res.status(200).json({
      status: "success",
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    next(error);
  }
};



export const verifyOtp = async (req, res, next) => {
  try {
    const { otp } = req.body;

    if (!otp || !/^\d{6}$/.test(otp)) {
      return next(errorHandler(400, res, "Invalid OTP"));
    }

    if (otp === 123456) {
      return res.status(200).json({
        status: "success",
        message: "Number verified successfully",
      });
    } else {
      return next(errorHandler(400, res, "Invalid OTP."));
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    next(error);
  }
};



export const profileUpload = async (req, res, next) => {
  try {
    if (!req.files || !req.files.profilePicture || req.files.profilePicture.length === 0) {
      return next(errorHandler(400, res, "Profile picture upload is required"));
    }

    // Upload the image to Cloudinary (or your cloud service)
    const imageLocalPath = req.files.profilePicture[0].path;
    const imageResponse = await uploadOnCloudinary(imageLocalPath);

    if (imageResponse.error) {
      return next(errorHandler(500, res, "Error uploading image"));
    }

    // Assuming req.user contains the authenticated user's ID
    const userId = req.user.id;

    // Update user's profilePicture field in the database
    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: imageResponse.secure_url }, // Assuming imageResponse.secure_url is the Cloudinary URL
      { new: true } // Return the updated document
    );

    if (!user) {
      return next(errorHandler(404, res, "User not found"));
    }

    res.status(200).json({
      code: 200,
      data: { profilePicture: user.profilePicture },
      message: "Profile picture uploaded and updated successfully",
    });
  } catch (error) {
    console.log(error);
    next(errorHandler(500, res, "An error occurred during the upload process"));
  }
};


