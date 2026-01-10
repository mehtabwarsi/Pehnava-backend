import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { getUserCart } from "../utils/getUserCart.js";

export const checkoutSummary = asyncHandler(async (req, res) => {
    const firebaseUser = req.firebaseUser;

    const user = await User.findOne({ firebaseUid: firebaseUser.uid });
    if (!user) throw new ApiError(404, "User not found");

    const cart = await getUserCart(user._id);
    await cart.populate("items.product", "name images variants");

    if (cart.items.length === 0) {
        throw new ApiError(400, "Cart is empty");
    }

    let totalAmount = 0;
    const items = [];

    for (const item of cart.items) {
        const liveVariant = item.product.variants.find(
            v => v.size === item.variant.size && v.color === item.variant.color
        );

        if (!liveVariant || liveVariant.stock < item.quantity) {
            throw new ApiError(
                400,
                `${item.product.name} (${item.variant.size}) is out of stock`
            );
        }

        totalAmount += item.variant.discountPrice * item.quantity;

        items.push({
            productId: item.product._id,
            name: item.product.name,
            image: item.product.images[0],
            size: item.variant.size,
            color: item.variant.color,
            quantity: item.quantity,
            price: item.variant.discountPrice,
            liveStock: liveVariant.stock
        });
    }

    return res.json(
        new ApiResponse(200, { items, totalAmount }, "Checkout summary")
    );
});
