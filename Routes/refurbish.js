const express=require('express')
const {Product} = require('../models/products');

const router=express.Router();


router.get("/:device",async (req,res)=>{
        var device = req.params.device;
        const allmod = await Product.aggregate([
            {$match : {type:device,intent:"refurbish"}},
            {$group : {
                _id : "$name",
                doc : {$first : "$$ROOT"}
            }},
            {$replaceRoot : {newRoot : "$doc"}},
            {$sort : {name : 1}}
        ]);
        res.render("refurbish/refurbish",{allmod});
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

    res.render("refurbish/product_spec", {allspe : unique_variants,spe : spe[ctr]});
})
//allspe -- all models 
//spe -- specific model details check
//colors -- all colours for a model

module.exports=router;