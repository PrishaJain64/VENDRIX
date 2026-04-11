const Stripe = require("stripe");
const express = require("express");
const multer = require('multer');
const upload = multer();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

router.post("/checkoutSession",upload.none(), async (req, res) => {
  try {
    const total = Number(req.body.total)*100;
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
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });

    res.json({ id: session.id });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports=router;
