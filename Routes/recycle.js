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

router.get("/filters/:device",(req,res)=>{
    res.redirect("/recycle/"+req.params.device);
})

router.get("/details/:id",async (req,res)=>{
    const id = req.params.id;
    const spe = await Model.findById(id);
    const questions = await Question.find({type:spe.type,intent:"recycle"},{_id:0});
    res.render("recycle/prod_spec",{spe,questions});
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
        res.render("buy/buy",{allmod,device,pr,psort,nsort,br,currentUrl:req.originalUrl});
})
router.get("/:device",async (req,res)=>{
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
           if(device) filter.type = device;
            const allmod = await Model.find(filter);
        res.render("recycle/recycle",{allmod,pr,psort,nsort,br,device,currentUrl:req.originalUrl,search});
});
module.exports=router;