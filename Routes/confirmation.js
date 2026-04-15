const express=require('express');
const { isLoggedIn } = require('../middleware');
const {User} = require("../models/users");
const {Order} = require("../models/order");

const router=express.Router();

router.get("/buy/:id",isLoggedIn,async(req,res)=>{
    const orderid = req.params.id;
    try{
        const order = await Order.findById(orderid);
        
        const date = new Date();

        const currentDate = date.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
        });

        date.setDate(date.getDate() + order.shipping.days);

        const options = {
        weekday: 'long',
        day: 'numeric',
        month: 'short'
        };

        const estimateDate = date.toLocaleDateString('en-IN', options);

        const subtotal = order.cartItems.reduce((sum, item) => sum + item.price * item.quantity,0);

        res.render("features/buy-confirmation",{order,estimateDate,subtotal,currentDate});
    }catch(err){
        res.send(err);
    }
})

router.get("/sell",isLoggedIn,async(req,res)=>{
    res.render("features/sell-confirmation");
})
module.exports=router;