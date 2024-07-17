import User from "../models/user.model.js";
import Coins from "../models/coins.model.js";
import jwt from "jsonwebtoken";

export const createProfile = async (req, res, next) => {
  const { userId, name, email } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({
      $or: [{ userId }, { email }],
    });

    if (user) {
      return res
        .status(400)
        .json({ status: "fail", message: "userId or email already exists" });
    }

    user = new User({ userId, name, email });
    await user.save();

    const coins = new Coins({ userId: user._id });
    await coins.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res
      .status(201)
      .json({
        status: "success",
        id: user._id,
        token,
        message: "User registered successfully",
      });
  } catch (error) {
    console.error("Error registering user:", error);
    next(error)
  }
};

export const updateUserProfile = async (req, res) => {
  const { name, email } = req.body;
  console.log(req.user);
  try {
    // Find and update the user by ID from the decoded token
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { name, email } },
      { new: true, runValidators: true }
    );

    res
      .status(200)
      .json({
        code: 200,
        data: user,
        message: "Success"
      });
  } catch (error) {
    console.error("Error updating profile:", error);
    res
      .status(500)
      .json({
        status: "fail",
        message: "An error occurred while updating the profile",
      });
  }
};
