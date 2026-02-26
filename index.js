if(process.env.NODE_ENV!=='production'){
    require('dotenv').config()
}

const express=require('express');
const mongoose=require('mongoose');
const ejsMate=require('ejs-mate');
const path=require('path');


const sellRoutes = require('./Routes/sell.js');
const brokenRoutes = require('./Routes/broken.js');
const buyRoutes = require('./Routes/buy');
const refurbishRoutes = require('./Routes/refurbish');
const recycleRoutes = require('./Routes/recycle');
const rentRoutes = require('./Routes/rent');


app=express();

app.engine('ejs',ejsMate);
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect("mongodb://127.0.0.1:27017/vendrix")
    .then(()=>{
        console.log("Mongo Connection Open");
    })
    .catch(err=>{
        console.log("Mongo Connection Failed");
});

app.use("/model",sellRoutes)
app.use('/allmodels',sellRoutes)
app.use("/answers",brokenRoutes)

app.use('/buy',buyRoutes)
app.use('/buydetails',buyRoutes)

app.use("/refurbish",refurbishRoutes);

app.use("/recycle",recycleRoutes);

app.use("/rent",rentRoutes);


app.get("/newmod",(req,res)=>{
    res.render("./features/mod.ejs");
})
app.get("/",(req,res)=>{
    res.render("features/device");
})


app.listen(3000,()=>{
    console.log(`Server Started`);
    require("./cron/schedular");
})
