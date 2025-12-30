import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        firebaseUid: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        email: {
            type: String,
            lowercase: true,
            trim: true,
        },
        name: {
            type: String,
            trim: true,
        },
        avatar: {
            type: String,
        },
        phone: {
            type: String,
        },
        provider: {
            type: String, // google | phone
        },
    },
    { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
