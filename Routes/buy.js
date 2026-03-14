const express=require('express')
const {Model} = require('../models/versions.js');
const passport=require('passport');

const router=express.Router();

function shoppingCart(req,res,next){
    if(req.isAuthenticated()){
        console.log(req.user);
    }else{

        console.log(req.session.shoppingCart);
    }
    next();
}

router.get("/filters/:device",(req,res)=>{
    res.redirect("/buy/"+req.params.device);
})
// router.get("/landing/:device",async (req,res)=>{
//         var device = req.params.device;
//         const allmod = await Model.find({type:device});
//         res.render("landing/landing",{allmod});
// })

router.get("/:id/:ctr/:color_key",async (req,res)=>{
    const id = req.params.id;
    const ctr = req.params.ctr;
    const color_key = req.params.color_key;
    const spe = await Model.findById(id).lean();
    if(req.session.shoppingCart && req.session.shoppingCart.length>0){
        var cart = req.session.shoppingCart.find(c=>c.product_id === spe._id.toString() && c.variant_no==ctr &&c.color_no == color_key);
        if(cart){
            console.log(cart.quantity);
            spe.quantity = cart.quantity
        }
    }
    if(req.isAuthenticated()){
    if (req.user.shoppingCart && req.user.shoppingCart.length>0) {
    var cart = req.user.shoppingCart.find(
        c => c.product_id.toString() === spe._id.toString() &&
        c.variant_no == ctr &&
        c.color_no == color_key
    );

    if (cart) {
        console.log(cart.quantity);
        spe.quantity = cart.quantity;
    }
    }}
    console.log(spe);
    res.render("buy/product_spec",{spe,i:ctr,color_key,currentUrl:req.originalUrl});
})

router.post("/filters/:device",async(req,res)=>{
    //brand, price,psort,nsort;
    let br = [];
    if(req.body.brand)
    br = Array.isArray(req.body.brand) ? req.body.brand : [req.body.brand];
    const pr = Number(req.body.price) || 0;
    const psort = Number(req.body.psort) || 0;
    const nsort = Number(req.body.nsort) || 0;
    const device = req.params.device || "all";

    const match = {};
    const sort = {};

    if(device && device != "all") match["type"] = device;
    if(pr) match["variants.0.price"] = {$lte : pr}
    if(br.length>0 && !br.includes("all")) match["brand"] = {$in : br};     
    if(psort && (psort===1 || psort === -1)) sort["variants.0.price"] = psort;
    if(nsort) sort["name"] = nsort;
    console.log(pr);

    const pipeline = [];
    if(match && Object.keys(match).length >0){
        pipeline.push({$match : match});
    }
    if (sort && Object.keys(sort).length > 0) {
        pipeline.push({ $sort: sort });
    }

    const allmod = await Model.aggregate(pipeline).collation({locale :"en",strength : 2});
    if(req.session.shoppingCart && req.session.shoppingCart.length>0){
        allmod.forEach(product=>{
            var cart = req.session.shoppingCart.find(c=>c.product_id === product._id.toString()&& c.variant_no==0 &&c.color_no == 0);
            if(cart){
                product.quantity = cart.quantity;
            }
            console.log(product);
        })}
    if(req.isAuthenticated()){
        if (req.user.shoppingCart && req.user.shoppingCart.length>0) {
        allmod.forEach(product => {
            var cart = req.user.shoppingCart.find(
                c => c.product_id.toString() === product._id.toString() &&
                c.variant_no == 0 &&
                c.color_no == 0
            );

            if (cart) {
                product.quantity = cart.quantity;
            }

            console.log(product);
        });
    }
    }
    res.render("buy/buy",{allmod,device,pr,psort,nsort,br,currentUrl:req.originalUrl});
})
router.get("/:device",shoppingCart,async (req,res)=>{    
    var search = req.query.search;
       var brand = req.query.brand;
       var device = req.params.device;
       var pr=0;
       var psort=0;
       var nsort = 0;
       var br = [];
       var filter = {};
       if(search) filter.name = {$regex:"^"+search, $options:"i"};
       if(brand) filter.brand = brand
       if(device && device!="all") filter.type = device;
        const allmod = await Model.find(filter).lean();
        if(req.session.shoppingCart &&req.session.shoppingCart.length>0){
        allmod.forEach(product=>{
            var cart = req.session.shoppingCart.find(c=>c.product_id === product._id.toString()&& c.variant_no==0 &&c.color_no == 0);
            if(cart){
                product.quantity = cart.quantity;
            }
            console.log(product);
        })}if(req.isAuthenticated()){
            if (req.user.shoppingCart && req.user.shoppingCart.length>0) {
        allmod.forEach(product => {
            var cart = req.user.shoppingCart.find(
                c => c.product_id.toString() === product._id.toString() &&
                c.variant_no == 0 &&
                c.color_no == 0
            );

            if (cart) {
                product.quantity = cart.quantity;
            }

            console.log(product);
        });
    }
        }
        res.render("buy/buy",{allmod,device,pr,psort,nsort,br,currentUrl:req.originalUrl,search});
    })
module.exports=router;

