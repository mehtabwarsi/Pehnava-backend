import mongoose from "mongoose";
import slugify from "slugify";

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
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },
        isDynamic: {
            type: Boolean,
            default: false,
        },
        filters: {
            seasons: [String],
            categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
            subCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' }],
            materials: [String],
            minPrice: Number,
            maxPrice: Number,
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
        products: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
        ],
    },
    { timestamps: true }
);

collectionSchema.pre("save", function () {
    if (this.isModified("title")) {
        this.slug = slugify(this.title, { lower: true });
    }
});

export const Collection = mongoose.model("Collection", collectionSchema);
