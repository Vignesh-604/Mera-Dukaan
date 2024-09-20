import ApiResponse from "../utils/ApiResponse.js";
import Inventory from "../models/inventory.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import Product from "../models/product.model.js";

const createInventory = async (req, res) => {

    const existing = await Inventory.findById(req.user._id)
    if (existing) return res.status(400).json(new ApiResponse(400, null, "Existing inventory"))

    const { productList } = req.body
    if (!productList) return res.status(404).json(new ApiResponse(404, null, "Product list missing"))

    const inventory = await Inventory.create({
        _id: req.user._id,
        productList
    })
    if (!inventory) return res.status(500).json(new ApiResponse(500, null, "Something went wrong"))

    return res.status(201).json(new ApiResponse(201, inventory, "Inventory created"))
}

// ADD SINGLE PRODUCT
const addProduct = async (req, res) => {

    const { product, price, stock, description } = req.body
    if (!product || !isValidObjectId(product)) return res.status(404).json(new ApiResponse(404, null, "Product Id missing or invalid"))

    const productExists = await Product.findById(product)
    if (!productExists) return res.status(404).json(new ApiResponse(404, null, "Product not found"))

    const inventory = await Inventory.findById(req.user._id)

    const duplicate = inventory.productList.find(prod => prod.product._id.toString() === product);
    if (duplicate) return res.status(400).json(new ApiResponse(400, null, "Product exists"))

    let newProduct = {
        product,
        stock,
    }
    if (price) newProduct["price"] = price
    if (description) newProduct["description"] = description

    inventory.productList.push(newProduct)

    const updatedList = await inventory.save({ validateBeforeSave: false })
    if (!product) return res.status(500).json(new ApiResponse(500, null, "Something went wrong"))

    return res.status(200).json(new ApiResponse(200, updatedList, "Added"))
}


// ADD MULTIPLE PRODUCTS
const addMultipleProducts = async (req, res) => {
    const { productList } = req.body;

    const inventory = await Inventory.findById(req.user._id);
    if (!inventory) return res.status(404).json(new ApiResponse(404, null, "Inventory not found"));

    let newItems = [];
    for (let product of productList) {
        const productExists = await Product.findById(product._id);
        if (!productExists) return res.status(404).json(new ApiResponse(404, null, "Product not found"));

        const duplicate = inventory.productList.find(prod => prod.product.toString() === product._id.toString());
        if (duplicate) return res.status(400).json(new ApiResponse(400, null, `Product ${product._id} already exists in inventory`));

        let newProduct = {
            product: product._id,
            stock: product.stock,
        };
        if (product.price) newProduct["price"] = product.price;
        if (product.description) newProduct["description"] = product.description;

        newItems.push(newProduct);
    }

    inventory.productList.push(...newItems);

    const updatedList = await inventory.save({ validateBeforeSave: false });
    if (!updatedList) return res.status(500).json(new ApiResponse(500, null, "Something went wrong while saving inventory"));

    return res.status(200).json(new ApiResponse(200, updatedList, "Products added to inventory"));
};


// UPDATE PRODUCT
const updateProduct = async (req, res) => {
    const { productId } = req.params
    if (!productId || !isValidObjectId(productId)) return res.status(400).json(new ApiResponse(400, "", "Product Id missing"))

    const { price, description, stock } = req.body

    const inventory = await Inventory.findById(req.user?._id)

    const product = inventory.productList.find(prod => prod.product._id.toString() === productId);
    if (!product) {
        return res.status(404).json(new ApiResponse(404, "", "Product not found in inventory"));
    }

    if (typeof stock !== 'undefined') product.stock = stock
    if (price) product.price = price
    if (description) product.description = description

    const updatedProduct = await inventory.save({ validateBeforeSave: false })
    return res.status(200).json(new ApiResponse(200, updatedProduct, "Product updated successfully"))
}


// DELETE PRODUCT
const removeProduct = async (req, res) => {
    const { productId } = req.params
    if (!productId || !isValidObjectId(productId)) return res.status(400).json(new ApiResponse(400, "", "Product Id missing"))

    const inventory = await Inventory.findById(req.user?._id)

    const initialLength = inventory.productList.length;

    inventory.productList = inventory.productList.filter(prod => prod.product._id.toString() !== productId);

    if (inventory.productList.length === initialLength) {
        return res.status(404).json(new ApiResponse(404, null, "Product not found in inventory"));
    }
    const updatedProduct = await inventory.save({ validateBeforeSave: false })
    return res.status(200).json(new ApiResponse(200, updatedProduct, "Product updated successfully"))
}


// GET INVENTORY
const getInventory = async (req, res) => {
    const { vendorId } = req.params
    if (!vendorId || !isValidObjectId(vendorId)) return res.status(400).json(new ApiResponse(400, "", "Vendor Id missing"))

    const inventory = await Inventory.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(vendorId)
            }
        },
        {
            $unwind: "$productList"  // Deconstruct the productList array
        },
        {
            $lookup: {
                from: "products",
                localField: "productList.product",
                foreignField: "_id",
                as: "productDetails"
            }
        },
        {
            $unwind: "$productDetails"  // Deconstruct the productDetails array
        },
        {
            $project: {
                "productDetails.createdAt": 0,  // Exclude createdAt
                "productDetails.updatedAt": 0,  // Exclude updatedAt
            }
        },
        {
            $addFields: {
                "productList.product": "$productDetails"  // Replace the product field in productList with the full product details
            }
        },
        {
            $group: {
                _id: "$_id",
                productList: { $push: "$productList" },  // Reconstruct the productList array
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, inventory, "Inventory fetched"))
}

const inventoryOverview = async (req, res) => {
    const inventoryData = await Inventory.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $unwind: "$productList"
        },
        {
            $lookup: {
                from: "products",
                localField: "productList.product",
                foreignField: "_id",
                as: "productDetails"
            }
        },
        {
            $unwind: "$productDetails"
        },
        {
            $project: {
                "productDetails.category": 1,
                "productDetails.subCategory": 1,
            }
        },
        {
            $addFields: {
                "productList.product": "$productDetails"  // Replace the product field in productList with the full product details
            }
        },
        {
            $group: {
                _id: "$_id",
                productList: { $push: "$productList" },  // Reconstruct the productList array
            }
        }
    ]);

    // Check if inventory data is empty
    if (inventoryData.length === 0) {
        return res.status(400).json(new ApiResponse(400, null, "Couldn't fetch inventory"));
    }

    // Assuming you expect only one inventory record for the user
    const inventory = inventoryData[0];

    const categoryCount = {};

    inventory.productList.forEach(({ product }) => {
        const { category, subCategory } = product;

        // If the category doesn't exist, initialize it
        if (!categoryCount[category]) {
            categoryCount[category] = {};
        }

        // If the subCategory doesn't exist within the category, initialize it
        if (!categoryCount[category][subCategory]) {
            categoryCount[category][subCategory] = 0;
        }

        // Increment the count of subCategory
        categoryCount[category][subCategory]++;
    });

    console.log(categoryCount);

    return res.status(200).json(new ApiResponse(200, categoryCount, "Inventory overview fetched"));
};


export {
    createInventory,
    addProduct,
    addMultipleProducts,
    updateProduct,
    removeProduct,
    getInventory,
    inventoryOverview,
}