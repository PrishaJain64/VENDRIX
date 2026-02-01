if(process.env.NODE_ENV!=='production'){
    require('dotenv').config()
}

const express=require('express');
const mongoose=require('mongoose');
const ejsMate=require('ejs-mate');
const path=require('path');

//Route includes
const productRoutes=require('./Routes/products');


app=express();

app.engine('ejs',ejsMate);
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

app.use(express.urlencoded({extended:true}))
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/vendrix")
    .then(()=>{
        console.log("Mongo Connection Open");
    })
    .catch(err=>{
        console.log("Mongo Connection Failed");
});


app.use('/products',productRoutes)

app.listen(3000,()=>{
    console.log(`Server Started: http://localhost:3000/products`);
})
