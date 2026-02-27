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
    var brand = req.query.brand;
           var device = req.params.device;
           var filter = {};
           if(brand) filter.brand = brand
           if(device) filter.type = device;
            const allmod = await Model.find(filter);
        res.render("recycle/recycle",{allmod});
});

router.get("/details/:id",async (req,res)=>{
    const id = req.params.id;
    const spe = await Model.findById(id);
    const questions = await Question.find({type:spe.type,intent:"recycle"},{_id:0});
    res.render("recycle/prod_spec",{spe,questions});
})

module.exports=router;