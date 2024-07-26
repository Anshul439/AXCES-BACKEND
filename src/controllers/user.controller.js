import User from "../models/user.model.js";
import Coins from "../models/coins.model.js";
import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/error.js";

export const createProfile = async (req, res, next) => {
  const { number, name, email } = req.body;

  try {
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
