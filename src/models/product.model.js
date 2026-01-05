import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
    {
        size: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        color: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        stock: {
            type: Number,
            required: true,
            min: 0
        }
    },
    { _id: false }
);

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

        variants: { type: [variantSchema], default: [] },
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

productSchema.index({ category: 1 });
productSchema.index({ subCategory: 1 });
productSchema.index({ name: "text" });


productSchema.pre("save", function (next) {
    const variants = this.variants || [];

    const set = new Set();
    for (let v of variants) {
        const key = `${v.size}-${v.color}`;
        if (set.has(key)) {
            throw new Error("Duplicate size + color variant not allowed");
        }
        set.add(key);
    }
});


export const Product = mongoose.model("Product", productSchema);
