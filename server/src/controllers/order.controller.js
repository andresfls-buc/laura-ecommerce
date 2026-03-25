import OrderService from "../services/order.service.js";

const WOMPI_METHOD_MAP = {
  credit_card: ["CARD"],
  nequi:       ["NEQUI"],
  daviplata:   ["DAVIPLATA"],
  pse:         ["PSE"],
};

export const createOrder = async (req, res, next) => {
  try {
    const { userId = null, ...orderData } = req.body;

    // 1. Create order in DB
    const { order, checkout } = await OrderService.createOrder(userId, orderData);

    // 2. Create Wompi payment link (server-side — enforces accepted_payment_methods)
    const wompiBase = process.env.WOMPI_ENV === "sandbox"
      ? "https://sandbox.wompi.co/v1"
      : "https://production.wompi.co/v1";

    const acceptedMethods = WOMPI_METHOD_MAP[orderData.paymentMethod] ?? ["CARD", "NEQUI", "PSE", "DAVIPLATA"];

    const linkRes = await fetch(`${wompiBase}/payment_links`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WOMPI_PRIVATE_KEY}`,
      },
      body: JSON.stringify({
        name: `Orden ${checkout.reference}`,
        description: `Compra en ${process.env.STORE_NAME || "tienda"}`,
        single_use: true,
        collect_shipping: false,
        amount_in_cents: checkout.amountInCents,
        currency: checkout.currency,
        redirect_url: process.env.WOMPI_REDIRECT_URL,
        accepted_payment_methods: acceptedMethods,
      }),
    });

    const linkData = await linkRes.json();
    const linkId = linkData?.data?.id;
    const paymentUrl = linkId ? `https://checkout.wompi.co/l/${linkId}` : null;

    if (!paymentUrl) {
      console.error("Wompi payment link error:", JSON.stringify(linkData));
      throw new Error("No se pudo crear el link de pago con Wompi");
    }

    console.log(`✅ Payment link creado — ${checkout.reference} | Método: ${orderData.paymentMethod} | URL: ${paymentUrl}`);

    // 3. Save linkId on the order so the webhook can correlate it
    //    Wompi generates its own reference (e.g. test_abc123_timestamp_random),
    //    not our order reference — we store the linkId to look it up later.
    await order.update({ wompiTransactionId: linkId });

    // 4. Return order + payment URL to frontend
    return res.status(201).json({
      status: "success",
      data: {
        ...(order.toJSON ? order.toJSON() : order),
        checkout: {
          paymentUrl,
          reference: checkout.reference,
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

    // Debug logging
    console.log("=== Update Order Status ===");
    console.log("Order ID:", id);
    console.log("New Status:", status);
    console.log("Request Body:", req.body);
    console.log("Content-Type:", req.headers["content-type"]);

    // Validation
    if (!status) {
      return res.status(400).json({
        status: "error",
        message: "Status is required in request body",
        receivedBody: req.body,
        hint: "Make sure express.json() middleware is configured before routes",
      });
    }

    const updatedOrder = await OrderService.updateOrderStatus(id, status);

    console.log(
      "✅ Order status updated successfully to:",
      updatedOrder.status
    );

    return res.status(200).json({
      status: "success",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("❌ Update status error:", error.message);
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
