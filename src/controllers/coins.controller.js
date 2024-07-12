import Coins from "../models/coins.model.js";
import User from "../models/user.model.js";

// Get user's coin balance
export const getBalance = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is retrieved from authentication middleware
    console.log(userId);
    // Check if coins document exists for the user
    const coins = await Coins.findOne({ userId });
    console.log(coins);

    if (!coins) {
      return res
        .status(404)
        .json({ status: "fail", message: "Coins not found for this user." });
    }

    res.status(200).json({ status: "success", balance: coins.balance });
  } catch (error) {
    console.error("Error fetching balance:", error);
    res
      .status(500)
      .json({
        status: "fail",
        message: "An error occurred while fetching balance.",
      });
  }
};

// Recharge user's coins
export const rechargeCoins = async (req, res) => {
  const { amount } = req.body;

  try {
    const userId = req.user.id; // Assuming user ID is retrieved from authentication middleware

    // Find or create coins document for the user
    let coins = await Coins.findOne({ userId });

    if (!coins) {
      coins = new Coins({ userId, balance: 0 }); // Initialize with balance 0 or any default value
    }

    // Update balance and save
    coins.balance += amount;
    await coins.save();

    res
      .status(200)
      .json({ status: "success", message: "Coins recharged successfully." });
  } catch (error) {
    console.error("Error recharging coins:", error);
    res
      .status(500)
      .json({
        status: "fail",
        message: "An error occurred while recharging coins.",
      });
  }
};
