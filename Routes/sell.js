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

//middleware import
const {isLoggedIn}=require('../middleware.js');

router.post("/",upload.array('image'),models.createModel)

//add isLoggedIn (removed for developing)
router.get("/filters/:intent/:device",(req,res)=>{
    res.redirect("/allmodels/"+req.params.intent+"/"+req.params.device);
})

router.get("/details/:id/:ctr/:intent/:color_key",async (req,res)=>{
    const id = req.params.id;
    const intnt = req.params.intent;
    const i = req.params.ctr;
    const color_key = req.params.color_key;

    const spe = await Model.findById(id);
    const margin = 0.2*Number(spe.variants[i].price);
    spe.variants[i].price -= margin;
    const questions = await Question.find({type:spe.type,intent:"repair"},{_id:0});
    res.render("sell/product_spec",{spe,questions,intnt,i,color_key});
})

router.post("/filters/:intent/:device",async(req,res)=>{
    //brand, price,psort,nsort;
    let br = [];
    if(req.body.brand)
    br = Array.isArray(req.body.brand) ? req.body.brand : [req.body.brand];
    const pr = Number(req.body.price) || 0;
    const psort = Number(req.body.psort) || 0;
    const nsort = Number(req.body.nsort) || 0;
    const device = req.params.device || "all";
    const intent = req.params.intent;

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
    res.render("sell/sell",{allmod,device,pr,psort,nsort,br,intent,currentUrl:req.originalUrl});
})
router.get('/:intent/:device', async (req,res)=>{
        var search = req.query.search;
        var device = req.params.device;
        var intent = req.params.intent;
        var brand = req.query.brand;
        var device = req.params.device;
        var pr=0;
       var psort=0;
       var nsort = 0;
       var br = [];
        var filter = {};
       if(search) filter.name = {$regex:"^"+search, $options:"i"};
        if(brand) filter.brand = brand
        if(device && device != "all") filter.type = device;
        const allmod = await Model.find(filter);
        allmod.forEach(el=>{
            const margin = el.variants[0].price*0.2;
            el.variants[0].price -= margin;
        })
        res.render("sell/sell",{allmod,intent,device,pr,psort,nsort,br,currentUrl:req.originalUrl,search,brand:brand||"all"});
})
module.exports=router;