module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo=req.originalUrl;
        req.flash('error',"Not logged in")
        return res.redirect('/vendrix/login')
    }
    next();
}

// module.exports.storeReturnTo=(req,res,next)=>{
//         console.log(req.session.returnTo);
//         if(req.session.returnTo){
//             res.locals.returnTo=req.session.returnTo;
//         }
//         next();
// }