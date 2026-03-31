const express=require('express');
const router=express.Router();

const {userForShoppingCart, Register, Login, ShoppingCart, deleteCart, Cart, Vendrix} = require('../Controller/users');

const multer = require('multer');
const upload = multer();

function storeReturnTo(req,res,next){
    res.locals.returnTo=req.session.returnTo;
    res.locals.shoppingCart = req.session.shoppingCart;
    next();
}

//register
router.get('/register',(req,res)=>{
    res.render('user/auth',{type:"signup"})
})

router.post('/register',storeReturnTo,upload.none(),Register);

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

router.get("/",Vendrix)
module.exports=router;