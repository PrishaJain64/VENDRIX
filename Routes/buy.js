const express=require('express')
const {Details, Filter, All} = require('../Controller/buy.js');

const router=express.Router();

router.get("/filters/:device",(req,res)=>{
    res.redirect("/buy/"+req.params.device);
})

router.get("/:id/:ctr/:color_key",Details);

router.post("/filters/:device",Filter);

router.get("/:device",All);

module.exports=router;

