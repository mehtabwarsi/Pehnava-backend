import mongoose from 'mongoose';
import { Product } from './src/models/product.model.js';
import { Admin } from './src/models/admin.model.js';

console.log("Mongoose Version:", mongoose.version);

// Check if hooks are registered
console.log("Product Hooks:", Product.schema._indexes);
// Inspect Product schema hooks
// console.log(Product.schema.s.hooks);

const dummyProduct = new Product({
    name: "Test",
    slug: "test-product",
    price: 100,
    category: new mongoose.Types.ObjectId(),
    subCategory: new mongoose.Types.ObjectId(),
    material: "Cotton",
    images: ["http://example.com/img.png"],
    variants: [{ size: "M", color: "Red", stock: 10 }]
});

console.log("Dummy product created.");

// We cannot save without connection.
// But we can check if 'next' is passed to hook if we manually trigger it?
// Internally mongoose handles this.

// Let's check Admin model hook
console.log("Admin model loaded.");

if (mongoose.version.startsWith('9')) {
    console.log("WARNING: Mongoose 9 detected. Verifying hook compatibility...");
}
