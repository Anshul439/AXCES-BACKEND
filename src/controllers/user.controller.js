import User from '../models/user.model.js';
import Coins from '../models/coins.model.js';
import jwt from 'jsonwebtoken';

export const createProfile = async (req, res) => {
  const { userId, name, email } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({
        $or: [{ userId }, { email }]
    })

    if (user) {
      return res.status(400).json({ status: 'fail', message: 'userId or email already exists' });
    }

    user = new User({ userId, name, email });
    await user.save();

    const coins = new Coins({ userId: user._id });
    await coins.save();


    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.status(201).json({ status: 'success',id: user._id , token, message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ status: 'fail', message: 'An error occurred while registering the user' });
  }
};


export const updateUserProfile = async (req, res) => {
  const { userId, updatedProfileDetails } = req.body;

  try {
    // Find the user by userId
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    // Update user profile details
    Object.assign(user, updatedProfileDetails);
    await user.save();

    res.status(200).json({ status: 'success', message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ status: 'fail', message: 'An error occurred while updating the profile' });
  }
};

