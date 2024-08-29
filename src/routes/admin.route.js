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
  signinAdmin,
  updateDefaultCoinValues
} from "../controllers/admin.controller.js";
import { verifyAdminToken } from "../middlewares/verifyAdmin.middleware.js";

const router = express.Router();

router.post("/signinAdmin", verifyAdminToken, signinAdmin);

router.get("/users", verifyAdminToken, getAllUsers);
router.get("/users/:userId", verifyAdminToken, getUserDetails);
router.put("/users/:userId",verifyAdminToken, updateUser);

router.get("/properties", verifyAdminToken,viewAllProperties);
router.get("/properties/:propertyId",verifyAdminToken, viewPropertyDetails);
router.put("/properties/:propertyId",verifyAdminToken, updateProperty);

router.put("/coins/:userId",verifyAdminToken, adminUpdateBalance);
router.get("/transactions/:userId",verifyAdminToken, adminGetTransactions);

router.patch("/coins/default",verifyAdminToken, updateDefaultCoinValues);

export default router;
