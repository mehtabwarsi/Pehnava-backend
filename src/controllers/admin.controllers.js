import { Admin } from "../models/admin.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";


const createSuperAdmin = asyncHandler(async (req, res) => {
    const { name, email, password, secret } = req.body;

    // 🔐 SECRET CHECK
    if (secret !== process.env.SUPER_ADMIN_SECRET) {
        throw new ApiError(403, "Invalid secret key");
    }

    const exists = await Admin.findOne({ email });

    if (exists) {
        throw new ApiError(400, "Super admin already exists");
    }

    const admin = await Admin.create({
        name,
        email,
        password,
        role: "super_admin",
    });

    return res.status(201).json(
        new ApiResponse(201, "Super admin created successfully", {
            id: admin._id,
            email: admin.email,
            role: admin.role,
        })
    );
});

const adminLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password required");
    }

    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin || !admin.isActive) {
        throw new ApiError(401, "Invalid credentials");
    }

    const isMatch = await admin.isPasswordCorrect(password);
    if (!isMatch) {
        throw new ApiError(401, "Invalid credentials");
    }

    const token = await admin.generateToken();

    return res.status(200).json(
        new ApiResponse(200, "Admin logged in successfully", {
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
            },
        })
    );
});

export {
    createSuperAdmin,
    adminLogin,
};

