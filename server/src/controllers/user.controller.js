import UserService from "../services/user.service.js";
import Boom from "@hapi/boom";

class UserController {

  static async create(req, res, next) {
    try {
      const user = await UserService.createUser(req.body);
      return res.status(201).json({ status: "success", data: user });
    } catch (error) {
      next(error.isBoom ? error : Boom.internal(error.message));
    }
  }

  static async getAll(req, res, next) {
    try {
      const users = await UserService.getAllUsers();
      return res.status(200).json({ status: "success", data: users });
    } catch (error) {
      next(error.isBoom ? error : Boom.internal(error.message));
    }
  }
}

export default UserController;
