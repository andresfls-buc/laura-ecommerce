import express from "express";
import UserController from "../controllers/user.controller.js";

const router = express.Router();

// Create a user (admin or customer)
router.post("/", UserController.create);

// Optional: Get all users (admin only, you can protect later)
router.get("/", UserController.getAll);

export default router;
