import User from "../models/user.model.js";
import Coins from "../models/coins.model.js";
import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/error.js";

export const createProfile = async (req, res, next) => {
  const { number, name, email } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({
      $or: [{ number }, { email }],
    });

    if (user) {
      return next(errorHandler(400, res, "number or email already exists"));
    }

    user = new User({ number, name, email });
    await user.save();

    const coins = new Coins({ userId: user._id });
    await coins.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.status(201).json({
      status: "success",
      data: { id: user._id, token },
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Error registering user:", error);
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