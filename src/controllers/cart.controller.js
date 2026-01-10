import { Cart } from "../models/cart.model.js";
import { User } from "../models/user.model.js";
import { getUserCart } from "../utils/getUserCart.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Product } from "../models/product.model.js";


const addToCart = asyncHandler(async (req, res) => {
    const { productId, size, color, quantity = 1 } = req.body;
    const firebaseUser = req.firebaseUser;

    if (!productId || !size || !color) {
        throw new ApiError(400, "Product, size and color are required");
    }

    const user = await User.findOne({ firebaseUid: firebaseUser.uid });
    if (!user) throw new ApiError(404, "User not found");

    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    // 🔍 find exact variant
    const variant = product.variants.find(
        (v) => v.size === size && v.color === color
    );

    if (!variant) {
        throw new ApiError(400, "Variant not found");
    }

    if (variant.stock < quantity) {
        throw new ApiError(
            400,
            `Only ${variant.stock} items available`
        );
    }

    const cart = await getUserCart(user._id);

    const existing = cart.items.find(
        (i) =>
            i.product.toString() === productId &&
            i.variant.size === size &&
            i.variant.color === color
    );

    // 🔒 PRICE SNAPSHOT (VERY IMPORTANT)
    const originalPrice = product.price; // MRP
    const discountPrice = product.discountPrice ?? product.price; // selling price

    if (existing) {
        const newQty = existing.quantity + quantity;

        if (newQty > variant.stock) {
            throw new ApiError(
                400,
                `Only ${variant.stock} items available`
            );
        }

        existing.quantity = newQty;

        // 🔄 keep snapshot updated
        existing.variant.price = originalPrice;
        existing.variant.discountPrice = discountPrice;
        existing.variant.stock = variant.stock;

    } else {
        cart.items.push({
            product: productId,
            variant: {
                size,
                color,
                price: originalPrice,           // ✅ REQUIRED
                discountPrice: discountPrice,   // ✅ REQUIRED
                stock: variant.stock,           // ✅ REQUIRED
            },
            quantity,
        });
    }

    await cart.save();

    return res.status(200).json(
        new ApiResponse(200, cart, "Added to cart")
    );
});





const getCart = asyncHandler(async (req, res) => {
    const firebaseUser = req.firebaseUser;

    const user = await User.findOne({ firebaseUid: firebaseUser.uid });
    if (!user) throw new ApiError(404, "User not found");

    const cart = await getUserCart(user._id);
    await cart.populate("items.product", "name images");

    if (cart.items.length === 0) {
        return res.json(
            new ApiResponse(200, {
                items: [],
                totalItems: 0,
                totalAmount: 0,
            }, "Cart empty")
        );
    }

    const totalAmount = cart.items.reduce(
        (sum, i) => sum + i.variant.discountPrice * i.quantity,
        0
    );

    return res.status(200).json(
        new ApiResponse(200, {
            items: cart.items,
            totalItems: cart.items.length,
            totalAmount,
        }, "Cart fetched")
    );
});




const updateCartQuantity = asyncHandler(async (req, res) => {
    const { productId, size, color, quantity } = req.body;
    const firebaseUser = req.firebaseUser;

    if (!productId || !size || !color) {
        throw new ApiError(400, "Product, size and color required");
    }

    if (quantity < 1) {
        throw new ApiError(400, "Quantity must be at least 1");
    }

    const user = await User.findOne({ firebaseUid: firebaseUser.uid });
    if (!user) throw new ApiError(404, "User not found");

    const cart = await getUserCart(user._id);

    const item = cart.items.find(
        (i) =>
            i.product.toString() === productId &&
            i.variant.size === size &&
            i.variant.color === color
    );

    if (!item) throw new ApiError(404, "Cart item not found");

    if (quantity > item.variant.stock) {
        throw new ApiError(
            400,
            `Only ${item.variant.stock} items available`
        );
    }

    item.quantity = quantity;

    await cart.save();

    res.json(
        new ApiResponse(200, cart, "Cart updated")
    );
});



const removeFromCart = asyncHandler(async (req, res) => {
    const { productId, size, color } = req.body;
    const firebaseUser = req.firebaseUser;

    const user = await User.findOne({ firebaseUid: firebaseUser.uid });
    if (!user) throw new ApiError(404, "User not found");

    const cart = await getUserCart(user._id);

    cart.items = cart.items.filter(
        (i) =>
            !(
                i.product.toString() === productId &&
                i.variant.size === size &&
                i.variant.color === color
            )
    );

    await cart.save();

    res.json(
        new ApiResponse(200, cart, "Item removed")
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
