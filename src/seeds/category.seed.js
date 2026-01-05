import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// 👇 ES module path fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 👇 EXPLICITLY load .env from project root
dotenv.config({
    path: path.resolve(__dirname, "../../.env")
});

import connectDB from "../db/mongodb.js";
import { Category } from "../models/category.model.js";

const seedCategories = async () => {
    try {
        await connectDB();

        await Category.insertMany(
            [
                { name: "men" },
                { name: "women" },
                { name: "unisex" }
            ],
            { ordered: false }
        );

        console.log("✅ Categories seeded successfully");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seed error:", error.message);
        process.exit(1);
    }
};

seedCategories();
