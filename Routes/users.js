const express=require('express');
const router=express.Router();

//passport import
const passport=require('passport');

//model import
const User=require('../models/users');

router.get('/register',(req,res)=>{
    res.render('user/register')
})

router.post('/register',async (req,res)=>{
    const {username,password,email}=req.body;
    const user= new User({email,username});
    const registeredUser=await User.register(user,password);
    console.log(registeredUser);
    req.login(registeredUser,err=>{
        if(err){
            return next(err)
        }
        res.redirect('/');
    })
});

router.get('/login',(req,res)=>{
    res.render('user/login');
})

router.post('/login',passport.authenticate('local',{failureFlash:"Invalid Username or Password!",failureRedirect:'/vendrix/login'}),(req,res)=>{
    res.redirect('/');
})

router.get('/logout',(req,res)=>{
    req.logout(function(err){
        if(err){
            return next(err);
        }
        res.redirect('/vendrix/login');
    })
})
module.exports=router;