if(process.env.NODE_ENV!=='production'){
    require('dotenv').config()
}

const express=require('express');
const axios = require("axios");
const router=express.Router();
const jwt = require("jsonwebtoken");


const {userForShoppingCart, Register, Login, ShoppingCart, deleteCart, Cart, Vendrix, Transaction,directTransaction,Payable} = require('../Controller/users');
const { State, City, SaveAddress,Loc,paymentAmount,Verification} = require("../Controller/saveUserData");
const multer = require('multer');
const upload = multer();
const User = require("../models/users.js");
const {isLoggedIn, fetchisLoggedIn} = require('../middleware.js');

function storeReturnTo(req,res,next){
    res.locals.returnTo=req.session.returnTo;
    res.locals.shoppingCart = req.session.shoppingCart;
    next();
}
//register
router.get('/register',(req,res)=>{
    res.render('user/auth',{type:"signup"})
})

router.post('/register',upload.none(),storeReturnTo,Register);

//login
router.get('/login',(req,res)=>{
    res.render('user/auth',{type:"login"});
})

router.post("/login",storeReturnTo,upload.none(),Login)

router.get('/logout',(req,res)=>{
    req.logout(function(err){
        if(err){
            return next(err);
        }
        res.redirect('/vendrix/login');
    })
});

//shopping cart
router.get('/cart/:intent/:id/:variant_no/:color_no',Cart);

router.post('/cart/:intent/:id/:variant_no/:color_no',upload.none(),userForShoppingCart);

router.get("/shoppingcart",ShoppingCart);

router.delete("/delete/:intent/:id/:variant_no/:color_no",deleteCart)
router.get("/transaction",isLoggedIn,Transaction);//query ->intent- buy/sell/repair/rent/recycle
router.get("/",Vendrix)

router.get("/states",State)

router.post("/cities",City)
router.post("/location",isLoggedIn,upload.none(),Loc);

router.post("/saveAddress",upload.none(),isLoggedIn,SaveAddress)
router.post("/paymentAmount",upload.none(),isLoggedIn,paymentAmount)
router.get("/directTransaction/:intent/:id/:variant_no/:color_no/:quantity",isLoggedIn,directTransaction);
router.post("/directTransaction",upload.none(),(req,res)=>{
    const {intent,total} = req.body;
    req.session.order = {intent,total};
    res.json({valid:true});
});

router.post("/payableTransaction",fetchisLoggedIn,upload.none(),(req,res)=>{
    const {intent,finalprice,quoted} = req.body;
    console.log(req.body);
    req.session.order = {intent,finalprice,quoted};
    res.json({valid:true});
});
router.get("/payableTransaction/:intent/:id",isLoggedIn,Payable)
router.get("/auth/verify/:token",async(req,res)=>{
    try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user) return res.send("Invalid link");

    user.isVerified = true;
    await user.save();

    res.redirect("/vendrix/login?verified=true");

  } catch (err) {
    res.send(err+ "Link expired or invalid");
  }
})
module.exports=router;