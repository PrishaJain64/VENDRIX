const passport=require('passport');
//model import
const User=require('../models/users');
const { Model } = require('../models/versions');
const { Product } = require('../models/products');
const {Review} = require("../models/reviews");
const {Coupon} = require("../models/coupons");

const {Types} = require('mongoose');

const { shippingRates, Weight } = require('./saveUserData');

async function modelCart(shoppingCart){
    var mcart = [];

    const unique_ids =[...new Set(shoppingCart.filter(item=>item.product_model=='Model').map(item=>item.product_id))]; //unqiue ids from the entire shopping cart
    const model_extract = await Model.find({_id:{$in:unique_ids}}).lean();
    const modelMap = Object.fromEntries(model_extract.map(m=>[m._id.toString(),m]));
    shoppingCart.forEach(item => {
        if(item.product_model=="Model"){
        //item.details = modelMap[item.product_id];
        var prod = {};
        prod.price = modelMap[item.product_id].variants[item.variant_no].price;
        prod.quantity = item.quantity;
        prod.id = item.product_id;
        prod.type = item.intent;
        prod.specs = Object.values(modelMap[item.product_id].specifications);
        prod.img = modelMap[item.product_id].colors[item.color_no].thumbnail.url;
        prod.name = modelMap[item.product_id].name;
        prod.schema = 'Model';
        prod.variant = item.variant_no;
        prod.color = item.color_no;
        prod.url = "/buydetails";
        prod.device = modelMap[item.product_id].type;

        mcart.push(prod);
        }
    });
    return mcart;
}

async function productCart(shoppingCart,intent=null){
    var pcart = [];
    const unique_prod_ids =[...new Set(shoppingCart.filter(item=>item.product_model=='Product').map(item=>item.product_id))]; //unqiue ids from the entire shopping cart
    if(unique_prod_ids.length===0) return pcart;
    const query = {_id: { $in: unique_prod_ids }};
    if(intent){
        query.intent = intent;
    }
    const product_extract = await Product.find(query).lean();
    if(product_extract.length===0) return pcart;
    console.log(product_extract);
    const productMap = Object.fromEntries(product_extract.map(m=>[m._id.toString(),m]));
    shoppingCart.forEach(item => {
        if(item.product_model=="Product"){
        const product = productMap[item.product_id];
        if (!product) return;

        var prod = {};
        prod.price = product.variant.price.amount;
        prod.quantity = item.quantity;
        prod.id = item.product_id;
        prod.type = item.intent;
        prod.specs = Object.values(product.specifications);
        prod.img = product.color.thumbnail.url;
        prod.name = product.name;
        prod.stock = product.stock || product.available;
        prod.url = "/"+item.intent+"/details";
        prod.device = product.type;

        if(item.intent =="rent"){
            prod.startdate = item.duration.startDate;
            prod.enddate = item.duration.endDate;
            const start = new Date(prod.startdate);
            const end = new Date(prod.enddate);

            const oneDay = 1000 * 60 * 60 * 24;
            const diffDays = Math.ceil((end - start) / oneDay);

            var value = Math.round(diffDays*0.01*Number(productMap[item.product_id].variant.price.amount));
            prod.price=value;
        }
        prod.schema = 'Product';
        prod.color = product.color.color;
        prod.variant = product.variant.label;

        pcart.push(prod);
        }
    });
    return pcart;
}
function getMembershipYears(createdAt) {
  const d1 = new Date(createdAt);
  const d2 = new Date();

  let years = d2.getFullYear() - d1.getFullYear();

  if (
    d2.getMonth() < d1.getMonth() ||
    (d2.getMonth() === d1.getMonth() && d2.getDate() < d1.getDate())
  ) {
    years--;
  }

  return years;
}


async function preventDuplicatesCart(req,cart){
    let existingItem;
    if(cart.product_model == "Model")
    existingItem = req.user.shoppingCart.find(item => item.product_id.toString()==cart.product_id.toString()&&item.variant_no==cart.variant_no && item.color_no==cart.color_no);
    else 
    existingItem = req.user.shoppingCart.find(item => item.product_id.toString()==cart.product_id.toString());
        
    if (existingItem) {
        console.log(existingItem.intent +" "+existingItem.quantity+" "+cart.quantity);
        existingItem.quantity = cart.quantity;
    } else {
        req.user.shoppingCart.push(cart);
    }
}

function createCart(id,intent,variant_no,color_no,qty,startdate,enddate){
    const cart = {};
    cart["product_id"] = id;
    cart["intent"] = intent;
    cart["quantity"] = qty;
    if(intent === 'buy'){
        cart["product_model"] = "Model";
        cart["variant_no"] = Number(variant_no);
        cart["color_no"] = Number(color_no);
    }else{
        cart["product_model"] = "Product";
        if(intent == "rent"){
            cart.duration = {};
            cart["duration"]["startDate"] = startdate;
            cart["duration"]["endDate"] = enddate;
        }
    }
    return cart;
};

module.exports.userForShoppingCart = (req,res,next)=>{
    if(!req.isAuthenticated()){
        let startdate=-1,enddate=-1;
        if(req.params.intent=="rent"){
        startdate = new Date(req.body.startdate);
        if (isNaN(startdate)) {
            startdate = new Date();
            startdate.setDate(startdate.getDate() + 3);
        }
        startdate.setHours(0,0,0,0);

        enddate = new Date(req.body.enddate);
        if (isNaN(enddate)) {
            enddate = new Date();
            enddate.setDate(enddate.getDate() + 10);
        }
        enddate.setHours(0,0,0,0);
    }

        if(!req.session.shoppingCart) req.session.shoppingCart = [];
        var cart = createCart(req.params.id,req.params.intent,req.params.variant_no,req.params.color_no,Number(req.body.quantity),startdate,enddate);

        if(req.params.intent == "buy")
        var existingItem = req.session.shoppingCart.find(item => item.product_id===cart.product_id && item.variant_no==cart.variant_no&& item.color_no==cart.color_no);
        else
        var existingItem = req.session.shoppingCart.find(item => item.product_id===cart.product_id);
        if(!existingItem){
            req.session.shoppingCart.push(cart);
        }else{
            existingItem.quantity=cart.quantity;
        }
        res.json({valid:true,quantity:cart.quantity})
    }
    else{
        req.session.backUrl = req.body.returnTo;
        res.redirect('/vendrix/cart/'+req.params.intent+'/'+req.params.id+'/'+req.params.variant_no+'/'+req.params.color_no+"?quantity="+req.body.quantity+"&startdate="+req.body.startdate+"&enddate="+req.body.enddate);
    }
}

module.exports.Register = async (req,res)=>{
    const {firstname,lastname,password,email}=req.body;
    const username = email;
    console.log(req.body);
    
    const exisitinguser = await User.findOne({"username":username});
    if(exisitinguser){
        res.status(401).json({valid:false, redirect:"/vendrix/login",email});
        return;
    }
    const user= new User({email,username,firstname,lastname});
    const registeredUser=await User.register(user,password);
    console.log(registeredUser);
    req.login(registeredUser,async err=>{
        if(err){
            return next(err)
        }
        if(res.locals.shoppingCart){
            req.user.shoppingCart = structuredClone(res.locals.shoppingCart);
            await req.user.save();
            delete req.session.shoppingCart;
        }
        const redirectUrl = res.locals.returnTo || '/vendrix';
        res.json({valid:true,redirect:redirectUrl});
    })
}

module.exports.Login = (req,res,next)=>{
    passport.authenticate('local',async (err,user,info)=>{
        if(err){
            console.log(err);
            return next(err);
        }
        if(!user){
            return res.json({
                valid:false
            });
        }
        req.logIn(user,async(err)=>{
            if(err) return next(err)
            if (res.locals.shoppingCart) {
                if (req.user.shoppingCart) {
                for (let cart of res.locals.shoppingCart) {
                    preventDuplicatesCart(req, cart);
                }
                await req.user.save();
                } else {
                req.user.shoppingCart = structuredClone(res.locals.shoppingCart);
                await req.user.save();
                }
                delete req.session.shoppingCart;
            }

            const redirectUrl = res.locals.returnTo || '/vendrix';
            return res.json({
                valid:true,
                redirect : redirectUrl
            });
        })
    })
    (req,res,next);
};

module.exports.ShoppingCart = async(req,res)=>{

    if(req.isAuthenticated()) {
    var shoppingCart = req.user.shoppingCart || [];
    const membershipYears = getMembershipYears(req.user.createdAt);
    var coupons = await Coupon.find({
        "validity_check.user_membership": { $lte: membershipYears },
        "validity_check.user_order_count": { $lte: req.user.order_count }
        });
    }else{
    var shoppingCart = req.session.shoppingCart || [];
    var coupons = await Coupon.find({
        "validity_check.user_membership": 0,
        "validity_check.user_order_count": 0
        });
    }
    var cart=[];

    //models
    var mcart = await modelCart(shoppingCart) ||[];
    //products
    var pcart = await productCart(shoppingCart) ||[];
    cart = [...mcart,...pcart];

    console.log(cart);
    res.render("features/shoppingcart",{cart,coupons});
}

module.exports.deleteCart = async (req,res)=>{
    if(req.isAuthenticated()){
        if(req.params.intent == "buy"){
            await User.updateOne(
                { _id: req.user._id },
                {
                    $pull:{
                        shoppingCart:{
                            product_id: new Types.ObjectId(req.params.id),
                            intent: req.params.intent,
                            variant_no: Number(req.params.variant_no),
                            color_no: Number(req.params.color_no)
                        }
                    }
                }
            );
        }else{
            await User.updateOne(
                { _id: req.user._id },
                {
                    $pull:{
                        shoppingCart:{
                            product_id: new Types.ObjectId(req.params.id),
                            intent: req.params.intent
                        }
                    }
                }
            );
        }
    }else{
    if(req.params.intent == "buy"){
    req.session.shoppingCart = req.session.shoppingCart.filter(item =>
    !(item.product_id === req.params.id &&
        item.variant_no === req.params.variant_no &&
        item.color_no === req.params.color_no &&
        item.intent === req.params.intent
    )
    )}
    else{
        req.session.shoppingCart = req.session.shoppingCart.filter(item =>!(item.product_id === req.params.id && item.intent == req.params.intent));
    }
    }
    res.json({valid:true});
}

module.exports.Cart = async (req,res)=>{
    let startdate = -1;
    let enddate = -1;

    if(req.params.intent === "rent"){
    startdate = new Date(req.query.startdate);
    if (isNaN(startdate)) {
        startdate = new Date();
        startdate.setDate(startdate.getDate() + 3);
    }
    startdate.setHours(0,0,0,0);

    enddate = new Date(req.query.enddate);
    if (isNaN(enddate)) {
        enddate = new Date();
        enddate.setDate(enddate.getDate() + 10);
    }
    enddate.setHours(0,0,0,0);
}

    const cart = createCart(req.params.id,req.params.intent,req.params.variant_no,req.params.color_no,Number(req.query.quantity),startdate,enddate);
    preventDuplicatesCart(req,cart);
    await req.user.save();
    //res.redirect(req.session.backUrl);
    res.json({valid:true,quantity:cart.quantity});
}

module.exports.Transaction = async(req,res)=>{
    //product_intent
    const product_intent = req.query.intent;
    const idx = Number(req.query.adind) ||0;
    //address
    const address = req.user.address || [];
    
    //cart+total
    var shoppingCart = req.user.shoppingCart || [];
    var cartItems = [];
    if(product_intent ==="buy"){
        var mcart = await modelCart(shoppingCart)||[];
        var pcart = await productCart(shoppingCart,"refurbish")||[];
        cartItems = [...mcart,...pcart];
    }else if(product_intent === "rent"){
        var pcart = await productCart(shoppingCart,product_intent)||[];
        cartItems = [...pcart];
    }
    var total = {all:0,buy:0,rent:0,refurbish:0};
        cartItems.forEach(el=>{
            total.all+= el.price*el.quantity;
            total[el.type] += el.price*el.quantity;
        });
        console.log("total = "+total.all);
        console.log("total buy = "+total.buy);
        console.log("total refurbish= "+total.refurbish);
    //coupon
    const code = req.query.code || "";
    const couponCode = await Coupon.findOne({code:code})?? null;
    var coupon_validity = false;
    if(couponCode){
        const checker = couponCode.validity_check;
        const membershipYears = getMembershipYears(req.user.createdAt);
        const order_count = req.user.order_count;
        if(checker.user_membership<=membershipYears && checker.user_order_count<=order_count && checker.min_order <= total[checker.applicable_category]){
            coupon_validity = true;
        }
    };
    if(coupon_validity){
        if(couponCode.discount.type==="flat"){
            total.all -= couponCode.discount.value;
        }else{
            total.all -= (total[couponCode.validity_check.applicable_category]*couponCode.discount.value/100);
        }
    }

    //weight+rates
    var shippingrates = [];
    var payment_total = 0,gst=0;
    if(address.length>0){
    const total_weight = await Weight(cartItems);
    console.log(total_weight);

    const shipping = await shippingRates({
        pickup_pincode: String(address[idx].pincode),
        delivery_pincode: "400064",
        weight: total_weight,
        cod: 0
    });

    const cheapest = shipping.reduce((min, curr) =>
    curr.rate < min.rate ? curr : min
    );
    const fastest = shipping.reduce((min, curr) =>
    curr.days < min.days ? curr : min
    );

    shippingrates.push(cheapest);
    shippingrates.push(fastest);
    payment_total = total.all + shippingrates[0].rate;
    gst = (0.18*payment_total).toFixed(1);
    payment_total= (Number(payment_total)+Number(gst)).toFixed(1);
    }
    res.render("./features/transaction.ejs",{cartItems,total:total.all,code,address,shippingrates,payment_total,gst,product_intent,idx});
}
module.exports.Vendrix = async (req,res)=>{
    var cart_quantity = null;
    if(req.isAuthenticated()){
        cart_quantity = req.user.shoppingCart? req.user.shoppingCart.length : 0;
    }else{
        cart_quantity = req.session.shoppingCart? req.session.shoppingCart.length : 0;
    }
    var devices = ['laptop','phone','smartwatch','camera','headphone','earbud','tablet'];
    var val=[];
    val[0] = devices[Math.floor(Math.random()*9 + 1)];
    val[1] = devices[Math.floor(Math.random()*9 + 1)];

    var buy_products = await Model.aggregate([
        {$match :{type: {$in : val}}},
        {$sort : {release_date : -1}},
        {$limit : 4}
    ]);

    if(req.session.shoppingCart &&req.session.shoppingCart.length>0){
        buy_products.forEach(product=>{
            var cart = req.session.shoppingCart.find(c=>c.product_id === product._id.toString()&& c.variant_no==0 &&c.color_no == 0);
            if(cart){
                product.quantity = cart.quantity;
            }
        })}if(req.isAuthenticated()){
            if (req.user.shoppingCart && req.user.shoppingCart.length>0) {
        buy_products.forEach(product => {
            var cart = req.user.shoppingCart.find(
                c => c.product_id.toString() === product._id.toString()&&
                c.variant_no == 0 &&
                c.color_no == 0);

            if (cart) {
                product.quantity = cart.quantity;
            }

        });
    }
        }
    var reviews = await Review.find().sort({stars:-1, createdAt : -1}).limit(3).populate("user");

    res.render("features/homepage",{cart_quantity,buy_products,reviews,currentUrl:req.originalUrl});
}