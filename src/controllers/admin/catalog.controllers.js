// controllers/catalog.controllers.js
import { Catalog } from "../../models/catalog.model.js";
import { SubCategory } from "../../models/subCategory.model.js";
import { Product } from "../../models/product.model.js";
import { Category } from "../../models/category.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadToCloudinary } from "../../utils/cloudinary.js";

/* =====================================================
   ADMIN CONTROLLERS
===================================================== */

// ➕ Create Catalog
export const createCatalog = asyncHandler(async (req, res) => {
    const {
        title,
        subtitle,
        gender,
        subCategory,
        redirectUrl,
        position,

    } = req.body;

    const imageLocalPath = req.file?.path;

    if (!imageLocalPath && !req.body.image) {
        throw new ApiError(400, "Image file is required");
    }

    if (!title || !gender || !redirectUrl) {
        throw new ApiError(400, "All required fields must be provided");
    }

    let imageUrl = req.body.image;

    if (imageLocalPath) {
        imageUrl = await uploadToCloudinary(imageLocalPath);
    }

    if (subCategory) {
        const subCatExists = await SubCategory.findById(subCategory);
        if (!subCatExists) {
            throw new ApiError(404, "SubCategory not found");
        }
    }

    const catalog = await Catalog.create({
        title,
        subtitle,
        gender,
        subCategory,
        image: imageUrl,
        redirectUrl,
        position,

        createdBy: req.admin.id,
    });

    return res.status(201).json(
        new ApiResponse(201, catalog, "Catalog created successfully")
    );
});

// 📄 Get All Catalogs (Admin)
export const getAllCatalogsAdmin = asyncHandler(async (req, res) => {
    const catalogs = await Catalog.find()
        .populate("subCategory", "name")
        .sort({ position: 1, createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, catalogs, "Catalogs fetched successfully")
    );
});

// ✏️ Update Catalog
export const updateCatalog = asyncHandler(async (req, res) => {
    const catalog = await Catalog.findById(req.params.id);
    if (!catalog) {
        throw new ApiError(404, "Catalog not found");
    }

    const imageLocalPath = req.file?.path;
    if (imageLocalPath) {
        const imageUrl = await uploadToCloudinary(imageLocalPath);
        req.body.image = imageUrl;
    }

    Object.assign(catalog, req.body);
    await catalog.save();

    return res.status(200).json(
        new ApiResponse(200, catalog, "Catalog updated successfully")
    );
});

// ❌ Delete Catalog
export const deleteCatalog = asyncHandler(async (req, res) => {
    const catalog = await Catalog.findById(req.params.id);
    if (!catalog) {
        throw new ApiError(404, "Catalog not found");
    }

    await catalog.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, null, "Catalog deleted successfully")
    );
});

/* =====================================================
   PUBLIC CONTROLLER (FRONTEND)
===================================================== */

// 🌍 Homepage Catalog
// 🌍 Homepage Catalog
export const getActiveCatalogs = asyncHandler(async (req, res) => {
    // 1. Fetch active catalogs
    const catalogs = await Catalog.find({ isActive: true })
        .populate("subCategory", "name")
        .sort({ position: 1 })
        .lean(); // Use lean to return plain JS objects

    // 2. Fetch Categories (men, women, unisex) to map IDs
    const categories = await Category.find({
        name: { $in: ["men", "women", "unisex"] }
    }).lean();

    const categoryMap = {};
    categories.forEach(cat => {
        categoryMap[cat.name] = cat._id;
    });

    // 3. Calculate counts for each catalog
    const catalogsWithCounts = await Promise.all(
        catalogs.map(async (item) => {
            const categoryId = categoryMap[item.gender];

            const query = {
                status: "active",
                category: categoryId
            };

            if (item.subCategory?._id) {
                query.subCategory = item.subCategory._id;
            }

            const count = await Product.countDocuments(query);

            return {
                ...item,
                subtitle: `${count} Items` // Override subtitle
            };
        })
    );

    // 4. Group by gender
    const grouped = {
        men: [],
        women: [],
        unisex: [],
    };

    catalogsWithCounts.forEach((item) => {
        if (grouped[item.gender]) {
            grouped[item.gender].push(item);
        }
    });

    return res.status(200).json(
        new ApiResponse(200, grouped, "Homepage catalogs fetched")
    );
});
