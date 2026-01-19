import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Product } from "../models/product.model.js";

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

    // validate stock and calculate subtotal
    let subtotal = 0;
    const processItems = [];

    // We need to fetch product details and check stock for EACH item
    // It's better to do this in a loop or Promise.all
    // For now, let's just stick to a loop to ensure we can throw errors easily

    // We also need to SAVE the product updates (stock deduction)
    // To ensure atomicity, ideally we use transactions, but for now we will just check and save.

    // Optimization: fetch all product IDs at once? 
    // To keep logic simple and robust for variants, let's process item by item or use bulkWrite eventually.
    // Given the scale, loop is okay for now.

    for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
            throw new ApiError(404, `Product not found: ${item.name}`);
        }

        // Check if variant exists
        let variantFound = false;
        if (product.variants && product.variants.length > 0) {
            // Find specific variant
            const variantIndex = product.variants.findIndex(
                (v) => v.size === item.size && v.color === item.color
            );

            if (variantIndex === -1) {
                throw new ApiError(400, `Variant not available for ${product.name}: ${item.size} / ${item.color}`);
            }

            const variant = product.variants[variantIndex];
            if (variant.stock < item.quantity) {
                throw new ApiError(400, `Insufficient stock for ${product.name} (${item.size}, ${item.color}). Available: ${variant.stock}`);
            }

            // Deduct stock in memory
            product.variants[variantIndex].stock -= item.quantity;
            variantFound = true;
        } else {
            // If product has no variants, maybe we should track main stock?
            // Based on schema, stock is INSIDE variants.
            // If a product has 0 variants, it effectively has 0 stock unless we have a top-level stock field.
            // The schema shows `variants: [variantSchema]`. 
            // If product has no variants, we can't deduct stock unless we assume it's infinite or handled differently.
            // Assuming strict variant inventory for now.
            if (product.variants.length === 0) {
                // Fallback or Error? 
                // Let's assume for now valid products MUST have variants as per current usage context
                // or just skip stock check if no variants (but that's risky).
                // Let's throw error for safety if no variants exist but we are trying to buy.
                // Actually, if a product is created without variants, it might be a simple product.
                // BUT schema enforces variants for stock.
                // Let's assume we REQUIRE variants for stock management.
                throw new ApiError(400, `Product ${product.name} has no available variants`);
            }
        }

        // Save the product with new stock
        await product.save();

        subtotal += item.price * item.quantity;
        processItems.push({
            ...item,
            // ensure we save what was actually processed
            size: item.size,
            color: item.color
        });
    }

    const totalAmount = subtotal + shippingCharge - discount;

    const order = await Order.create({
        user: user._id,
        items: processItems, // use processed items to be sure
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

    const order = await Order.findById(orderId).populate("items.product", "slug");

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
