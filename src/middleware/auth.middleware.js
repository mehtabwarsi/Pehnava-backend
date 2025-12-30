import admin from "../config/firebase.js";
import { ApiError } from "../utils/ApiError.js";

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new ApiError(401, "No token provided");
        }

        const token = authHeader.split(" ")[1];

        const decodedUser = await admin.auth().verifyIdToken(token);

        req.firebaseUser = decodedUser; // 🔥 important
        next();
    } catch (error) {
        next(new ApiError(401, "Invalid or expired token"));
    }
};

export default authMiddleware;
