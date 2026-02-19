import OrderService from "../services/order.service.js";

export const createOrder = async (req, res, next) => {
  try {
    const { userId = null, ...orderData } = req.body;

    const order = await OrderService.createOrder(userId, orderData);

    return res.status(201).json({
      status: "success",
      data: order,
    });
  } catch (error) {
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
