import { connect } from "mongoose";
import express from "express";
const app = express();
import Customer from "./models/costumer.model.js";

const MONGO_URL = "mongodb://127.0.0.1:27017/MeraDukaan";


main().then(() =>{
    console.log("connected to DB");
}).catch((err) =>{
    console.log(err);
});


async function main() {
    await connect(MONGO_URL);
};

app.post("/testCustomer", async(req,res) =>{
    let sampleCustomer = await Customer.create({
        username : "hercules12",
        email : "hercules12@gmail.com",
        password : "123asdc",
    });

    console.log(sampleCustomer);

    
    res.send("successful testing");
})

app.listen(8080,() =>{
    console.log("server is listening to port 8080");
});