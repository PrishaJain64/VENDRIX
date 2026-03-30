const express=require('express')
const {Model} = require('../models/versions.js');
const {Question} = require('../models/questions.js');
//controller include
const {Filter,All,Download}=require('../Controller/recycle.js');

//image cloud storage
const multer = require('multer');
const {storage}=require('../Cloudinary/index.js');
const upload = multer({storage});

const router=express.Router();

router.get("/filters/:device",(req,res)=>{
    res.redirect("/recycle/"+req.params.device);
})

router.get("/details/:id",async (req,res)=>{
    const id = req.params.id;
    const spe = await Model.findById(id);
    const questions = await Question.find({type:spe.type,intent:"recycle"},{_id:0});
    res.render("recycle/prod_spec",{spe,questions});
})
router.post("/filters/:device",Filter);

router.get("/:device",All);

router.post("/downloadpdf",Download)
module.exports=router;