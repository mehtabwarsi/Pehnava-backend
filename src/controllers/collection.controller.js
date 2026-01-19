import { Collection } from "../models/collection.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import slugify from "slugify";
import { Product } from "../models/product.model.js";

// ➕ Create Collection (Admin)
export const createCollection = asyncHandler(async (req, res) => {
    const { title, subtitle, redirectUrl, position, isActive, description, isDynamic, filters, products } = req.body;

    const imageLocalPath = req.file?.path;

    if (!title) {
        throw new ApiError(400, "Title is required");
    }

    if (!imageLocalPath && !req.body.image) {
        throw new ApiError(400, "Image is required");
    }

    let imageUrl = req.body.image;
    if (imageLocalPath) {
        imageUrl = await uploadToCloudinary(imageLocalPath);
    }

    const parsedFilters = typeof filters === "string" ? JSON.parse(filters) : filters;
    const parsedProducts = typeof products === "string" ? JSON.parse(products) : products;

    const collection = await Collection.create({
        title,
        subtitle,
        image: imageUrl,
        slug: slugify(title, { lower: true }),
        redirectUrl,
        position: position || 0,
        isActive: isActive !== undefined ? isActive : true,
        description,
        isDynamic: isDynamic === "true" || isDynamic === true,
        filters: parsedFilters,
        products: parsedProducts,
        createdBy: req.admin?.id
    });

    return res.status(201).json(
        new ApiResponse(201, collection, "Collection created successfully")
    );
});

// 📄 Get All Collections (Public)
export const getCollections = asyncHandler(async (req, res) => {
    // If admin is requesting (based on some flag or auth middleware presence if reused), return all
    // For now, let's just return active ones for public, or handle query params

    // Simple logic: return all if no query param, or filter by isActive
    // Or strictly: Public gets only active. Admin gets all.
    // Let's make a generic one.

    const { isAdmin } = req.query;

    const query = {};
    if (isAdmin !== "true") {
        query.isActive = true;
    }

    const collections = await Collection.find(query)
        .sort({ position: 1, createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, collections, "Collections fetched successfully")
    );
});

// ✏️ Update Collection (Admin)
export const updateCollection = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const collection = await Collection.findById(id);

    if (!collection) {
        throw new ApiError(404, "Collection not found");
    }

    const { title, isDynamic, filters, products } = req.body;

    const imageLocalPath = req.file?.path;
    if (imageLocalPath) {
        const imageUrl = await uploadToCloudinary(imageLocalPath);
        req.body.image = imageUrl;
    }

    if (title && title !== collection.title) {
        req.body.slug = slugify(title, { lower: true });
    }

    if (filters) {
        req.body.filters = typeof filters === "string" ? JSON.parse(filters) : filters;
    }

    if (products) {
        req.body.products = typeof products === "string" ? JSON.parse(products) : products;
    }

    if (isDynamic !== undefined) {
        req.body.isDynamic = isDynamic === "true" || isDynamic === true;
    }

    Object.assign(collection, req.body);
    await collection.save();

    return res.status(200).json(
        new ApiResponse(200, collection, "Collection updated successfully")
    );
});

// ❌ Delete Collection (Admin)
export const deleteCollection = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const collection = await Collection.findById(id);

    if (!collection) {
        throw new ApiError(404, "Collection not found");
    }

    await collection.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, null, "Collection deleted successfully")
    );
});

// 🔍 Get Collection by Slug
export const getCollectionBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const collection = await Collection.findOne({ slug, isActive: true });

    if (!collection) {
        throw new ApiError(404, "Collection not found");
    }

    return res.status(200).json(
        new ApiResponse(200, collection, "Collection fetched successfully")
    );
});

// 📦 Get Products for Collection
export const getCollectionProducts = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skipValue = (pageNumber - 1) * limitNumber;

    const collection = await Collection.findOne({ slug, isActive: true });

    if (!collection) {
        throw new ApiError(404, "Collection not found");
    }

    let products = [];

    // Fetch manually linked products
    if (collection.products && collection.products.length > 0) {
        products = await Product.find({
            _id: { $in: collection.products },
            status: "active"
        })
            .populate("category", "name")
            .populate("subCategory", "name")
            .sort({ createdAt: -1 })
            .skip(skipValue)
            .limit(limitNumber);
    }

    const totalDocs = collection.products?.length || 0;
    const totalPages = Math.ceil(totalDocs / limitNumber);

    return res.status(200).json(
        new ApiResponse(200, {
            products,
            pagination: {
                totalDocs,
                totalPages,
                currentPage: pageNumber,
                limit: limitNumber
            }
        }, "Collection products fetched successfully")
    );
});
