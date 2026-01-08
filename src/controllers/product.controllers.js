import fs from "fs";
import slugify from "slugify";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { Product } from "../models/product.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const createProduct = asyncHandler(async (req, res) => {
    const {
        name,
        description,
        price,
        discountPrice,
        category,
        subCategory,
        material,
        isFeatured,
        features,
        specifications
    } = req.body;

    if (!req.files || req.files.length === 0) {
        throw new ApiError(400, "Images are required");
    }

    if (!req.body.variants) {
        throw new ApiError(400, "Variants are required");
    }

    const variants = JSON.parse(req.body.variants);
    if (!variants.length) {
        throw new ApiError(400, "At least one variant is required");
    }

    if (!name || !price || !category || !material || !subCategory) {
        throw new ApiError(400, "Required fields missing");
    }

    let parsedFeatures = [];
    if (features) parsedFeatures = JSON.parse(features);

    let parsedSpecifications = {};
    if (specifications) parsedSpecifications = JSON.parse(specifications);

    const imageUrls = [];
    for (let file of req.files) {
        const url = await uploadToCloudinary(file.path);
        imageUrls.push(url);
        fs.unlinkSync(file.path);
    }

    const slug = slugify(name, { lower: true });

    const productExists = await Product.findOne({ slug });
    if (productExists) {
        throw new ApiError(409, "Product already exists");
    }

    const product = await Product.create({
        name,
        slug,
        description,
        price,
        discountPrice,
        category,
        subCategory,
        material,
        images: imageUrls,
        variants,
        features: parsedFeatures,
        specifications: parsedSpecifications,
        isFeatured,
        createdBy: req.admin.id
    });

    return res.status(201).json(
        new ApiResponse(201, product, "Product created successfully")
    );
});



const getAllProduct = asyncHandler(async (req, res) => {
    const products = await Product.find()
        .populate("category", "name")
        .populate("subCategory", "name")
        .lean();

    const productsWithStock = products.map((product) => {
        const totalStock = product.variants?.reduce(
            (sum, v) => sum + (v.stock || 0),
            0
        );

        return {
            ...product,
            totalStock,
        };
    });

    return res.status(200).json(
        new ApiResponse(200, productsWithStock, "Products fetched successfully")
    );
});


const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid product id");
    }

    const product = await Product.findById(id)
        .populate("category", "name")
        .populate("subCategory", "name")
        .populate("variants", "size color stock");

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return res.status(200).json(
        new ApiResponse(200, product, "Product fetched successfully")
    );
});

const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // 1️⃣ validate product id
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid product id");
    }

    // 2️⃣ find product
    const product = await Product.findById(id)
        .populate("category", "name")
        .populate("subCategory", "name")
        .populate("variants", "size color stock");
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    // 3️⃣ allowed editable fields
    const {
        name,
        description,
        price,
        discountPrice,
        category,
        subCategory,
        material,
        isFeatured,
        status,
        variants,
    } = req.body;

    if (variants) {
        const parsedVariants = JSON.parse(variants).map(v => ({
            size: v.size.toLowerCase(),
            color: v.color.toLowerCase(),
            stock: Number(v.stock)
        }));
        product.variants = parsedVariants;
    }

    // 4️⃣ update fields safely
    if (name) {
        product.name = name;
        product.slug = slugify(name, { lower: true });
    }

    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (discountPrice !== undefined) product.discountPrice = discountPrice;
    if (category) product.category = category;
    if (subCategory) product.subCategory = subCategory;
    if (material) product.material = material;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;
    if (status) product.status = status;

    // 5️⃣ save
    await product.save();

    return res.status(200).json(
        new ApiResponse(200, product, "Product updated successfully")
    );
});

const updateVariantStock = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { size, color, stock } = req.body;

    if (!size || !color || stock === undefined) {
        throw new ApiError(400, "size, color and stock are required");
    }

    const result = await Product.updateOne(
        {
            _id: id,
            "variants.size": size,
            "variants.color": color.toLowerCase()
        },
        {
            $set: { "variants.$.stock": stock }
        }
    );

    if (result.modifiedCount === 0) {
        throw new ApiError(404, "Variant not found");
    }

    return res.status(200).json(
        new ApiResponse(200, null, "Variant stock updated successfully")
    );
});

const addVariant = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { size, color, stock } = req.body;

    if (!size || !color || stock === undefined) {
        throw new ApiError(400, "size, color, stock required");
    }

    const product = await Product.findById(id);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const exists = product.variants.some(
        v => v.size === size && v.color === color.toLowerCase()
    );

    if (exists) {
        throw new ApiError(409, "Variant already exists");
    }

    product.variants.push({
        size,
        color: color.toLowerCase(),
        stock
    });

    await product.save();

    return res.status(200).json(
        new ApiResponse(200, product, "Variant added successfully")
    );
});

const updateProductImages = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!req.files || req.files.length === 0) {
        throw new ApiError(400, "Images required");
    }

    const product = await Product.findById(id);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const newImages = [];

    for (let file of req.files) {
        const url = await uploadToCloudinary(file.path);
        newImages.push(url);
        fs.unlinkSync(file.path);
    }

    product.images.push(...newImages);
    await product.save();

    return res.status(200).json(
        new ApiResponse(200, product, "Images added successfully")
    );
});

const removeProductImage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { imageUrl } = req.body;

    const product = await Product.findById(id);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    product.images = product.images.filter(img => img !== imageUrl);
    await product.save();

    return res.status(200).json(
        new ApiResponse(200, product, "Image removed successfully")
    );
});

const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid product id");
    }

    const product = await Product.findById(id);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    await product.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, "Product deleted successfully", product)
    );
});


const getAllCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({ isActive: true })
        .select("_id name");

    return res.status(200).json(
        new ApiResponse(200, categories, "Categories fetched successfully")
    );
})


export {
    createProduct,
    getAllProduct,
    getProductById,
    updateProduct,
    deleteProduct,
    updateVariantStock,
    addVariant,
    updateProductImages,
    removeProductImage,
    getAllCategories
}
