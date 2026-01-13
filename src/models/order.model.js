import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        name: {
            type: String,
            required: true, // snapshot (product name at time of order)
        },

        image: {
            type: String, // snapshot
        },

        price: {
            type: Number,
            required: true,
        },

        quantity: {
            type: Number,
            required: true,
            min: 1,
        },

        size: {
            type: String, // relevant for clothes
        },

        color: {
            type: String, // relevant for clothes
        }
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        // 🔐 User who placed order
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // 📦 Ordered items
        items: {
            type: [orderItemSchema],
            required: true,
        },

        // 📍 Shipping Address (snapshot)
        shippingAddress: {
            name: String,
            phone: String,
            addressLine: String,
            city: String,
            state: String,
            pincode: String,
            country: {
                type: String,
                default: "India",
            },
        },

        // 💰 Price breakdown
        subtotal: {
            type: Number,
            required: true,
        },

        shippingCharge: {
            type: Number,
            default: 0,
        },

        discount: {
            type: Number,
            default: 0,
        },

        totalAmount: {
            type: Number,
            required: true,
        },

        // 💳 Payment
        paymentMethod: {
            type: String,
            enum: ["COD", "ONLINE"],
            required: true,
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending",
        },

        paymentId: {
            type: String, // Razorpay / Stripe ID
        },

        orderStatus: {
            type: String,
            enum: ["placed", "confirmed", "shipped", "delivered", "cancelled"],
            default: "placed",
        },

        cancelReason: {
            type: String,
        },

        cancelledBy: {
            type: String,
            enum: ["user", "admin"],
        },

        cancelledAt: {
            type: Date,
            default: null,
        }
    },
    {
        timestamps: true,
    }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });


export const Order = mongoose.model("Order", orderSchema);
