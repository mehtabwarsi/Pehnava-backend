import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        subtitle: {
            type: String,
            trim: true,
        },
        image: {
            type: String,
            required: true,
        },
        redirectUrl: {
            type: String, // e.g., "/shop?gender=men&collection=winter"
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        description: {
            type: String,
        },
        position: {
            type: Number,
            default: 0,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
        },
    },
    { timestamps: true }
);

export const Collection = mongoose.model("Collection", collectionSchema);
