if(process.env.NODE_ENV!=='production'){
    require('dotenv').config()
}

const express=require('express');
const mongoose=require('mongoose');
const ejsMate=require('ejs-mate');
const path=require('path');
const methodOverride=require('method-override');
const flash=require('connect-flash');


//model import
const User=require('./models/users.js');

// session
const sessionConfig={
    secret:'SahyogSessionSecret',
    saveUninitialized:false,
    resave:false,
    cookie:{
        maxAge:1000*60*60*24
    }
}
const session=require('express-session');

//passport import
const passport=require('passport');
const LocalStrategy=require('passport-local');


//Routes import
const sellRoutes = require('./Routes/sell.js');
const brokenRoutes = require('./Routes/broken.js');
const buyRoutes = require('./Routes/buy');
const refurbishRoutes = require('./Routes/refurbish');
const recycleRoutes = require('./Routes/recycle');
const rentRoutes = require('./Routes/rent');
const userRoutes=require('./Routes/users.js');
const otpRoutes=require('./Routes/forgetpassword.js');
const reviewRoutes=require('./Routes/review.js');

app=express();

app.engine('ejs',ejsMate);
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

app.use(methodOverride('_method'));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect("mongodb://127.0.0.1:27017/vendrix")
    .then(()=>{
        console.log("Mongo Connection Open");
    })
    .catch(err=>{
        console.log("Mongo Connection Failed");
});

app.use(session(sessionConfig));
app.use(flash());

//passport middleware
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({usernameField : 'email'},User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash('success');
    res.locals.currentUser=req.user;
    res.locals.error=req.flash('error');
    next();
})

app.use("/model",sellRoutes)
app.use('/allmodels',sellRoutes)
app.use("/answers",brokenRoutes)
app.use('/buy',buyRoutes)
app.use('/buydetails',buyRoutes)
app.use("/refurbish",refurbishRoutes);
app.use("/recycle",recycleRoutes);
app.use("/rent",rentRoutes);
app.use("/vendrix",userRoutes);
app.use("/forget",otpRoutes);
app.use("/review",reviewRoutes);


app.get("/newmod",(req,res)=>{
    res.render("./features/mod.ejs");
})

app.listen(3000,()=>{
    console.log(`Server Started`);
    require("./cron/schedular");
})
