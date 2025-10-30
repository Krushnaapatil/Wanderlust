const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");    // -> ../models/listing.js  THIS IS USED BECAUSE app.js is INSIDE ANOTHER FOLDER
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() => {
    console.log("connected to DB");
}).catch(err => {
    console.log(err);
});

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

const initDB = async () => {
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);
    console.log("data was initialize");
};

initDB();