const Stripe = require("stripe");
const express = require("express");
const multer = require('multer');
const upload = multer();
const {Order} = require('../models/order.js');
const { isLoggedIn } = require("../middleware.js");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

router.post("/checkoutSession",isLoggedIn,upload.none(), async (req, res) => {
  try {
    const transactionId = "VEND-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    const order = req.body;
    const shipping = JSON.parse(order.shipping);
    const cartItems = JSON.parse(order.cartItems);
    console.log(cartItems);
    const od  = new Order({
      transactionId : transactionId,
      shipping : {
        name : shipping.name,
        days : Number(shipping.days),
        rate : Number(shipping.rate)
      },
      address : order.address,
      cartItems : cartItems.map(item => ({ name: item.name, price: Number(item.price),quantity: Number(item.quantity)})),
      discount : {
        code : order.discount.code,
        amount : Number(order.discount.amount)
      },
      gst : Number(order.gst),
      total : Number(order.total),
      user : req.user._id
    });

    if(order.fixeddeposit){
      od.fixeddeposit = Number(order.fixeddeposit);
    };
    await od.save();
    req.user.order_count +=1;
    await req.user.save();

    const total =  Math.round(Number(req.body.total) * 100);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Test Product",
            },
            unit_amount: total, // ₹500 (in paise)
          },
          quantity: 1,
        },
      ],
      success_url: `https://vendrix-yzwh.onrender.com/confirmation/buy/${od._id}`,
      cancel_url: "https://vendrix-yzwh.onrender.com/cancel",
    });

    res.json({ id: session.id });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

module.exports=router;
