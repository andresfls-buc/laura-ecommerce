import ProductService from "../services/product.service.js";

class ProductController {

  // Create product + variants
  static async create(req, res, next) {
    try {
      const product = await ProductService.createProduct(req.body);
      return res.status(201).json(product);
    } catch (error) {
      next(error); // Boom errors handled by global middleware
    }
  }

  // Update product + variants
  static async update(req, res, next) {
    try {
      const product = await ProductService.updateProduct(req.params.id, req.body);
      return res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  }

  // Delete product
  static async delete(req, res, next) {
    try {
      const result = await ProductService.deleteProduct(req.params.id);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

 // Get product by ID (with variants)

static async getById(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });

    const product = await ProductService.getProductById(id);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    return res.status(200).json(product);
  } catch (error) {
    next(error); // global error handler
  }
}

  // Get all products (with variants)
  static async getAll(req, res, next) {
    try {
      const products = await ProductService.getAllProducts();
      return res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  }

  // ✅ Get variants of a product with optional filters (size, color)
  static async getVariants(req, res, next) {
    try {
      const { id } = req.params;
      const { size, color } = req.query; // optional filters
      const variants = await ProductService.getProductVariants(id, { size, color });
      return res.status(200).json(variants);
    } catch (error) {
      next(error);
    }
  }
}

export default ProductController;
