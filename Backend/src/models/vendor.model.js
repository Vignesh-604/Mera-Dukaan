const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const vendorSchema = new Schema({
    username: {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    } ,
    password : {
        type : String,
        required : true
    },
    shopid : {
        type : Number,
        required : true
    },
    shopname: {
        type : String,
        required : true
    },
    shopaddress : {
        type : String,
        required : true
    },
    pincode : {
        type : Number,
        required :true
    },
    phoneno : {
        type : Number,
        required : true
    }

});

const Vendor = mongoose.model("Vendor",vendorSchema);
module.exports = Vendor;