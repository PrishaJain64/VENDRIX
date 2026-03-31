const mongoose = require("mongoose");
const {Coupon} = require("../models/coupons");

mongoose.connect("mongodb://127.0.0.1:27017/vendrix");

async function seed() {
  await Coupon.insertMany([
  {
    "code": "SAVE10",
    "discount": { "type": "percentage", "value": 10 },
    "description": "Flat 10% off on all products",
    "validity_check": {
      "applicable_category": "all",
      "user_order_count": 1,
      "min_order": 0
    }
  },
  {
    "code": "SAVE15",
    "discount": { "type": "percentage", "value": 15 },
    "description": "Flat 15% off on your order",
    "validity_check": {
      "applicable_category": "all",
      "user_order_count": 3,
      "min_order": 500000
    }
  },
  {
    "code": "TECH20",
    "discount": { "type": "percentage", "value": 20 },
    "description": "20% off on buy products",
    "validity_check": {
      "applicable_category": "buy",
      "min_order": 100000
    }
  },
  {
    "code": "REFURB5",
    "discount": { "type": "percentage", "value": 5 },
    "description": "Extra 5% off on refurbished items",
    "validity_check": {
      "applicable_category": "refurbish",
      "min_order": 0
    }
  },
  {
    "code": "FLAT500",
    "discount": { "type": "flat", "value": 500 },
    "description": "Flat ₹500 off",
    "validity_check": {
      "applicable_category": "all",
      "min_order": 100000
    }
  },
  {
    "code": "RENT200",
    "discount": { "type": "flat", "value": 200 },
    "description": "₹200 off on rentals",
    "validity_check": {
      "applicable_category": "rent",
      "min_order": 50000
    }
  },
  {
    "code": "MEGA30",
    "discount": { "type": "percentage", "value": 30 },
    "description": "30% off on buy products",
    "validity_check": {
      "applicable_category": "buy",
      "user_order_count": 10,
      "min_order": 700000
    }
  },
  {
    "code": "FIRSTBUY50",
    "discount": { "type": "percentage", "value": 50 },
    "description": "50% off for first-time purchasers",
    "validity_check": {
      "applicable_category": "all",
      "min_order": 0,
      "user_order_count": 0
    }
  },
  {
    "code": "LOYAL1Y",
    "discount": { "type": "percentage", "value": 20 },
    "description": "20% off for 1-year members",
    "validity_check": {
      "applicable_category": "all",
      "min_order": 200000,
      "user_membership": 1
    }
  },
  {
    "code": "LOYAL3Y",
    "discount": { "type": "percentage", "value": 30 },
    "description": "30% off for 3-year members",
    "validity_check": {
      "applicable_category": "all",
      "min_order": 50000,
      "user_membership": 3
    }
  },
  {
    "code": "LOYAL5Y",
    "discount": { "type": "percentage", "value": 40 },
    "description": "40% off for 5-year members",
    "validity_check": {
      "applicable_category": "all",
      "min_order": 10000,
      "user_membership": 5
    }
  }
]
);

  console.log("Coupons inserted");
  mongoose.connection.close();
}

seed();