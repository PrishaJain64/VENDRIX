const express=require('express')

//controller include
const models=require('../Controller/products');

//image cloud storage
const multer = require('multer');
const {storage}=require('../Cloudinary');
const upload = multer({storage});

const router=express.Router();


router.route('/')
    .post(upload.array('image'),models.saveBroken)

router.post("/valuation",upload.none(),models.findTotalrepair);
router.post("/recycle",upload.none(),models.findTotalrecycle);

module.exports=router;