import { User } from "../models/index.js";
import Boom from "@hapi/boom";
import bcrypt from "bcrypt";

class UserService {

  // Create admin or customer
  static async createUser(data) {
    const { email, password, role = "customer" } = data;

    if (!email || !password) {
      throw Boom.badRequest("Email and password are required");
    }

    // Check if user exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      throw Boom.conflict("User with this email already exists");
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashed,
      role,
      isGuest: role === "customer" ? false : true,
    });

    // Don't return password
    const { password: _p, ...result } = user.toJSON();
    return result;
  }

  // Optional: Get all users
  static async getAllUsers() {
    return await User.findAll({ attributes: { exclude: ["password"] } });
  }
}

export default UserService;
