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
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        subCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubCategory",
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

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
        },
    },
    { timestamps: true }

)

productSchema.index({ categoryId: 1 });
productSchema.index({ subCategoryId: 1 });
productSchema.index({ name: "text" });

export const Product = mongoose.model("Product", productSchema);
