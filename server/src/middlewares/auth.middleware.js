import jwt from "jsonwebtoken";
import Boom from "@hapi/boom";

// Middleware to protect routes
export const protectAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw Boom.unauthorized("No token provided");
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if role is admin
    if (decoded.role !== "admin") {
      throw Boom.forbidden("You are not allowed to access this resource");
    }

    // Add user info to request
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(Boom.unauthorized("Token expired"));
    }
    next(error.isBoom ? error : Boom.unauthorized("Invalid token"));
  }
};
