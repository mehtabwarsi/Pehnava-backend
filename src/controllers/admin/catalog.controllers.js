// controllers/catalog.controllers.js
import { Catalog } from "../../models/catalog.model.js";
import { SubCategory } from "../../models/subCategory.model.js";
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
        badge,
    } = req.body;

    const imageLocalPath = req.file?.path;

    if (!imageLocalPath && !req.body.image) {
        throw new ApiError(400, "Image file is required");
    }

    if (!title || !gender || !subCategory || !redirectUrl) {
        throw new ApiError(400, "All required fields must be provided");
    }

    let imageUrl = req.body.image;

    if (imageLocalPath) {
        imageUrl = await uploadToCloudinary(imageLocalPath);
    }

    const subCatExists = await SubCategory.findById(subCategory);
    if (!subCatExists) {
        throw new ApiError(404, "SubCategory not found");
    }

    const catalog = await Catalog.create({
        title,
        subtitle,
        gender,
        subCategory,
        image: imageUrl,
        redirectUrl,
        position,
        badge,
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
export const getActiveCatalogs = asyncHandler(async (req, res) => {
    const catalogs = await Catalog.find({ isActive: true })
        .populate("subCategory", "name")
        .sort({ position: 1 });

    const grouped = {
        men: [],
        women: [],
        unisex: [],
    };

    catalogs.forEach((item) => {
        grouped[item.gender].push(item);
    });

    return res.status(200).json(
        new ApiResponse(200, grouped, "Homepage catalogs fetched")
    );
});
