const express=require('express');
const router=express.Router();

//passport import
const passport=require('passport');

//model import
const User=require('../models/users');

async function preventDuplicatesCart(req,cart){
    const existingItem = req.user.shoppingCart.find(item => {
        if (item.intent !== cart.intent) return false;
        if (cart.intent === "buy") {
            return (
                item.product_id.equals(cart.product_id) &&
                item.variant_id.equals(cart.variant_id) &&
                item.color_id.equals(cart.color_id)
            );
        }
        if (cart.intent === "rent" || cart.intent === "refurbish") {
            return item.product_id.equals(cart.product_id);
        }
        return false;
    });
    if (existingItem) {
        console.log(existingItem.intent +" "+existingItem.quantity+" "+cart.quantity);
        existingItem.quantity += cart.quantity;
    } else {
        req.user.shoppingCart.push(cart);
    }
}

function createCart(id,intent,variant_id,color_id){
    const cart = {};
    cart["product_id"] = id;
    cart["intent"] = intent;
    cart["quantity"] = 1;
    if(intent === 'buy'){
        cart["product_model"] = "Model";
        cart["variant_id"] = variant_id;
        cart["color_id"] = color_id; 
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
    if(!req.isAuthenticated()){
        const cart = createCart(req.params.id,req.params.intent,req.params.variant_id,req.params.color_id);
        if(!req.session.shoppingCart) req.session.shoppingCart = [];
        const existingItem = req.session.shoppingCart.find(item => {
            if (item.intent !== cart.intent) return false;
            if (cart.intent === "buy")
                return(
                    item.product_id === cart.product_id &&
                    item.variant_id===cart.variant_id &&
                    item.color_id===cart.color_id
                )
            if(cart.intent === "rent" || cart.intent === "refurbish")
                return item.product_id===cart.product_id
            
            return false;
        });

        if(!existingItem){
            cart["quantity"] =1;
            req.session.shoppingCart.push(cart);
        }else{
            existingItem.quantity+=1;
        }
        console.log(req.session.shoppingCart);
        res.redirect(req.body.returnTo);
    }
    else{
        req.session.backUrl = req.body.returnTo;
        res.redirect('/vendrix/cart/'+req.params.intent+'/'+req.params.id+'/'+req.params.variant_id+'/'+req.params.color_id+'');
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
        }
        const redirectUrl = res.locals.returnTo || '/homepage';
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
    }
    const redirectUrl=res.locals.returnTo || '/homepage';
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

router.get('/cart/:intent/:id/:variant_id/:color_id',async (req,res)=>{
    const cart = createCart(req.params.id,req.params.intent,req.params.variant_id,req.params.color_id);
    preventDuplicatesCart(req,cart);
    await req.user.save();
    res.redirect(req.session.backUrl);
});

router.post('/cart/:intent/:id/:variant_id/:color_id',userForShoppingCart);

module.exports=router;