const express=require('express');
const mongoose=require('mongoose');
const ejsMate=require('ejs-mate');
const path=require('path');

app=express();

app.engine('ejs',ejsMate);
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

app.get('/',(req,res)=>{
    res.send("hi");
})


app.listen(3000,()=>{
    console.log("Server Started");
})