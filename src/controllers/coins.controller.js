import Coins from "../models/coins.model.js";

// Get user's coin balance
export const getBalance = async (req, res,next) => {
  try {
    const userId = req.user.id; // Assuming user ID is retrieved from authentication middleware
    console.log(userId);
    // Check if coins document exists for the user
    const coins = await Coins.findOne({ userId });
    console.log(coins);

    if (!coins) {
      return res
        .status(404)
        .json({ code: 404,data: {}, message: "Coins not found for this user." });
    }

    res.status(200).json({code:200, data: {coins:coins.balance}, message: "Coins fetched successfully." });
  } catch (error) {
    console.error("Error fetching balance:", error);
    next(error)
  }
};

// Recharge user's coins
export const rechargeCoins = async (req, res, next) => {
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
      .json({ code: 200, data:{balance: coins.balance}, message: "Coins recharged successfully." });
  } catch (error) {
    console.error("Error recharging coins:", error);
    next(error)
  }
};
