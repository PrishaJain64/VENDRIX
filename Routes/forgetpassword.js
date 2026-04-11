if(process.env.NODE_ENV!=='production'){
    require('dotenv').config()
}

const express = require('express');
const User=require('../models/users');
const multer = require('multer');
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');

const router = express.Router();
const upload = multer();
//transporter
const transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user : process.env.email,
        pass : process.env.email_pass
    }
});
router.post("/generateOtp",upload.none(),async (req,res)=>{
    console.log(req.body);
    try{
    const username = req.body.email;
    const user = await User.findOne({"username":username});
    if(!user){
        res.json({valid:false});
        return;
    }
    const random = Math.floor(100000+Math.random()*900000);

   await transporter.sendMail({
  to: username,
  subject: "Reset Password",
  html: `
  <div style="background:#e6e6e6;padding:60px 0;font-family:Arial;">
    <div style="max-width:600px;margin:auto;background:#f5f5f5;
                padding:40px 30px;text-align:center;border-radius:6px;">
      
      <h2 style="color:#1f3a63;">
        Your <span style="background:#f5c56b;padding:2px 6px;border-radius:3px;">
        One Time Password</span>
      </h2>

      <p style="color:#444;">Use this password to validate your application</p>

      <h1 style="letter-spacing:3px;">${random}</h1>

      <p style="color:#444;line-height:1.6;">
        If you did not request a password, you do not have to do anything.<br>
        Just ignore this email the way your cat ignores you.
      </p>
    </div>
  </div>
  `
});
    const tempToken = jwt.sign({email:username,otp:random},
        process.env.jwt_secret,
        {expiresIn:'10m'}
    );
    console.log(random)
    res.json({valid:true,tempToken})
}catch(err){console.log(err)}
})

router.post("/verifyOtp",upload.none(),async(req,res)=>{
    try{
        const {userotp,tempToken} = req.body;
        console.log(req.body);
        try{
            const decoded = jwt.verify(tempToken,process.env.jwt_secret);
            if(String(decoded.otp)==userotp){
                res.json({valid:"valid"});
                return;
            }else{
                res.json({valid:"invalid"});
                return;
            }
        }catch(err){
            res.json({valid:"expired"});
            return;
        }

        
    }catch(err){console.log(err)}
})

router.post("/updatePassword",upload.none(),async(req,res)=>{
    try{
    const {username,password} = req.body;
    const user = await User.findOne({"username":username});
    await user.setPassword(password);
    await user.save();
    return res.json({error:false});
    }catch(err){
        return res.json({error:true});
    }
})
module.exports= router; 