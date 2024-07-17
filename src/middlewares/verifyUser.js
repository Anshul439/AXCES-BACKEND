import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/error.js";

export const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    // return next(errorHandler(401, res, "Access denied. No token provided."));
    return res
      .status(401)
      .json({
        code: 401,
        data: {},
        message: "Access denied. No token provided.",
      });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // return next(
    //   errorHandler(401, res, "You are not authorized to update this user")
    // );
    return res.status(401).json({ code: 401, data: {}, message: "Unauthorized user" });
  }
};
