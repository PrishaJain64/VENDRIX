const express=require('express')
const {fetchisLoggedIn}=require('../middleware.js');
const {Review} = require('../models/reviews.js');
//controller include
const {saveReview,Like}=require('../Controller/reviews.js');


//image cloud storage
const multer = require('multer');
const {storage}=require('../Cloudinary');
const upload = multer({storage});

const router=express.Router();


router.post("/upload",fetchisLoggedIn,upload.array('reviewImages'),saveReview)

router.post("/like",fetchisLoggedIn,upload.none(),Like);

module.exports=router;