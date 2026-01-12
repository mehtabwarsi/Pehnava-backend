import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createOrder = asyncHandler(async (req, res) => {
    const firebaseUser = req.firebaseUser;
    const {
        items,
        shippingAddress,
        paymentMethod,
        shippingCharge = 0,
        discount = 0,
    } = req.body;

    if (!items || items.length === 0) {
        throw new ApiError(400, "Order items required");
    }

    const user = await User.findOne({ firebaseUid: firebaseUser.uid });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const totalAmount = subtotal + shippingCharge - discount;

    const order = await Order.create({
        user: user._id,
        items,
        shippingAddress,
        subtotal,
        shippingCharge,
        discount,
        totalAmount,
        paymentMethod,
        paymentStatus: paymentMethod === "COD" ? "pending" : "paid",
    });

    return res.status(201).json(
        new ApiResponse(201, "Order placed successfully", order)
    );
});

const getMyOrders = asyncHandler(async (req, res) => {
    const firebaseUser = req.firebaseUser;

    const user = await User.findOne({ firebaseUid: firebaseUser.uid });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const orders = await Order.find({ user: user._id })
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, "Orders fetched", orders)
    );
});

const getOrderById = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    return res.status(200).json(
        new ApiResponse(200, "Order fetched", order)
    );
});

const cancelOrderByUser = asyncHandler(async (req, res) => {
    const firebaseUser = req.firebaseUser;
    const { reason } = req.body;

    if (!reason) {
        throw new ApiError(400, "Cancel reason is required");
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    const user = await User.findOne({ firebaseUid: firebaseUser.uid });
    if (!order.user.equals(user._id)) {
        throw new ApiError(403, "Unauthorized");
    }

    if (order.orderStatus === "cancelled") {
        throw new ApiError(400, "Order already cancelled");
    }

    if (["shipped", "delivered"].includes(order.orderStatus)) {
        throw new ApiError(400, "Order cannot be cancelled now");
    }

    order.orderStatus = "cancelled";
    order.cancelReason = reason;
    order.cancelledBy = "user";
    order.cancelledAt = new Date();

    await order.save();

    return res.status(200).json(
        new ApiResponse(200, order, "Order cancelled successfully")
    );
});




export {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrderByUser,
}
