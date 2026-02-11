const express=require('express')

//controller include
const products=require('../Controller/products')

//image cloud storage
const multer = require('multer');
const {storage}=require('../Cloudinary');
const { Product } = require('../models/products');
const upload = multer({storage});

const router=express.Router();


router.route('/')
    .get(products.renderAllProducts)
    .post(upload.array('image'),products.createProduct)

router.get('/new',products.renderNewPage)

router.get('/:id',products.renderProduct)

router.get('/:id/edit',async (req,res)=>{
    const {id}=req.params;
    const product=await Product.findById(id);

    res.render('products/edit',{product})
})
module.exports=router;