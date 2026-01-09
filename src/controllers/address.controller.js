import { Address } from "../models/address.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addAddress = asyncHandler(async (req, res) => {
    const firebaseUser = req.firebaseUser;
    const user = await User.findOne({ firebaseUid: firebaseUser.uid });

    if (!user) throw new ApiError(404, "User not found");

    if (req.body.isDefault) {
        await Address.updateMany(
            { user: user._id },
            { isDefault: false }
        );
    }

    const address = await Address.create({
        ...req.body,
        user: user._id,
    });

    res.status(201).json(
        new ApiResponse(201, address, "Address added successfully")
    );
});

const getAddresses = asyncHandler(async (req, res) => {
    const firebaseUser = req.firebaseUser;
    const user = await User.findOne({ firebaseUid: firebaseUser.uid });

    const addresses = await Address.find({ user: user._id });

    res.json(
        new ApiResponse(200, addresses, "Addresses fetched successfully")
    );
});

const updateAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params;

    const address = await Address.findById(addressId);
    if (!address) throw new ApiError(404, "Address not found");

    if (req.body.isDefault) {
        await Address.updateMany(
            { user: address.user },
            { isDefault: false }
        );
    }

    Object.assign(address, req.body);
    await address.save();

    res.json(
        new ApiResponse(200, address, "Address updated successfully")
    );
});

const deleteAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params;

    const address = await Address.findByIdAndDelete(addressId);

    if (!address) {
        throw new ApiError(404, "Address not found");
    }

    return res.status(200).json(
        new ApiResponse(200, address, "Address deleted successfully")
    );
});


const setDefaultAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params;

    const address = await Address.findById(addressId);
    if (!address) throw new ApiError(404, "Address not found");

    await Address.updateMany(
        { user: address.user },
        { isDefault: false }
    );

    address.isDefault = true;
    await address.save();

    res.json(
        new ApiResponse(200, address, "Default address set")
    );
});



export {
    addAddress,
    getAddresses,
    updateAddress,
    deleteAddress,
    setDefaultAddress
}
