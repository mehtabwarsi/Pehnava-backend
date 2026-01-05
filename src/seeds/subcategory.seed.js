import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 👇 load .env from root
dotenv.config({
    path: path.resolve(__dirname, "../../.env")
});

import connectDB from "../db/mongodb.js";
import { Category } from "../models/category.model.js";
import { SubCategory } from "../models/subCategory.model.js";

const seedSubCategories = async () => {
    try {
        await connectDB();

        // 1️⃣ categories nikaalo
        const men = await Category.findOne({ name: "men" });
        const women = await Category.findOne({ name: "women" });
        const unisex = await Category.findOne({ name: "unisex" });

        if (!men || !women || !unisex) {
            throw new Error("❌ Categories not found. Seed categories first.");
        }

        // 2️⃣ subcategories define karo
        const subCategories = [
            // MEN
            { name: "tshirt", categoryId: men._id },
            { name: "shirt", categoryId: men._id },
            { name: "jeans", categoryId: men._id },
            { name: "pant", categoryId: men._id },

            // WOMEN
            { name: "kurti", categoryId: women._id },
            { name: "top", categoryId: women._id },
            { name: "jeans", categoryId: women._id },
            { name: "saree", categoryId: women._id },

            // UNISEX
            { name: "hoodie", categoryId: unisex._id },
            { name: "jacket", categoryId: unisex._id }
        ];

        await SubCategory.insertMany(subCategories, { ordered: false });

        console.log("✅ SubCategories seeded successfully");
        process.exit(0);

    } catch (error) {
        console.error("❌ SubCategory seed error:", error.message);
        process.exit(1);
    }
};

seedSubCategories();
