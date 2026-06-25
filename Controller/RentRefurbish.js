const {Product} = require('../models/products');
const {Review} = require('../models/reviews');
const Redis = require('../lib/redis.js');

module.exports.Details =async (req,res)=>{
    const prod_name = req.params.name;
    const label = req.params.label;
    const color = req.params.color;
    const intent = req.intent;
    const start = req.query.startdate||null;
    const end = req.query.enddate||null;
    const cachekey = `product${prod_name+intent+label+color}`;
    var result;

    const cached = await Redis.get(cachekey);
    if(cached){
        result = JSON.parse(cached);
    }else{

     [result] = await Product.aggregate([
  {
    $match: { name: prod_name,intent:intent }
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
 await Redis.set(cachekey,JSON.stringify(result),'EX',600);
    }
  if(req.session.shoppingCart){
        var cart = req.session.shoppingCart.find(c=>c.product_id === result.selectedDoc[0]._id.toString());
        if(cart){
            result.quantity = cart.quantity
        }
    }
    if(req.isAuthenticated()){
    if (req.user.shoppingCart && req.user.shoppingCart.length>0) {
    var cart = req.user.shoppingCart.find(
        c=>c.product_id.equals(result.selectedDoc[0]._id)
    );

    if (cart) {
        result.quantity = cart.quantity;
    }

    }}

    var {option, star} = req.query;
            var lookfor = {product_name: prod_name,intent: intent}
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
    res.render(`${intent}/product_spec`, {result,reviews,count,option,star,start,end});
}

module.exports.Filter = async(req,res)=>{
    //brand, price,psort,nsort;
    let br =[];
    if(req.body.brand)
    br = Array.isArray(req.body.brand) ? req.body.brand : [req.body.brand];
    const pr = Number(req.body.price);
    const psort = Number(req.body.psort);
    const nsort = Number(req.body.nsort);
    const device = req.params.device || "all";
    const intent = req.intent;

    const match = {};
    match["intent"] = intent;
    match["available"] = {$gte : 1};
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
    pipeline.push({
        $group: {
            _id: "$name",
            doc: { $first: "$$ROOT" }
        }
        });

        pipeline.push({
        $replaceRoot: { newRoot: "$doc" }
        });

    const allmod = await Product.aggregate(pipeline).collation({locale :"en",strength : 2});
    if(req.session.shoppingCart){
        allmod.forEach(product=>{
            var cart = req.session.shoppingCart.find(c=>c.product_id === product._id.toString());
            if(cart){
                product.quantity = cart.quantity;
            }
            console.log(product);
        })}
    if(req.isAuthenticated()){
        if (req.user.shoppingCart && req.user.shoppingCart.length>0) {
        allmod.forEach(product => {
            var cart = req.user.shoppingCart.find(
                c=>c.product_id.equals(product._id)
            );

            if (cart) {
                product.quantity = cart.quantity;
            }

        });
    }
    }
    res.render(`${intent}/${intent}`,{allmod,device,pr,psort,nsort,br,max_value});
}

module.exports.All = async (req,res)=>{
    const intent = req.intent;
    const brand = req.query.brand;
    var filter = {};
    var pr=0;
       var psort=0;
       var nsort = 0;
       var br = [];
    filter["intent"] = intent;

    if(intent == "rent")filter["available"] = {$gte : 1};
    if(brand) filter.brand = brand

    var search = req.query.search;
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

        if(req.isAuthenticated()){
        if (req.user.shoppingCart && req.user.shoppingCart.length>0) {
        allmod.forEach(product => {
            var cart = req.user.shoppingCart.find(
                c=>c.product_id.equals(product._id)
            );

            if (cart) {
                product.quantity = cart.quantity;
            }

        });
    }
    }
        res.render(`${intent}/${intent}`,{allmod,device,pr,psort,nsort,br,search,brand:brand||"all"});
    }