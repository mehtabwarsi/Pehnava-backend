import { Cart } from "../models/cart.model.js";

const getUserCart = async (userId) => {
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
        cart = await Cart.create({
            user: userId,
            items: [],
        });
    }

    return cart;
};

export {
    getUserCart
}



