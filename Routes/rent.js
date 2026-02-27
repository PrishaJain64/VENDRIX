const express=require('express')
const {Product} = require('../models/products');
const models = require("../Controller/products");
const router=express.Router();

const multer = require('multer');
const {storage}=require('../Cloudinary/index.js');
const upload = multer({storage});

router.get("/:device",async (req,res)=>{
    var filter = {};
    filter["intent"] = "rent";
    filter["available"] = true;
        var device = req.params.device;
        if(device) filter["type"] = device;

        const allmod = await Product.aggregate([
            {$match : filter},
            {$group : {
                _id : "$name",
                doc : {$first : "$$ROOT"}
            }},
            {$replaceRoot : {newRoot : "$doc"}},
            {$sort : {name : 1}}
        ]);
        res.render("rent/rent",{allmod});
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


module.exports=router;