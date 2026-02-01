const express=require('express')

//controller include
const products=require('../Controller/products')

//image cloud storage
const multer = require('multer');
const {storage}=require('../Cloudinary');
const upload = multer({storage});

const router=express.Router();


router.route('/')
    .get(products.renderAllProducts)
    .post(upload.array('image'),products.createProduct)

router.get('/new',products.renderNewPage)

router.get('/:id',products.renderProduct)

module.exports=router;