import express from "express";
import {
  adminGetTransactions,
  adminUpdateBalance,
  getAllUsers,
  getUserDetails,
  updateProperty,
  updateUser,
  viewAllProperties,
  viewPropertyDetails,
  createAdmin,
  signinAdmin,
  updateDefaultCoinValues
} from "../controllers/admin.controller.js";
import { adminMiddleware } from "../middlewares/verifyAdmin.middleware.js";
import { authenticateToken } from "../middlewares/verifyUser.js";

const router = express.Router();

router.post("/createAdmin", createAdmin);
router.post("/signinAdmin", signinAdmin);

router.get("/users", authenticateToken, getAllUsers);
router.get("/users/:userId", getUserDetails);
router.put("/users/:userId", updateUser);

router.get("/properties", viewAllProperties);
router.get("/properties/:propertyId", viewPropertyDetails);
router.put("/properties/:propertyId", updateProperty);

router.put("/coins/:userId", adminUpdateBalance);
router.get("/transactions/:userId", adminGetTransactions);

router.patch("/coins/default", updateDefaultCoinValues);

export default router;
