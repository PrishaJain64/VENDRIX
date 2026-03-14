const express=require('express')
const {Product} = require('../models/products');

const router=express.Router();

router.get("/filters/:device",(req,res)=>{
    res.redirect("/refubish/"+req.params.device);
})

router.get("/details/:name/:label/:color",async (req,res)=>{
    const prod_name = req.params.name;
    const label = req.params.label;
    const color = req.params.color;

    const [result] = await Product.aggregate([
  {
    $match: { name: prod_name,intent:"refurbish" }
  },
  {
    $facet: {
      selectedDoc: [
        {
          $match: {
            "variant.label": label,
          }
        },
        {
          $addFields: {
            priority: {
              $cond: [
                { $eq: ["$color.color", color] },
                1,
                2
              ]
            }
          }
        },
        { $sort: { priority: 1 } },
        { $limit: 1 }
      ],
      colors: [
        {
          $match: { "variant.label": label }
        },
        {
          $group: {
            _id: null,
            colors: { $addToSet: {color: "$color.color",hexcode:"$color.hexcode"} },
          }
        }
      ],
      labels: [
        {
          $group: {
            _id: null,
            labels: { $addToSet: "$variant.label" }
          }
        }
      ]
    }
  }
]);
  if(req.session.shoppingCart){
        var cart = req.session.shoppingCart.find(c=>c.product_id === result.selectedDoc[0]._id.toString());
        if(cart){
            result.quantity = cart.quantity
        }
    }
    console.log(result);
    res.render("refurbish/product_spec", {result,currentUrl:req.originalUrl});
})

router.post("/filters/:device",async(req,res)=>{
    //brand, price,psort,nsort;
    let br = [];
    if(req.body.brand)
    br = Array.isArray(req.body.brand) ? req.body.brand : [req.body.brand];
    const pr = Number(req.body.price);
    const psort = Number(req.body.psort);
    const nsort = Number(req.body.nsort);
    const device = req.params.device || "all";

    const match = {};
    match["intent"] = "refurbish";
    const sort = {};

    if(device && device != "all") match["type"] = device;
    if(pr) match["variant.price.amount"] = {$lte : pr}
    if(br.length>0 && !br.includes("all")) match["brand"] = {$in : br};
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
    res.render("refurbish/refurbish",{allmod,device,pr,psort,nsort,br,currentUrl:req.originalUrl});
})
router.get("/:device",async (req,res)=>{
    var filter = {};
    var search = req.query.search;
    var device = req.params.device;
       var pr=0;
       var psort=0;
       var nsort = 0;
       var br = [];
    filter["intent"] = "refurbish";
        var device = req.params.device;
        if(device && device != "all") filter["type"] = device;
       if(search) filter.name = {$regex:"^"+search, $options:"i"};
        const allmod = await Product.aggregate([
            {$match : filter},
            {$group : {
                _id : "$name",
                doc : {$first : "$$ROOT"}
            }},
            {$replaceRoot : {newRoot : "$doc"}},
            {$sort : {name : 1}}
        ]);
         if(req.session.shoppingCart){
        allmod.forEach(product=>{
            var cart = req.session.shoppingCart.find(c=>c.product_id === product._id.toString());
            if(cart){
                product.quantity = cart.quantity;
            }
            console.log(product);
        })}
        res.render("refurbish/refurbish",{allmod,device,pr,psort,nsort,br,currentUrl:req.originalUrl,search});
    })
module.exports=router;