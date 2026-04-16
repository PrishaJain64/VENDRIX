if(process.env.NODE_ENV!=='production'){
    require('dotenv').config()
}
const express=require('express');
const { isLoggedIn, fetchisLoggedIn } = require('../middleware');
const {User} = require("../models/users");
const {Order} = require("../models/order");
const multer = require('multer');
const upload = multer();

const path = require("path");
const fs = require("fs");
const ejs = require("ejs");
const puppeteer = require("puppeteer");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.email,
    pass: process.env.email_pass     // NOT your normal password
  }
});

const router=express.Router();

async function generateAndSendInvoice({ order, estimateDate, subtotal, currentDate,user }) {
  const cssPath = path.join(__dirname, "../public/css/invoice.css");
  const css = fs.readFileSync(cssPath, "utf8");

  const html = await ejs.renderFile(
    path.join(__dirname, "..", "views", "invoice", "invoice.ejs"),
    { order, estimateDate, subtotal, currentDate, user,css }
  );

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  let pdfBuffer;
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
  } finally {
    await browser.close(); // always closes, even if pdf() throws
  }

  await transporter.sendMail({
    from: process.env.email,
    to: user.email,
    subject: "Your Invoice",
    text: "Please find your invoice attached.",
    attachments: [{ filename: "invoice.pdf", content: pdfBuffer }]
  });

  console.log("Invoice sent to", user.email);
}

router.get("/buy/:id", isLoggedIn, async (req, res) => {
    const user = req.user;
  const orderid = req.params.id;
  try {
    const order = await Order.findById(orderid);

    if (!order || order.user.toString() !== req.user._id.toString()) {
      return res.status(403).send("Unauthorized");
    }

    const date = new Date();
    const currentDate = date.toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });

    date.setDate(date.getDate() + order.shipping.days);
    const estimateDate = date.toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'short'
    });

    const subtotal = order.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    res.render("features/buy-confirmation", { order, estimateDate, subtotal, currentDate });

    generateAndSendInvoice({ order, estimateDate, subtotal, currentDate, user })
      .catch(err => console.error("Invoice background job failed:", err));

  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong.");
  }
});
router.post("/sell",fetchisLoggedIn,upload.none(),async(req,res)=>{
    const order = req.body;
    const cartItem = JSON.parse(order.cartItem);

    const od = new Order({
        address : order.selectedAddress,
        cartItems:[{
            name : cartItem.name,
            quantity : 1,
            price : Number(order.quoted)
        }],
        total : Number(order.finalprice),
        amountReceived:true,
        user: req.user._id,
        pickup : order.pickup
    });
    await od.save();

    res.json({valid:true,id:od._id});
})
router.get("/sell/:id", isLoggedIn, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    const date = new Date();
    const currentDate = date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });

    const deductions =
      Number(order.cartItems[0].price) - Number(order.total);

    res.render("features/sell-confirmation", {
      order,
      currentDate,
      deductions
    });

  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

module.exports=router;