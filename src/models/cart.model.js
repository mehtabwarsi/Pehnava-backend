import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },

                variant: {
                    size: {
                        type: String,
                        required: true,
                    },
                    color: {
                        type: String,
                        required: true,
                    },

                    // 🔥 ORIGINAL PRICE (MRP)
                    price: {
                        type: Number,
                        required: true,
                    },

                    // 🔥 DISCOUNTED / FINAL PRICE
                    discountPrice: {
                        type: Number,
                        required: true,
                    },

                    stock: {
                        type: Number,
                        required: true,
                    },
                },

                quantity: {
                    type: Number,
                    default: 1,
                    min: 1,
                },
            },
        ],
    },
    { timestamps: true }
);

export const Cart = mongoose.model("Cart", cartSchema);
