import VariantService from "../services/variant.service.js";

class VariantController {
  static async adjustStock(req, res, next) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      const updatedVariant = await VariantService.adjustStock(id, quantity);

      res.status(200).json(updatedVariant);
    } catch (error) {
      next(error);
    }
  }
}

export default VariantController;
