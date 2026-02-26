const express=require('express')
const {Model} = require('../models/versions.js');

const router=express.Router();


router.get("/:device",async (req,res)=>{
        var device = req.params.device;
        const allmod = await Model.find({type:device});
        res.render("buy/buy",{allmod});
    })

router.get("/:id/:ctr",async (req,res)=>{
    const id = req.params.id;
    const ctr = req.params.ctr;
    const spe = await Model.findById(id);
    res.render("buy/product_spec",{spe,i:ctr});
})

module.exports=router;