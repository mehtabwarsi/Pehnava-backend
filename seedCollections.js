import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import { Collection } from "./src/models/collection.model.js";
import connectDB from "./src/db/mongodb.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from the same directory as this script
dotenv.config({ path: path.join(__dirname, '.env') });

const sampleCollections = [
    {
        title: "Summer Collection",
        subtitle: "Light, breathable & effortless styles",
        image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=2070&auto=format&fit=crop",
        redirectUrl: "/shop?gender=women&collection=summer",
        isActive: true,
        position: 1
    },
    {
        title: "Winter Collection",
        subtitle: "Warm layers for cold days",
        image: "https://images.unsplash.com/photo-1542060748-10c28b62716f?q=80&w=1928&auto=format&fit=crop",
        redirectUrl: "/shop?gender=men&collection=winter",
        isActive: true,
        position: 2
    },
    {
        title: "Festive Collection",
        subtitle: "Celebrate in style",
        image: "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1974&auto=format&fit=crop",
        redirectUrl: "/shop?gender=women&collection=festive",
        isActive: true,
        position: 3
    },
    {
        title: "Everyday Essentials",
        subtitle: "Comfort for daily wear",
        image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=2070&auto=format&fit=crop",
        redirectUrl: "/shop?gender=men&collection=essentials",
        isActive: true,
        position: 4
    }
];

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing collections
        await Collection.deleteMany({});
        console.log("Cleared existing collections");

        // Insert new data
        await Collection.insertMany(sampleCollections);
        console.log("Seeded sample collections successfully");

        process.exit();
    } catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1);
    }
};

seedData();
