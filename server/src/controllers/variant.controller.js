import VariantService from "../services/variant.service.js";

class VariantController {

  // 🔹 Adjust stock of a variant
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

  // 🔹 Delete a variant image
  static async deleteImage(req, res, next) {
    try {
      const { imageId } = req.params;

      await VariantService.deleteImage(imageId);

      res.status(200).json({
        message: "Image deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default VariantController;