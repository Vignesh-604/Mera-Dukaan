import { Schema , model } from "mongoose";


const customerSchema = new Schema({
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
    }

});

const Customer = model("Customer",customerSchema);
export default Customer;