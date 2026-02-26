const express=require('express')

//controller include
const models=require('../Controller/products');

//image cloud storage
const multer = require('multer');
const {storage}=require('../Cloudinary');
const { Product } = require('../models/products');
const upload = multer({storage});

const router=express.Router();


router.route('/')
    .post(upload.array('image'),models.saveBroken)

router.post("/valuation",upload.none(),models.findTotalrepair);
router.post("/recycle",upload.none(),models.findTotalrecycle);

router.get('/:id/edit',async (req,res)=>{
    const {id}=req.params;
    const product=await Product.findById(id);

    res.render('products/edit',{product})
})
module.exports=router;