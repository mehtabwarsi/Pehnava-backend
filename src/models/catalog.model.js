// models/catalog.model.js
import mongoose from "mongoose";

const catalogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true, // Shirt, Kurti Sets
        },

        subtitle: {
            type: String, // "45+ Items"
        },

        gender: {
            type: String,
            enum: ["men", "women", "unisex"],
            required: true,
        },

        subCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubCategory",
            required: false,
        },

        image: {
            type: String,
            required: true,
        },

        redirectUrl: {
            type: String,
            required: true,
            // /shop?gender=men&type=shirt
        },

        position: {
            type: Number,
            default: 0, // homepage order
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        badge: {
            type: String, // NEW | FESTIVE | OFFER
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
        },
    },
    { timestamps: true }
);

export const Catalog = mongoose.model("Catalog", catalogSchema);
