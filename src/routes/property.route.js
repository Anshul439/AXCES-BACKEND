import express from "express";
import {
  postProperty,
  editProperty,
  deleteProperty,
  getPropertyDetails,
  listProperties,
  contactOwner,
  addToWishlist,
  viewWishlist,
} from "../controllers/property.controller.js";
import { authenticateToken } from "../middlewares/verifyUser.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post(
  "/property/post/:id",
  upload.fields([
    {
      name: "images",
      maxCount: 5,
    },
    {
      name: "video",
      maxCount: 5,
    },
  ]),
  postProperty
);

router.put("/property/edit", authenticateToken, editProperty);
router.delete("/property/delete", authenticateToken, deleteProperty);
router.post("/property/list", listProperties);

router.get(
  "/property/contact-owner/:propertyId",
  authenticateToken,
  contactOwner
);
router.post("/property/addToWishlist", authenticateToken, addToWishlist);
router.get("/property/viewWishlist", authenticateToken, viewWishlist);

router.get("/property/:id", getPropertyDetails);

export default router;
