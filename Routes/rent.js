const express=require('express')
const models = require("../Controller/products");
const {Details, Filter, All} = require("../Controller/RentRefurbish");
const router=express.Router();

const multer = require('multer');
const {storage}=require('../Cloudinary/index.js');
const upload = multer({storage});

router.get("/filters/:device",(req,res)=>{
    res.redirect("/rent/"+req.params.device);
})


router.get("/details/:name/:label/:color",(req, res, next) => {
      req.intent = "rent";  
      next();
  },Details);

router.post("/duration",upload.none(), models.rental_duration)

router.post("/filters/:device",(req, res, next) => {
      req.intent = "rent";  
      next();
  },Filter)

router.get("/:device",(req, res, next) => {
      req.intent = "rent";  
      next();
  },All)
module.exports=router;