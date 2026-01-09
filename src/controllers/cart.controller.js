import { Cart } from "../models/cart.model.js";
import { User } from "../models/user.model.js";
import { getUserCart } from "../utils/getUserCart.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const addToCart = asyncHandler(async (req, res) => {
    const { productId, color, size, price, quantity = 1 } = req.body;
    const firebaseUser = req.firebaseUser;

    if (!color || !size) {
        throw new ApiError(400, "Color and size are required");
    }

    const user = await User.findOne({ firebaseUid: firebaseUser.uid });
    if (!user) throw new ApiError(404, "User not found");

    const cart = await getUserCart(user._id);

    // 🔥 same product + same variant check
    const existing = cart.items.find(
        (i) =>
            i.product.toString() === productId &&
            i.variant.color === color &&
            i.variant.size === size
    );

    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.items.push({
            product: productId,
            variant: { color, size, price },
            quantity,
        });
    }

    await cart.save();

    res.json(
        new ApiResponse(200, cart, "Product added to cart")
    );
});


const getCart = asyncHandler(async (req, res) => {
    const firebaseUser = req.firebaseUser;

    const user = await User.findOne({ firebaseUid: firebaseUser.uid });
    if (!user) throw new ApiError(404, "User not found");

    const cart = await Cart.findOne({ user: user._id })
        .populate("items.product", "name images price discountPrice");

    if (!cart) {
        return res.json(
            new ApiResponse(200, { items: [], totalItems: 0, totalAmount: 0 }, "Cart empty")
        );
    }

    const totalAmount = cart.items.reduce(
        (sum, i) => sum + i.product.price * i.quantity,
        0
    );

    res.json(
        new ApiResponse(
            200,
            {
                items: cart.items,
                totalItems: cart.items.length,
                totalAmount,
            },
            "Cart fetched successfully"
        )
    );
});

const updateCartQuantity = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const firebaseUser = req.firebaseUser;

    if (quantity < 1) {
        throw new ApiError(400, "Quantity must be at least 1");
    }

    const user = await User.findOne({ firebaseUid: firebaseUser.uid });
    const cart = await getUserCart(user._id);

    const item = cart.items.find(
        (i) => i.product.toString() === productId
    );

    if (!item) throw new ApiError(404, "Item not in cart");

    item.quantity = quantity;
    await cart.save();

    res.json(
        new ApiResponse(200, cart, "Cart updated")
    );
});

const removeFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const firebaseUser = req.firebaseUser;

    const user = await User.findOne({ firebaseUid: firebaseUser.uid });
    const cart = await getUserCart(user._id);

    cart.items = cart.items.filter(
        (i) => i.product.toString() !== productId
    );

    await cart.save();

    res.json(
        new ApiResponse(200, cart, "Product removed from cart")
    );
});

const clearCart = asyncHandler(async (req, res) => {
    const firebaseUser = req.firebaseUser;

    const user = await User.findOne({ firebaseUid: firebaseUser.uid });
    const cart = await getUserCart(user._id);

    cart.items = [];
    await cart.save();

    res.json(
        new ApiResponse(200, [], "Cart cleared successfully")
    );
});






export {
    addToCart,
    getCart,
    updateCartQuantity,
    removeFromCart,
    clearCart
}
