import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    default: "admin",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  last_login: {
    type: Date,
  },
  actions: [
    {
      action_type: {
        type: String,
        required: true,
      },
      action_details: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
