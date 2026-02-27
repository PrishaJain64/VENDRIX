const express=require('express')
const {Model} = require('../models/versions.js');

const router=express.Router();


router.get("/:device",async (req,res)=>{
       var brand = req.query.brand;
       var device = req.params.device;
       var filter = {};
       if(brand) filter.brand = brand
       if(device) filter.type = device;
        const allmod = await Model.find(filter);
        res.render("buy/buy",{allmod});
    })

router.get("/:id/:ctr",async (req,res)=>{
    const id = req.params.id;
    const ctr = req.params.ctr;
    const spe = await Model.findById(id);
    res.render("buy/product_spec",{spe,i:ctr});
})

router.post("/filters",async(req,res)=>{
    //brand, price,psort,nsort;
    const br = Array.isArray(req.body.brand) ? req.body.brand : [req.body.brand];
    const pr = Number(req.body.price);
    const psort = Number(req.body.psort);
    const nsort = Number(req.body.nsort);

    const match = {};
    const sort = {};

    if(pr) match["variants.0.price"] = {$lte : pr}
    if(br && !br.includes("all")) match["brand"] = {$in : br};
    if(psort && (psort===1 || psort === -1)) sort["variants.0.price"] = psort;
    if(nsort) sort["name"] = nsort;

    const pipeline = [];
    if(match && Object.keys(match).length >0){
        pipeline.push({$match : match});
    }
    if (sort && Object.keys(sort).length > 0) {
        pipeline.push({ $sort: sort });
    }

    const allmod = await Model.aggregate(pipeline).collation({locale :"en",strength : 2});
    res.render("buy/buy",{allmod});
})
module.exports=router;