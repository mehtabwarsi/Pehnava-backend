import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        enum: ["men", "women", "unisex"],
    },

    isActive: {
        type: Boolean,
        default: true
    }

}, { timestamps: true });

// extra safety: unique index
categorySchema.index({ name: 1 }, { unique: true });

export const Category = mongoose.model("Category", categorySchema);
