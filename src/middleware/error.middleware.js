import { ApiError } from "../utils/ApiError.js";

export const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Mongoose / CastError handling (optional but good)
    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid ID format";
    }

    return res.status(statusCode).json({
        success: false,
        message,
        statusCode,
        errors: err.errors || [],
        data: null
    });
};
