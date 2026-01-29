const express=require('express');
const mongoose=require('mongoose');
const ejsMate=require('ejs-mate');
const path=require('path');
const {Product}=require('./models/products');

app=express();

app.engine('ejs',ejsMate);
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');
app.use(express.urlencoded({extended:true}))
mongoose.connect("mongodb://127.0.0.1:27017/vendrix")
    .then(()=>{
        console.log("Mongo Connection Open");
    })
    .catch(err=>{
        console.log("Mongo Connection Failed");
    });


app.get('/products',async (req,res)=>{
    const products=await Product.find({});
    res.render("products/index",{products});
})
app.get('/products/new',(req,res)=>{
    res.render('products/new')
})

app.post('/products',async (req,res)=>{
    const product=await new Product(req.body.products);
    await product.save();
    res.redirect('/products');
})

app.listen(3000,()=>{
    console.log(`Server Started:http://localhost:3000/products`);
})
