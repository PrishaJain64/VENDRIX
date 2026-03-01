const express=require('express')
const {Product} = require('../models/products');
const models = require("../Controller/products");
const router=express.Router();

const multer = require('multer');
const {storage}=require('../Cloudinary/index.js');
const upload = multer({storage});

router.get("/:device",async (req,res)=>{
    var filter = {};
    var pr=0;
       var psort=0;
       var nsort = 0;
       var br = [];
    filter["intent"] = "rent";
    filter["available"] = true;
        var device = req.params.device;
        if(device && device != "all") filter["type"] = device;

        const allmod = await Product.aggregate([
            {$match : filter},
            {$group : {
                _id : "$name",
                doc : {$first : "$$ROOT"}
            }},
            {$replaceRoot : {newRoot : "$doc"}},
            {$sort : {name : 1}}
        ]);
        res.render("rent/rent",{allmod,device,pr,psort,nsort,br});
    })

router.get("/details/:name/:ctr",async (req,res)=>{
    const prod_name = req.params.name;
    const ctr = Number(req.params.ctr);

    const spe = await Product.aggregate([
            {$match : {name : prod_name}},
            {$group : {
                _id : "$variant",
                doc : {$first : "$$ROOT"},
                colors : {$addToSet : "$color"}
            }},
            {$addFields : {"doc.colors": "$colors"}},
            {$replaceRoot : {newRoot : "$doc"}},
            {$unset : "color"},
            {$sort : {"variant.price.amount" : 1}}
        ]); //all models of a product with colors array

    const unique_variants = spe.map(item => item.variant);// unique model

    res.render("rent/prod_spec", {allspe : unique_variants,spe : spe[ctr]});
});

router.post("/duration",upload.none(), models.rental_duration)

router.post("/filters/:device",async(req,res)=>{
    //brand, price,psort,nsort;
    const br = Array.isArray(req.body.brand) ? req.body.brand : [req.body.brand];
    const pr = Number(req.body.price);
    const psort = Number(req.body.psort);
    const nsort = Number(req.body.nsort);
    const device = req.params.device || "all";

    const match = {};
    match["intent"] = "rent";
    const sort = {};

    if(device && device != "all") match["type"] = device;
    if(pr) match["variant.price.amount"] = {$lte : pr}
    if(br && !br.includes("all")) match["brand"] = {$in : br};
    if(psort && (psort===1 || psort === -1)) sort["variant.price.amount"] = psort;
    if(nsort) sort["name"] = nsort;

    const pipeline = [];
    if(match && Object.keys(match).length >0){
        pipeline.push({$match : match});
    }
    if (sort && Object.keys(sort).length > 0) {
        pipeline.push({ $sort: sort });
    }

    const allmod = await Product.aggregate(pipeline).collation({locale :"en",strength : 2});
    res.render("rent/rent",{allmod,device,pr,psort,nsort,br});
})

module.exports=router;