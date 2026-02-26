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


router.get("/:device",async (req,res)=>{
        var device = req.params.device;
        const allmod = await Model.find({type:device});
        res.render("recycle/recycle",{allmod});
});

router.get("/details/:id",async (req,res)=>{
    const id = req.params.id;
    const spe = await Model.findById(id);
    const questions = await Question.find({type:spe.type,intent:"recycle"},{_id:0});
    res.render("recycle/prod_spec",{spe,questions});
})

module.exports=router;