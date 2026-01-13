import { Order } from "../../models/order.model.js";
import { User } from "../../models/user.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { Product } from "../../models/product.model.js";



const getAllOrders = asyncHandler(async (req, res) => {

    const orders = await Order.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, orders, "Orders fetched successfully")
    );
});

const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate("user", "name email")
        .populate("items.product", "name images");

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    return res.status(200).json(
        new ApiResponse(200, order, "Order fetched successfully")
    );
});

const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    const allowedStatus = [
        "placed",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled",
    ];

    if (!allowedStatus.includes(status)) {
        throw new ApiError(400, "Invalid order status");
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    order.orderStatus = status;

    if (status === "cancelled") {
        order.cancelledBy = "admin";
        order.cancelledAt = new Date();

        // Restore stock
        for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (product && product.variants) {
                const variant = product.variants.find(
                    (v) => v.size === item.size && v.color === item.color
                );
                if (variant) {
                    variant.stock += item.quantity;
                    await product.save();
                }
            }
        }
    }

    // 🚫 Cancelled orders locked
    if (order.orderStatus === "cancelled" && status !== "cancelled") {
        throw new ApiError(400, "Cancelled orders cannot be updated");
    }

    await order.save();

    return res.status(200).json(
        new ApiResponse(200, "Order status updated", order)
    );
});






export {
    getAllOrders,
    getOrderById,
    updateOrderStatus,
}