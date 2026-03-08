import crypto from "crypto";
import OrderService from "../services/order.service.js";

/**
 * Handles the creation of a new order and prepares
 * the necessary data for the Wompi payment widget.
 */
export const createOrder = async (req, res, next) => {
  try {
    const { userId = null, ...orderData } = req.body;

    // 1. Call Service - result contains { order, checkout }
    const result = await OrderService.createOrder(userId, orderData);

    // 2. Destructure the order and the checkout data
    const { order, checkout } = result;

    // 3. Prepare variables for Signature
    // Ensure all values are treated as strings to avoid hash mismatches
    const reference = String(checkout.reference);
    const amountInCents = String(checkout.amountInCents);
    const currency = String(checkout.currency || "COP");
    const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;
    const publicKey = process.env.WOMPI_PUBLIC_KEY;
    const redirectUrl = process.env.WOMPI_REDIRECT_URL;

    // 4. Generate the SHA256 Integrity Signature
    // Strict Order: reference + amountInCents + currency + redirectUrl + integritySecret
    // ✅ Correct — no redirectUrl in the signature
    const rawSignatureString = `${reference}${amountInCents}${currency}${integritySecret}`;
    
    const signature = crypto
      .createHash("sha256")
      .update(rawSignatureString)
      .digest("hex");

    console.log("--- Signature Debug ---");
    console.log("1. reference:    ", JSON.stringify(reference));
    console.log("2. amountInCents:", JSON.stringify(amountInCents));
    console.log("3. currency:     ", JSON.stringify(currency));
    console.log("4. redirectUrl:  ", JSON.stringify(redirectUrl));
    console.log("5. secret:       ", JSON.stringify(integritySecret));
    console.log("6. Raw String:   ", JSON.stringify(rawSignatureString));
    console.log("7. Signature:    ", signature);
    console.log("8. Sig length:   ", signature.length);

    // 5. Return everything to Frontend
    return res.status(201).json({
      status: "success",
      data: {
        // Spread the database order object
        ...(order.toJSON ? order.toJSON() : order),
        checkout: {
          reference: reference,
          amountInCents: Number(amountInCents),
          currency: currency,
          signature: signature,
          publicKey: publicKey,
          redirectUrl: redirectUrl, // ← sent to frontend for widget
        },
      },
    });
  } catch (error) {
    console.error("Order Controller Error:", error);
    return next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await OrderService.getAllOrders();
    return res.status(200).json({
      status: "success",
      data: orders,
    });
  } catch (error) {
    return next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await OrderService.getOrderById(id);
    return res.status(200).json({
      status: "success",
      data: order,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedOrder = await OrderService.updateOrderStatus(id, status);
    return res.status(200).json({
      status: "success",
      data: updatedOrder,
    });
  } catch (error) {
    return next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cancelledOrder = await OrderService.cancelOrder(id);
    return res.status(200).json({
      status: "success",
      data: cancelledOrder,
    });
  } catch (error) {
    return next(error);
  }
};