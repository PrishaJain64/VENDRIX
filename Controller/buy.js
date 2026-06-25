const {Model} = require('../models/versions.js');
const {Review} = require('../models/reviews.js');
const Redis = require('../lib/redis.js');

module.exports.Details = async (req,res)=>{

    const id = req.params.id;
    const ctr = req.params.ctr;
    const color_key = req.params.color_key;
    const cachekey = `product:${id}`;

    var spe;
    const cached = await Redis.get(cachekey);
    if(cached){
        spe = JSON.parse(cached);
    }else{
    spe = await Model.findById(id).lean();
    await Redis.set(cachekey,JSON.stringify(spe),'EX',600);
    }

    if(req.session.shoppingCart && req.session.shoppingCart.length>0){
        var cart = req.session.shoppingCart.find(c=>c.product_id === spe._id.toString() && c.variant_no==ctr &&c.color_no == color_key);
        if(cart){
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
        spe.quantity = cart.quantity;
    }

    }}
        var {option, star} = req.query;
        var lookfor = {product_name: spe.name,intent: 'buy'}
        var sort = {};
        const sortMap = {
                relevant: { createdAt: -1, likes: -1 },
                highest: { stars: -1 },
                lowest: { stars: 1 },
                newest: { createdAt: -1 },
                helpful: { likes: -1 }
        };
        if(star && star!=='null')
           {lookfor["stars"] = Number(star);console.log(star);}
        if (option)
            sort = sortMap[option] || {};
        var reviews = await Review.find(lookfor).sort(sort).populate("user");
        reviews = Array.isArray(reviews) ? reviews : [reviews];
        
        var count = [0,0,0,0,0,0];
        reviews.forEach(r => {
            count[r.stars]++
        });
        res.render("buy/product_spec",{spe,i:ctr,color_key,reviews,count,option,star});
}

module.exports.Filter = async(req,res)=>{
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

        });
    }
    }
    res.render("buy/buy",{allmod,device,pr,psort,nsort,br});
}

module.exports.All = async (req,res)=>{    
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

        });
    }
        }
        res.render("buy/buy",{allmod,device,pr,psort,nsort,br,search,brand:brand||"all"});
    }