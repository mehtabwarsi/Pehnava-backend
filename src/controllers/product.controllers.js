import { Product } from "../models/product.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import slugify from "slugify";

const createProduct = asyncHandler(async (req, res) => {
    const {
        name,
        description,
        price,
        discountPrice,
        category,
        images,
        sizes,
        subCategory,
        colors,
        stock,
        isFeatured,
        material,

    } = req.body;

    if (!name || !price || !images?.length || !category || !material || !subCategory) {
        throw new ApiError(400, "Required fields missing");
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
        images,
        sizes,
        colors,
        stock,
        material,
        isFeatured,
        createdBy: req.admin.id, // adminAuth se aa raha
    });

    return res.status(201).json(
        new ApiResponse(201, "Product created successfully", product)
    );
});

const getAllProduct = asyncHandler(async (req, res) => {
    const products = await Product.find({ status: "active" })
        .populate("category", "name")
        .populate("subCategory", "name")
    return res.status(200).json(
        new ApiResponse(200, "Products fetched successfully", products)
    );
});

const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid product id");
    }

    const product = await Product.findById(id);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return res.status(200).json(
        new ApiResponse(200, "Product fetched successfully", product)
    );
});

const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name,
        description,
        price,
        discountPrice,
        category,
        images,
        sizes,
        colors,
        stock,
        isFeatured,
        gender,
        material } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid product id");
    }

    const product = await Product.findById(id);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    if (name) {
        product.name = name;
        product.slug = slugify(name, { lower: true });
    }
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (discountPrice !== undefined) product.discountPrice = discountPrice;
    if (category) product.category = category;
    if (images) product.images = images;
    if (sizes) product.sizes = sizes;
    if (colors) product.colors = colors;
    if (stock !== undefined) product.stock = stock;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;
    if (gender) product.gender = gender;
    if (material) product.material = material;

    await product.save();

    return res.status(200).json(
        new ApiResponse(200, "Product updated successfully", product)
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


export {
    createProduct,
    getAllProduct,
    getProductById,
    updateProduct,
    deleteProduct
}
