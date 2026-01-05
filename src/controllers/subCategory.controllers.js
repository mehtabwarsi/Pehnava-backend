import { ApiResponse } from "../utils/ApiResponse.js";
import { SubCategory } from "../models/subCategory.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const getSubCategoriesByCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.query;

    const filter = categoryId ? { categoryId } : {};

    const subCategories = await SubCategory.find(filter)
        .select("_id name categoryId");

    return res.status(200).json(
        new ApiResponse(200, subCategories, "SubCategories fetched successfully")
    );
});


export { getSubCategoriesByCategory }