import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const login = asyncHandler(async (req, res) => {
    const firebaseUser = req.firebaseUser;

    if (!firebaseUser) {
        throw new ApiError(401, "Unauthorized");
    }

    let user = await User.findOne({ firebaseUid: firebaseUser.uid });

    if (!user) {
        user = await User.create({
            firebaseUid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.name || firebaseUser.email?.split("@")[0],
            avatar: firebaseUser.picture,
            phone: firebaseUser.phone_number || null,
            provider: firebaseUser.firebase.sign_in_provider,
        });
    }

    return res.status(200).json(
        new ApiResponse(200, "User logged in successfully", user)
    );
});

const getUserProfile = asyncHandler(async (req, res) => {
    const firebaseUser = req.firebaseUser;

    const user = await User.findOne({
        firebaseUid: firebaseUser.uid
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, "User profile fetched successfully", user)
    );
});

const getTotalUsers = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    return res.status(200).json(
        new ApiResponse(200, totalUsers, "Total users fetched successfully")
    );
});

const toggleWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.body;

    if (!productId) {
        throw new ApiError(400, "Product ID is required");
    }

    const firebaseUser = req.firebaseUser;

    const user = await User.findOne({
        firebaseUid: firebaseUser.uid,
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const alreadyAdded = user.wishList.includes(productId);

    if (alreadyAdded) {
        user.wishList.pull(productId); // ❌ remove
    } else {
        user.wishList.push(productId); // ❤️ add
    }

    await user.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            { action: alreadyAdded ? "removed" : "added" },
            alreadyAdded
                ? "Removed from wishlist"
                : "Added to wishlist"
        )
    );
});


const getWishlist = asyncHandler(async (req, res) => {
    const firebaseUser = req.firebaseUser;

    const user = await User.findOne({
        firebaseUid: firebaseUser.uid,
    }).populate("wishList");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            user.wishList,
            "Wishlist fetched successfully"
        )
    );
});

const removeFromWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    if (!productId) {
        throw new ApiError(400, "Product ID is required");
    }

    const firebaseUser = req.firebaseUser;

    const user = await User.findOne({
        firebaseUid: firebaseUser.uid,
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const alreadyExists = user.wishList.includes(productId);

    if (!alreadyExists) {
        throw new ApiError(400, "Product not found in wishlist");
    }

    user.wishList.pull(productId); // 🔥 remove

    await user.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            { productId },
            "Product removed from wishlist successfully"
        )
    );
});


export { login, getUserProfile, getTotalUsers, toggleWishlist, getWishlist, removeFromWishlist };


