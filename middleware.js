module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo=req.originalUrl;
        req.flash('error',"Not logged in")
        return res.redirect('/vendrix/login')
    }
    next();
}
module.exports.fetchisLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo=req.query.redirect;
        req.flash('error',"Not logged in")
        return res.json({valid:"notloggedin",redirect:'/vendrix/login'});
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