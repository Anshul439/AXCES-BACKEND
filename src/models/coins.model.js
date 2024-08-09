// coins.model.js
import mongoose from "mongoose";

const CoinsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  balance: {
    type: Number,
    default: 200,
  },
  defaultPropertyPostCost: {
    type: Number,
    default: 10,
  },
  defaultOwnerDetailsCost: {
    type: Number,
    default: 10,
  },
  transactions: [
    {
      amount: {
        type: Number,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ]
});

const Coins = mongoose.model("Coins", CoinsSchema);

export default Coins;
