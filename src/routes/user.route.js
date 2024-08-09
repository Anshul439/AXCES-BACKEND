import express from "express";
import {
  createProfile,
  getUserProfile,
  profileUpload,
  sendOtp,
  updateUserProfile,
  verifyNumber,
  verifyOtp,
} from "../controllers/user.controller.js";
import { authenticateToken } from "../middlewares/verifyUser.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/profile", createProfile);
router.post("/user/profile", authenticateToken, updateUserProfile);
router.get("/profile", authenticateToken, getUserProfile);
router.post(
  "/profile-pic",
  upload.fields([
    {
      name: "profilePicture",
      maxCount: 1,
    },
  ]), authenticateToken,
  profileUpload
);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

router.post("/user/verify", verifyNumber);

export default router;
