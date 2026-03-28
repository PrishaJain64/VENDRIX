const passport=require('passport');
//model import
const User=require('../models/users');
const { Model } = require('../models/versions');
const { Product } = require('../models/products');
const {Review} = require("../models/reviews");
const {Types} = require('mongoose');

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
        let startdate = new Date(req.body.startdate);
        if (isNaN(startdate)) {
            startdate = new Date();
            startdate.setDate(startdate.getDate() + 3);
        }
        startdate.setHours(0,0,0,0);

        let enddate = new Date(req.body.enddate);
        if (isNaN(enddate)) {
            enddate = new Date();
            enddate.setDate(enddate.getDate() + 10);
        }
        enddate.setHours(0,0,0,0);

        if(!req.session.shoppingCart) req.session.shoppingCart = [];
        console.log(startdate,enddate);
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
        console.log(req.session.shoppingCart);
        res.redirect(req.body.returnTo);
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
    }else{
    var shoppingCart = req.session.shoppingCart || [];
    }
    //models
    const unique_ids =[...new Set(shoppingCart.filter(item=>item.product_model=='Model').map(item=>item.product_id))]; //unqiue ids from the entire shopping cart
    const model_extract = await Model.find({_id:{$in:unique_ids}}).lean();
    const modelMap = Object.fromEntries(model_extract.map(m=>[m._id.toString(),m]));
    shoppingCart.forEach(item => {
        if(item.product_model=="Model")
        item.details = modelMap[item.product_id];
    });

    //products
    const unique_prod_ids =[...new Set(shoppingCart.filter(item=>item.product_model=='Product').map(item=>item.product_id))]; //unqiue ids from the entire shopping cart
    const product_extract = await Product.find({_id:{$in:unique_prod_ids}}).lean();
    const productMap = Object.fromEntries(product_extract.map(m=>[m._id.toString(),m]));
    shoppingCart.forEach(item => {
        if(item.product_model=="Product")
        item.details = productMap[item.product_id];
    });
    console.log(shoppingCart)
    
    const models = shoppingCart.filter(item=>item.product_model=="Model");
    const products = shoppingCart.filter(item=>item.product_model=="Product");

    res.render("features/shoppingcart",{models,products,currentUrl:req.originalUrl});
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
    res.redirect("/vendrix/shoppingcart");
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
    res.redirect(req.session.backUrl);
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