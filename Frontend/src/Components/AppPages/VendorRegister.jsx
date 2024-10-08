import { useState, useEffect } from 'react';
import logo from "../assets/logo.png";
import { Link, useNavigate } from 'react-router-dom';
import Cookies from "js-cookie"
import axios from "axios"
import Toggle from 'react-toggle'
import "react-toggle/style.css";
import PasswordStrengthIndicator from './PasswordChecker';

const shopOpenOptions = [
    'Everyday',
    'Weekdays',
    'Sundays Off',
    'Saturdays Off',
    'Mon-Sat'
];

const returnPolicyOptions = [
    'Return Available',
    'Exchange Available',
    'No Returns',
    'No Exchange',
    'No Return if Used'
];

export default function VendorRegister() {
    const [errorMessage, setErrorMessage] = useState("");
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        shopName: "",
        shopType: "",
        registrationNumber: "",
        address: "",
        city: "",
        area: "",
        pincode: "",
        primary: "",
        secondary: "",
        shopOpen: "",
        start: "",
        end: "",
        returnPol: "",
        delivery: true,
    });
    const [shopImageFile, setShopImageFile] = useState(null);

    const [showPassword, setShowPassword] = useState(false);
    const [passwordMatch, setPasswordMatch] = useState(false);

    const navigate = useNavigate();
    // If user logged in then redirect to home page
    useEffect(() => {
        const user = Cookies.get("user") ? true : false

        if (user) navigate(-1)
    }, [])

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setFormData(prevData => ({
            ...prevData,
            password: value
        }));
        setPasswordMatch(value === formData.confirmPassword);
    };

    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value;
        setFormData(prevData => ({
            ...prevData,
            confirmPassword: value
        }));
        setPasswordMatch(value === formData.password);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleInput = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    }

    const handleToggleChange = (name) => (e) => {
        setFormData(prevData => ({
            ...prevData,
            [name]: e.target.checked
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formDataToSend = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== "" && formData[key] !== null && formData[key] !== undefined) {
                formDataToSend.append(key, formData[key]);
            }
        });

        if (shopImageFile) {
            formDataToSend.append('shopImage', shopImageFile);
        }

        axios.post(`/api/vendor/register`, formDataToSend, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        .then(res => {
            Swal.fire({
                title: 'Registration Successful!',
                text: 'Add products to your inventory now, so customers can see what you offer!',
                icon: 'success',
                confirmButtonText: 'Let\'s Go!'
            });
            
            navigate("/vendor/overview")
        })
        .catch(e => console.error(e.response.data.message));
    }

    const inputStyle = "shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline";
    const labelStyle = "block text-sm font-medium text-gray-300 mb-1";

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto bg-zinc-900 shadow-xl shadow-black/70 rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                        <img src={logo} alt="MeraDukaan Logo" className="logo h-24" />
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-semibold text-center text-yellow-300">Register your shop on MeraDukaan!</h1>
                            <p className='flex justify-center mt-2 -mb-2 font-semibold'>Already have an account? &nbsp;
                                <Link className='text-teal-500' to={"/signin"}>
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {/* PERSONAL DETAILS SECTION */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-2">Personal Details</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="mb-2">
                                <label htmlFor="username" className={labelStyle}>Owner's Name</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInput}
                                    placeholder="Full Name"
                                    required
                                    className={inputStyle}
                                />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="email" className={labelStyle}>Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInput}
                                    placeholder="Email Address"
                                    required
                                    className={inputStyle}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="password" className={labelStyle}>Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handlePasswordChange}
                                        className={inputStyle}
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute right-0 top-0 mt-2 mr-2 text-gray-600"
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                                {formData.password && (
                                    <PasswordStrengthIndicator password={formData.password} />
                                )}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="confirm-password" className={labelStyle}>Confirm Password</label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="confirm-password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                    className={inputStyle}
                                    placeholder="Re-enter your password"
                                />
                                {formData.confirmPassword && (
                                    <p className={`text-sm mt-2 ${passwordMatch ? 'text-green-600' : 'text-red-600'}`}>
                                        {passwordMatch ? 'Passwords match' : 'Passwords do not match'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SHOP DETAILS SECTION */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-2">Shop Details</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="mb-2">
                                <label htmlFor="shopName" className={labelStyle}>Shop Name</label>
                                <input
                                    type="text"
                                    id="shopName"
                                    name="shopName"
                                    value={formData.shopName}
                                    onChange={handleInput}
                                    placeholder="Shop Name"
                                    required
                                    className={inputStyle}
                                />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="shopType" className={labelStyle}>Shop Type</label>
                                <select
                                    id="shopType"
                                    name="shopType"
                                    value={formData.shopType}
                                    onChange={handleInput}
                                    required
                                    className={inputStyle}
                                >
                                    <option value="General">General</option>
                                </select>
                            </div>
                            <div className="mb-2">
                                <label htmlFor="registrationNumber" className={labelStyle}>Registration Number</label>
                                <input
                                    type="text"
                                    id="registrationNumber"
                                    name="registrationNumber"
                                    value={formData.registrationNumber}
                                    onChange={handleInput}
                                    placeholder="Registration Number"
                                    required
                                    className={inputStyle}
                                />
                            </div>
                            <div className="col-span-full mb-2">
                                <label htmlFor="address" className={labelStyle}>Address</label>
                                <textarea
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInput}
                                    placeholder="Full Address"
                                    required
                                    className={`${inputStyle} resize-none`}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="mb-2">
                                <label htmlFor="city" className={labelStyle}>City</label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInput}
                                    placeholder="City"
                                    required
                                    className={inputStyle}
                                />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="area" className={labelStyle}>Area</label>
                                <input
                                    type="text"
                                    id="area"
                                    name="area"
                                    value={formData.area}
                                    onChange={handleInput}
                                    placeholder="Area"
                                    required
                                    className={inputStyle}
                                />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="pincode" className={labelStyle}>Pincode</label>
                                <input
                                    type="number"
                                    id="pincode"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleInput}
                                    placeholder="Pincode"
                                    required
                                    className={inputStyle}
                                />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="shopImage" className={labelStyle}>Shop Image</label>
                                <input
                                    type="file"
                                    id="shopImage"
                                    onChange={(e) => setShopImageFile(e.target.files[0])}
                                    required
                                    className={`${inputStyle} py-1.5 text-gray-300`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* CONTACT AND OPERATIONS SECTION */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-2">Contact & Operations</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="mb-2">
                                <label htmlFor="primary" className={labelStyle}>Primary Contact</label>
                                <input
                                    type="number"
                                    id="primary"
                                    name="primary"
                                    value={formData.primary}
                                    onChange={handleInput}
                                    placeholder="Primary Phone"
                                    required
                                    className={inputStyle}
                                />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="secondary" className={labelStyle}>Secondary Contact</label>
                                <input
                                    type="number"
                                    id="secondary"
                                    name="secondary"
                                    value={formData.secondary}
                                    onChange={handleInput}
                                    placeholder="Secondary Phone (Optional)"
                                    className={inputStyle}
                                />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="shopOpen" className={labelStyle}>Shop Open Days</label>
                                <select
                                    id="shopOpen"
                                    name="shopOpen"
                                    value={formData.shopOpen}
                                    onChange={handleInput}
                                    required
                                    className={inputStyle}
                                >
                                    {shopOpenOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="mb-2">
                                <label htmlFor="start" className={labelStyle}>Shop Start Time</label>
                                <input
                                    type="time"
                                    id="start"
                                    name="start"
                                    value={formData.start}
                                    onChange={handleInput}
                                    required
                                    className={inputStyle}
                                />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="end" className={labelStyle}>Shop End Time</label>
                                <input
                                    type="time"
                                    id="end"
                                    name="end"
                                    value={formData.end}
                                    onChange={handleInput}
                                    required
                                    className={inputStyle}
                                />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="returnPol" className={labelStyle}>Return Policy</label>
                                <select
                                    id="returnPol"
                                    name="returnPol"
                                    value={formData.returnPol}
                                    onChange={handleInput}
                                    className={inputStyle}
                                >
                                    {returnPolicyOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-2">
                                <label htmlFor="delivery" className={labelStyle}>Delivery Available</label>
                                <div className='mt-3'>
                                    <Toggle
                                        id="delivery"
                                        name="delivery"
                                        checked={formData.delivery}
                                        onChange={handleToggleChange('delivery')}
                                        className="align-middle"
                                    />
                                    <span className="ml-2 text-sm text-gray-300">
                                        {formData.delivery ? "Yes" : "No"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ERROR  AND BUTTON SECTION */}
                    {errorMessage && (
                        <div className="mb-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {errorMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-teal-600 text-black font-semibold py-2 px-4 rounded-md hover:bg-teal-700 transition duration-300"
                    >
                        Register Shop
                    </button>
                    <p className="text-center text-gray-300 mt-2 -mb-1">
                        * Your details will be submitted for verification.
                        Your shop will be registered on MeraDukaan once the verification process is complete.
                        You will be notified shortly.
                    </p>

                </form>
            </div>
        </div>
    );
}