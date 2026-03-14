const express=require('express');
const router=express.Router();

//passport import
const passport=require('passport');

//model import
const User=require('../models/users');
const { Model } = require('../models/versions');
const { Product } = require('../models/products');
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

function createCart(id,intent,variant_no,color_no,qty){
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
    }
    return cart;
};

function storeReturnTo(req,res,next){
    res.locals.returnTo=req.session.returnTo;
    res.locals.shoppingCart = req.session.shoppingCart;
    next();
}

function userForShoppingCart(req,res,next){
    console.log(req.body);
    if(!req.isAuthenticated()){
        if(!req.session.shoppingCart) req.session.shoppingCart = [];
        var cart = createCart(req.params.id,req.params.intent,req.params.variant_no,req.params.color_no,Number(req.body.quantity));

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
        res.redirect('/vendrix/cart/'+req.params.intent+'/'+req.params.id+'/'+req.params.variant_no+'/'+req.params.color_no+"?quantity="+req.body.quantity);
    }
}

router.get('/register',(req,res)=>{
    res.render('user/register')
})

router.post('/register',storeReturnTo,async (req,res)=>{
    const {username,password,email}=req.body;
    const user= new User({email,username});
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
        const redirectUrl = res.locals.returnTo || '/';
        res.redirect(redirectUrl);
    })
});

router.get('/login',(req,res)=>{
    res.render('user/login');
})

router.post('/login',storeReturnTo,
    passport.authenticate('local',{failureFlash:"Invalid Username or Password!",failureRedirect:'/vendrix/login'}),
    async(req,res)=>{
    if(res.locals.shoppingCart){
        if(req.user.shoppingCart){
            //prevent duplicates
            for(let cart of res.locals.shoppingCart){
                preventDuplicatesCart(req,cart);
            }
            await req.user.save();
        }else{
        req.user.shoppingCart = structuredClone(res.locals.shoppingCart);
        await req.user.save();
        }
        delete req.session.shoppingCart
    }
    const redirectUrl=res.locals.returnTo || '/';
    req.flash('success','Welcome Back')
    res.redirect(redirectUrl);
})

router.get('/logout',(req,res)=>{
    req.logout(function(err){
        if(err){
            return next(err);
        }
        res.redirect('/vendrix/login');
    })
});

router.get('/cart/:intent/:id/:variant_no/:color_no',async (req,res)=>{
    const cart = createCart(req.params.id,req.params.intent,req.params.variant_no,req.params.color_no,Number(req.query.quantity));
    preventDuplicatesCart(req,cart);
    await req.user.save();
    res.redirect(req.session.backUrl);
});

router.post('/cart/:intent/:id/:variant_no/:color_no',userForShoppingCart);

router.get("/shoppingcart",async(req,res)=>{
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
});

router.get("/delete/:intent/:id/:variant_no/:color_no",async (req,res)=>{
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
})
module.exports=router;