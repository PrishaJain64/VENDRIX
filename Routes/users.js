const express=require('express');
const router=express.Router();


router.get('/signup',(req,res)=>{
    res.send('signup page');
})

router.post('/signup',(req,res)=>{
    res.send('signed up');
})


router.get('/login',(req,res)=>{
    res.send('login page');
})

router.post('/login',(req,res)=>{
    res.send('logged in');
})

module.exports=router;