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


router.post("/",upload.array('image'),models.createModel)

router.get('/:device/:intent', async (req,res)=>{
        var device = req.params.device;
        var intent = req.params.intent;
        const allmod = await Model.find({type:device});
        res.render("sell/sell",{allmod,intent});
})

router.get("/details/:id/:ctr/:intent",async (req,res)=>{
    const id = req.params.id;
    const intnt = req.params.intent;
    const i = req.params.ctr;

    const spe = await Model.findById(id);
    const questions = await Question.find({type:spe.type,intent:"repair"},{_id:0});
    res.render("sell/product_spec",{spe,questions,intnt,i});
})

module.exports=router;