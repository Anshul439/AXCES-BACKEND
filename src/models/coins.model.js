import mongoose from 'mongoose';

const CoinsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 50
  }
});

const Coins = mongoose.model('Coins', CoinsSchema);

export default Coins;
