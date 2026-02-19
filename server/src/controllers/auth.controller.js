import { User } from "../models/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Boom from "@hapi/boom";

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) throw Boom.unauthorized("Invalid email or password");

    // Only admins can log in
    if (user.role !== "admin") {
      throw Boom.forbidden("Only admins can log in here");
    }

    // Compare password
    const match = await bcrypt.compare(password, user.password || "");
    if (!match) throw Boom.unauthorized("Invalid email or password");

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token });
  } catch (error) {
    next(error.isBoom ? error : Boom.internal(error.message));
  }
};
