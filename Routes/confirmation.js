const express=require('express');
const { isLoggedIn, fetchisLoggedIn } = require('../middleware');
const {User} = require("../models/users");
const {Order} = require("../models/order");
const multer = require('multer');
const upload = multer();

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
router.post("/sell",fetchisLoggedIn,upload.none(),async(req,res)=>{
    const order = req.body;
    const cartItem = JSON.parse(order.cartItem);

    const od = new Order({
        address : order.selectedAddress,
        cartItems:[{
            name : cartItem.name,
            quantity : 1,
            price : order.quoted
        }],
        total : order.finalprice,
        amountReceived:true,
        user: req.user._id,
        pickup : order.pickup
    });
    await od.save();

    res.json({valid:true,id:od._id});
})
router.get("/sell/:id",isLoggedIn,async(req,res)=>{
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
        const deductions = Number(order.cartItems[0].price)-Number(order.total);
        res.render("features/sell-confirmation",{order,currentDate,deductions});
    }catch(err){
        res.send(err);
    }
})
module.exports=router;