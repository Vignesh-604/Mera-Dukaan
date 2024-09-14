import React, { useState } from 'react';
import { Search, Info, Edit, Check, X } from 'lucide-react';
import img from "../Profiles/img1.webp";
import { products } from '../Listings/sampleData';

// Sorting available categories
const categories = products.reduce((acc, cur) => {
    if (!acc.includes(cur.category)) acc.push(cur.category)
    return acc
}, [])
// for (let i of products) {                                                // Above code in for loop format
//     if (!categories.includes(i.category)) categories.push(i.category)
// }

export default function Inventory() {
    const [editableProducts, setEditableProducts] = useState(products);
    const [editMode, setEditMode] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("All Categories");

    const handleEditToggle = (id) => {
        setEditMode(editMode === id ? null : id);
    };

    const handleFieldChange = (id, field, value) => {
        setEditableProducts((prev) =>
            prev.map((product) =>
                product.id === id ? { ...product, [field]: value } : product
            )
        );
    };

    const handleSave = (id) => {
        setEditMode(null);
        // Implement save logic if you need to persist the changes
    };

    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
    };

    const filteredProducts = selectedCategory === "All Categories"
        ? editableProducts
        : editableProducts.filter((product) => product.category === selectedCategory);

    return (
        <div className="p-4 bg-black/20 shadow-2xl shadow-black min-h-screen text-white rounded-lg">
            <h1 className='text-3xl font-semibold mb-6'>Inventory</h1>
            <div className=" mx-1 w-full ">
                <div className='flex max-sm:flex-col max-sm:space-y-2 items-center md:space-x-2 mb-6'>
                    <div className="flex items-center bg-gray-900 rounded-lg ps-2 pe-1 py-1 w-full border border-gray-800">
                        <input
                            type="text"
                            className="flex-grow bg-transparent px-2  text-white outline-none placeholder-gray-500"
                            placeholder="Search"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    // Handle search when Enter is pressed
                                }
                            }}
                        />
                        <button title="Search"
                            className="flex items-center justify-center h-10 w-10 bg-gray-800 rounded-full"
                            onClick={() => {
                                // Handle search when the button is clicked
                            }}
                        >
                            <Search size={20} className="text-white" />
                        </button>
                    </div>
                    <select
                        className="flex max-sm:w-full items-center text-md rounded-lg font-medium cursor-pointer bg-gray-800 text-white py-3 border border-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transform hover:scale-105 transition-transform"
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                    >
                        <option value="All Categories">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="pb-4 mt-4 grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                    <div
                        key={product.id}
                        className="flex flex-row bg-gray-800 shadow-md rounded-lg overflow-hidden border border-black/20 hover:border-white mx-2 p-4 "
                    >
                        <div className='me-2 pe-2'>
                            <img src={img} className='h-32 w-auto rounded-md' />
                        </div>

                        <div className='flex flex-col w-full'>
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="text-xl max-w-[270px] font-bold line-clamp-2 text-white" title={product.name}>
                                        {product.name}
                                    </h4>
                                    <p className="text-sm text-gray-300">{product.category}</p>
                                </div>
                                <div className="relative bottom-4 ms-1">
                                    <Info
                                        size={20}
                                        className="text-teal-500 cursor-pointer"
                                        onMouseEnter={(e) => {
                                            const tooltip = e.currentTarget.nextSibling;
                                            tooltip.classList.remove('hidden');
                                        }}
                                        onMouseLeave={(e) => {
                                            const tooltip = e.currentTarget.nextSibling;
                                            tooltip.classList.add('hidden');
                                        }}
                                    />
                                    <div className="absolute hidden w-48 p-2 text-xs text-white bg-black rounded-lg shadow-lg -right-2 top-8 z-10">
                                        {product.description}
                                    </div>
                                </div>
                            </div>

                            {editMode === product.id ? (
                                <>
                                    <input
                                        className="text-lg text-teal-400 mt-2 bg-gray-700 rounded p-1 "
                                        value={product.price}
                                        onChange={(e) => handleFieldChange(product.id, 'price', e.target.value)}
                                    />
                                    <textarea
                                        className="text-sm text-gray-300 mt-2 bg-gray-700 rounded p-1 "
                                        value={product.description}
                                        onChange={(e) => handleFieldChange(product.id, 'description', e.target.value)}
                                    />
                                    <div className="flex justify-between items-center mt-2">
                                        <select
                                            className="text-lg font-medium bg-gray-700 rounded p-1 text-white"
                                            value={product.inStock ? 'In Stock' : 'Out of Stock'}
                                            onChange={(e) => handleFieldChange(product.id, 'inStock', e.target.value === 'In Stock')}
                                        >
                                            <option value="In Stock">In Stock</option>
                                            <option value="Out of Stock">Out of Stock</option>
                                        </select>
                                        <div className="flex space-x-2">
                                            <button
                                                className="p-1 text-green-500"
                                                onClick={() => handleSave(product.id)}
                                            >
                                                <Check size={24} />
                                            </button>
                                            <button
                                                className="p-1 text-red-500"
                                                onClick={() => handleEditToggle(product.id)}
                                            >
                                                <X size={24} />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-lg font-semibold mt-2 text-teal-400">
                                        {product.price}
                                    </p>
                                    <p className={`text-sm mt-2 ${product.inStock ? 'text-green-400' : 'text-red-400'}`}>
                                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                                    </p>
                                    <div className="flex justify-end mt-auto">
                                        <button
                                            className="text-sm text-blue-500 font-semibold hover:underline"
                                            onClick={() => handleEditToggle(product.id)}
                                        >
                                            <Edit size={16} className="inline-block mr-1" /> Edit
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
