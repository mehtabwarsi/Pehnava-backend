import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

export const adminAuth = (roles = []) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer")) {
            throw new ApiError(401, "Unauthorized");
        }

        const token = authHeader.split(" ")[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (roles.length && !roles.includes(decoded.role)) {
                throw new ApiError(403, "Forbidden");
            }

            req.admin = decoded;
            next();
        } catch {
            throw new ApiError(401, "Invalid token");
        }
    };
};
