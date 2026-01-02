import { Product } from "../models/product.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
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
        colors,
        stock,
        isFeatured,
        gender,
        material,

    } = req.body;

    if (!name || !price || !images?.length || !gender || !category || !material) {
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
        gender,
        category,
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
    const products = await Product.find();
    return res.status(200).json(
        new ApiResponse(200, "Products fetched successfully", products)
    );
});


export {
    createProduct,
    getAllProduct
}
