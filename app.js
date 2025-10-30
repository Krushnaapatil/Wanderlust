const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");

let port = 3000;

main().then(() => {
    console.log("connected to DB");
}).catch(err => {
    console.log(err);
})

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.get("/",(req,res) => {
    res.redirect("/listings");
});

const validateListing = (req,res,next) =>{
    let {error} = listingSchema.validate(req.body);  // For schema validation
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}

//INDEX ROUTE
app.get("/listings",wrapAsync(async (req,res) =>{
    const listings = await Listing.find({});
    // console.log(listings);
    res.render("listings/index.ejs",{listings});
}));

//NEW ROUTE make sure to put it before the Show route
//because inShow route /listings/:id is used first
//and for /listing/new i is searching for a new id
app.get("/listings/new",(req,res) =>{
    // console.log("on new ")
    res.render("listings/new.ejs");
});

// SHOW ROUTE 
app.get("/listings/:id",wrapAsync( async (req,res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs",{ listing });
}));

//CREATE ROUTE
app.post("/listings", validateListing, wrapAsync  (async (req,res,next) =>{
        // if(!req.body.listing){
        //     throw new ExpressError(400,"Send valid data for listing");
        // }

         //method 1 to extract
        // let{title,description,image,price,country,location} = req.body;
        //method 2
        // let listing = req.body.listing;
        
        
        const listing = new Listing(req.body.listing);   //creating the instance of it 
        await listing.save();
        res.redirect("/listings");
}));

//EDIT ROUTE
app.get("/listings/:id/edit",wrapAsync( async (req,res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

//ACTUAL UPDATE ROUTE AFTER EDIT
app.put("/listings/:id",validateListing, wrapAsync( async (req,res) => {
    // if(!req.body.listing){
    //     throw new ExpressError(400,"Send valid data for listing");
    // }
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

//DELETE ROUTE
app.delete("/listings/:id",wrapAsync( async (req,res) =>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

// app.get("/testListing",async (req,res) =>{
//     let sampleListing = new Listing({
//         title :"My new Villa",
//         description:"by the beach",
//         price:1200,
//         location:"Calangute,Goa",
//         country :"India",
//     });

//     await sampleListing.save();
//     console.log("Sample saved");
//     res.send("succsessful testing");
// });

app.all("*",(req,res,next) => {  // For Page Not found error
    next(new ExpressError(404,"Page Not Found!"));
});

app.use((err,req,res,next) =>{
    let {statusCode=500,message="Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message); 
    // res.send("something went wrong!");
});

app.listen(port,() =>{
    console.log("server is listening");
});