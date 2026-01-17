import { ApiResponse } from "../utils/ApiResponse.js";
import { Category } from "../models/category.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const getAllCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({ isActive: true })
        .select("_id name");

    return res.status(200).json(
        new ApiResponse(200, categories, "Categories fetched successfully")
    );
})


export { getAllCategories }