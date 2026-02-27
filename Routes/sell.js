const express=require('express')
const {Model} = require('../models/versions.js');
const {Question} = require('../models/questions.js');
//controller include
const models=require('../Controller/products.js');

//image cloud storage
const multer = require('multer');
const {storage}=require('../Cloudinary/index.js');
const upload = multer({storage});

const router=express.Router();

//middleware import
const {isLoggedIn}=require('../middleware.js');

router.post("/",isLoggedIn,upload.array('image'),models.createModel)

<<<<<<< HEAD
router.get('/:intent/:device', async (req,res)=>{
=======
router.get('/:device/:intent',isLoggedIn, async (req,res)=>{
        var device = req.params.device;
>>>>>>> e1aa311c11ee63483992e64a14dac90f3aae2cf4
        var intent = req.params.intent;
        var brand = req.query.brand;
               var device = req.params.device;
               var filter = {};
               if(brand) filter.brand = brand
               if(device) filter.type = device;
                const allmod = await Model.find(filter);
        res.render("sell/sell",{allmod,intent});
})

router.get("/details/:id/:ctr/:intent",isLoggedIn,async (req,res)=>{
    const id = req.params.id;
    const intnt = req.params.intent;
    const i = req.params.ctr;

    const spe = await Model.findById(id);
    const questions = await Question.find({type:spe.type,intent:"repair"},{_id:0});
    res.render("sell/product_spec",{spe,questions,intnt,i});
})

module.exports=router;