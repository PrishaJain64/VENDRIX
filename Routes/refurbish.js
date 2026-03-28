const express=require('express')
const {Details, Filter, All} = require("../Controller/RentRefurbish");

const router=express.Router();

router.get("/filters/:device",(req,res)=>{
    res.redirect("/refubish/"+req.params.device);
})

router.get("/details/:name/:label/:color",(req, res, next) => {
      req.intent = "refurbish";  
      next();
  },Details)

router.post("/filters/:device",(req, res, next) => {
      req.intent = "refurbish";  
      next();
  },Filter)

router.get("/:device",(req, res, next) => {
      req.intent = "refurbish";  
      next();
  },All)
module.exports=router;