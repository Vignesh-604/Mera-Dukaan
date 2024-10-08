import { useState, useEffect } from 'react';
import { ShoppingCart, Clock, Trash2 } from "lucide-react";
import { useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import Loading from '../AppPages/Loading';
import { convertToAmPm } from '../utility';

export default function Cart() {
    const customer = useOutletContext();
    const [cart, setCart] = useState([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (customer.userType !== "customer") {
            navigate(-1);
        } else {
            axios.get(`/api/customer/cart`)
                .then(res => {
                    const data = res.data.data;
                    const formattedCart = Object.entries(data).map(([id, cartData]) => {
                        const { vendorInfo, products } = cartData;
                        const total = products.reduce((sum, item) => sum + (item.price || item.product.price) * item.count, 0);

                        return {
                            id,
                            shopName: vendorInfo.shopName,
                            shopAddress: vendorInfo.location.address + ", " + vendorInfo.location.area || "No address available",
                            shopTimings: vendorInfo.shopTimings,
                            isOpen: vendorInfo.isOpen,
                            products: products.map(p => ({
                                name: p.product.name,
                                price: p.price || p.product.price
                            })),
                            total: `₹${total}`,
                        };
                    });
                    setCart(formattedCart);
                })
                .catch(e => console.error(e.response?.data?.message || e.message))
                .finally(() => setLoading(false));
        }
    }, []);

    const handleCardClick = (id) => {
        navigate("/order/place", { state: id });
    };

    const clearCart = () => {
        Swal.fire({
            title: "Are you sure?",
            html: "This will clear all your items for all vendors",
            icon: 'question',
            color: 'white',
            background: '#1a1a2e',
            showCancelButton: true,
            confirmButtonText: delivery ? 'Yes, Order!' : 'Okay',
            cancelButtonText: 'No, cancel',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed && delivery) {
                axios.delete(`/api/customer/cart/clear`)
                    .then(res => {
                        Swal.fire({
                            title: 'All clear!',
                            icon: 'success',
                            color: 'white',
                            background: '#1a1a2e',
                        });
                    })
                    .catch(e => console.error(e.response.data.message));
            }
        });
    }

    return (
        <div className="mx-auto my-4 max-w-7xl p-4 md:my-6 rounded-lg bg-black/20 shadow-lg shadow-black/50">
            <h2 className="text-3xl font-bold text-green-500 flex items-end">
                <ShoppingCart className="inline-flex w-10 h-10 me-2 items-start" />Your Cart
            </h2>
            <p className="mt-3 text-gray-300">
                Your cart items are sorted according to their respective vendors.
            </p>
            {cart.length > 0 ? (
                <>
                    <div className="mt-8 flex flex-col space-y-8">
                        {cart.map((vendor) => (
                            <div
                                key={vendor.id}
                                onClick={() => handleCardClick(vendor.id)}
                                className="flex flex-col bg-gray-800 shadow-lg shadow-black/40 overflow-hidden rounded-lg md:flex-row border border-gray-800 cursor-pointer hover:bg-gray-700 transition-colors"
                            >
                                <div className="w-full md:w-2/5 py-3 px-4 md:border-r border-gray-600 my-3 ">
                                    <div className="flex flex-col space-y-1.5 -my-3">
                                        <div className="flex justify-between">
                                            <p className='text-2xl font-bold text-yellow-500'>{vendor.shopName}</p>
                                            {vendor.isOpen ?
                                                <span className="text-green-500 flex items-center"><Clock className="w-4 h-4 mr-1" /> Open</span> :
                                                <span className="text-red-500 flex items-center"><Clock className="w-4 h-4 mr-1" /> Closed</span>
                                            }
                                        </div>
                                        <p className="text-md text-gray-400 line-clamp-3">
                                            <span className="font-semibold">Address:</span> {vendor.shopAddress}
                                        </p>
                                        <p className="text-md text-gray-400">
                                            <span className="font-semibold">Shop Timings: </span>
                                            {convertToAmPm(vendor.shopTimings.start) + " - " + convertToAmPm(vendor.shopTimings.end)}
                                        </p>
                                    </div>
                                </div>
                                <div className="w-full md:w-3/5 py-3 px-4 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Cart Items</h3>
                                        <ul className="mt-4 text-sm font-medium text-gray-400 list-disc list-inside">
                                            {vendor.products.slice(0, 2).map((product, index) => (
                                                <li key={index} className='truncate'>
                                                    {product.name} - {product.price}
                                                </li>
                                            ))}
                                            {vendor.products.length > 2 && (
                                                <li>...and {vendor.products.length - 2} other items</li>
                                            )}
                                        </ul>
                                    </div>
                                    <div className="md:mt-4">
                                        <hr className="my-2 border-t border-gray-600" />
                                        <div className="text-right">
                                            <h3 className="text-2xl font-bold">Total: <span className="text-yellow-500">{vendor.total}</span></h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className='w-full bg-stone-950/80 hover:bg-stone-800 text-white p-2 text-lg font-semibold rounded-md border border-stone-950/80 mt-4 transform hover:scale-95 transition-transform' onClick={clearCart}>
                        <Trash2 className='inline-flex' /> Clear cart for all vendors
                    </button>
                </>
            ) : (
                <div className="flex items-center justify-center h-full">
                    {loading ? <Loading /> : (
                        <p className="text-xl text-gray-400">Your cart is empty</p>
                    )}
                </div>
            )}
        </div>
    );
}
