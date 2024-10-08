import ApiResponse from "../utils/ApiResponse.js";
import Inventory from "../models/inventory.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import Product from "../models/product.model.js";

// ADD SINGLE PRODUCT INTO EXISTING INVENTORY OR CREATE NEW
const addProduct = async (req, res) => {

    const { product, price, stock, description } = req.body
    if (!product || !isValidObjectId(product)) return res.status(404).json(new ApiResponse(404, null, "Product Id missing or invalid"))

    const productExists = await Product.findById(product)
    if (!productExists) return res.status(404).json(new ApiResponse(404, null, "Product not found"))

    let inventory = await Inventory.findById(req.user._id)

    // If inventory doesn't exist, create a new one
    if (!inventory) {
        inventory = await Inventory.create({
            _id: req.user._id,
            productList: []
        });
        if (!inventory) {
            return res.status(500).json(new ApiResponse(500, null, "Failed to create inventory"));
        }
    }

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

const inventoryProds = async (req, res) => {
    const inventory = await Inventory.findById(req.user._id).select("productList.product");
    if (!inventory) return res.status(200).json(new ApiResponse(200, [], "No inventory found"));

    // Extract just the product IDs from the productList array
    const productIds = inventory.productList.map(item => item.product);

    // Respond with the product IDs only
    return res.status(200).json(new ApiResponse(200, productIds, "Found"));
}

// GET INVENTORY
const getInventory = async (req, res) => {
    const { vendorId } = req.params;
    if (!vendorId || !isValidObjectId(vendorId)) {
        return res.status(400).json(new ApiResponse(400, "", "Vendor Id missing"));
    }

    const inventory = await Inventory.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(vendorId)
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
            $addFields: {
                "productList.price": {
                    $cond: {
                        if: { $ifNull: ["$productList.price", false] },
                        then: "$productList.price",
                        else: "$productDetails.price"
                    }
                },
                "productList.product": {
                    _id: "$productDetails._id",
                    name: "$productDetails.name",
                    image: "$productDetails.image",
                    subCategory: "$productDetails.subCategory"
                }
            }
        },
        {
            $group: {
                _id: "$_id",
                productList: { $push: "$productList" }
            }
        }
    ]);
    if (inventory.length == 0) return res.status(200).json(new ApiResponse(200, [], "Inventory empty"));

    return res.status(200).json(new ApiResponse(200, inventory[0], "Inventory fetched"));
};


const inventoryOverview = async (req, res) => {
    const userId = req.user._id;

    // First, retrieve the inventory and find products that no longer exist
    const inventoryData = await Inventory.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(userId)
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
            $unwind: {
                path: "$productDetails",
                preserveNullAndEmptyArrays: true // Keep the product even if it doesn't exist
            }
        },
        {
            $project: {
                "productList.product": 1,  // Keep the original product reference
                "productDetails._id": 1,   // Check if the product exists in the Products collection
                "productDetails.category": 1,
                "productDetails.subCategory": 1
            }
        }
    ]);

    // Check if inventory data is empty
    if (inventoryData.length === 0) {
        return res.status(200).json(new ApiResponse(200, null, "Couldn't fetch inventory"));
    }

    // List of product IDs that are missing in the Products collection
    const missingProductIds = inventoryData
        .filter(item => !item.productDetails)  // If productDetails is missing, product doesn't exist
        .map(item => item.productList.product);  // Get the product IDs

    // If there are missing products, remove them from the inventory
    if (missingProductIds.length > 0) {
        await Inventory.updateOne(
            { _id: userId },
            { $pull: { productList: { product: { $in: missingProductIds } } } }
        );
    }

    // Create the category count
    const categoryCount = {};
    inventoryData.forEach(item => {
        if (item.productDetails) {
            const { category, subCategory } = item.productDetails;

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
        }
    });

    return res.status(200).json(new ApiResponse(200, categoryCount["Daily Needs"], "Inventory overview fetched and missing products removed"));
};


export {
    addProduct,
    addMultipleProducts,
    updateProduct,
    removeProduct,
    inventoryProds,
    getInventory,
    inventoryOverview,
}