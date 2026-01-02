import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        material: {
            type: String,
            required: true,
        },

        description: {
            type: String,
        },

        price: {
            type: Number,
            required: true,
        },

        discountPrice: {
            type: Number,
        },
        category: {
            type: String,
            required: true,
        },

        images: [
            {
                type: String, // image URL
                required: true,
            },
        ],

        sizes: [String],     // ["S", "M", "L"]
        colors: [String],    // ["Red", "Black"]
        stock: {
            type: Number,
            default: 0,
        },

        isFeatured: {
            type: Boolean,
            default: false,
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
        gender: {
            type: String,
            enum: ["men", "women", "unisex"],
            required: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
        },
    },
    { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
