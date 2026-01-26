import express from "express";
import bodyParser from "body-parser"
const port = 3000;
const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.get("/",(req,res)=>{
    res.render("index.ejs");
});

app.post("/sell",(req,res)=>{
    res.render("features/sell-main.ejs");
});
app.post("/buy",(req,res)=>{
    res.render("features/buy-main.ejs");
});
app.post("/repair",(req,res)=>{
    res.render("features/repair-main.ejs");
});
app.post("/maintenance",(req,res)=>{
    res.render("features/maintenance-main.ejs");
});
app.post("/recycle",(req,res)=>{
    res.render("features/recycle-main.ejs");
});
app.post("/rent",(req,res)=>{
    res.render("features/rent-main.ejs");
});

app.post("/brand",(req,res)=>{
    var b = req.query.brand;
    res.render("features/brand-page.ejs",{brand:b});
})

app.listen(port,()=>{
    console.log("Sucessfully connected "+port);
});