const mongoose = require("mongoose");
const express = require("express");
const app = express();
const Customer = require("./models/costumer.model");

const MONGO_URL = "mongodb://127.0.0.1:27017/MeraDukaan";


main().then(() =>{
    console.log("connected to DB");
}).catch((err) =>{
    console.log(err);
});


async function main() {
    await mongoose.connect(MONGO_URL);
};

app.get("/testCustomer", async(req,res) =>{
    let sampleCustomer = new Customer({
        username : "hercules12",
        email : "hercules12@gmail.com",
        password : "123asdc",
    });

    await sampleCustomer.save()
    console.log("sample was saved");
    res.send("successful testing");
})

app.listen(8080,() =>{
    console.log("server is listening to port 8080");
});