const express=require('express');
const mongoose=require('mongoose');
const ejsMate=require('ejs-mate');
const path=require('path');
const {Product}=require('./models/products');
const multer = require('multer');

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

var images = [];
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.body.products["type"];
    cb(null, `uploads/${type}/`);
  },
  filename: (req, file, cb) => {
    const brand = req.body.products["brand"];
    const name = req.body.products["name"];
    const model = req.body.products["model"];
    var fn = brand+name+model;

    if(file.fieldname === "products[thumbnail]") fn += "thumbnail";

    fn += Date.now()+".png";
    images.push(fn);
    cb(null, fn);
  }
});

const upload = multer({storage});

app.get('/products',async (req,res)=>{
    const products=await Product.find({});
    res.render("products/index",{products});
})

app.get('/products/new',(req,res)=>{
    res.render('products/new')
})


app.post('/products',upload.fields([
    { name: "products[image]", maxCount: 10 },
    { name: "products[thumbnail]" }
]),async (req,res)=>{
    
    const product=await new Product(req.body.products);
    product.specifications=req.body.specification;
    product.images = images.slice(0,-1);
    product.thumbnail = images[images.length-1];
    await product.save();
    res.redirect('/products');
})

app.get('/products/:id',async (req,res)=>{
    const {id}=req.params;
    const product=await Product.findById(id);
    res.render('products/show',{product});  
})

app.listen(3000,()=>{
    console.log(`Server Started: http://localhost:3000/products`);
})
