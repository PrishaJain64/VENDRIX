if(process.env.NODE_ENV!=='production'){
    require('dotenv').config()
}

const axios = require("axios");

let cachedToken = null;
let tokenExpiry = null;
async function getToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const response = await axios.post(
    'https://apiv2.shiprocket.in/v1/external/auth/login',
    {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  console.log(response.data);
  const token = response.data.token;

  // ⏳ set expiry (safe buffer: 9 days)
  cachedToken = token;
  tokenExpiry = Date.now() + (5 * 24 * 60 * 60 * 1000);

  return token;
}
module.exports.State = async(req,res)=>{
    try {
    const response = await axios.post(
      "https://countriesnow.space/api/v0.1/countries/states",
      { country: "India" }
    );

    const states = response.data.data.states;
    res.json(states);

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch states" });
  }
}

module.exports.City = async(req,res)=>{
    const { state } = req.body;

  try {
    const response = await axios.post(
      "https://countriesnow.space/api/v0.1/countries/state/cities",
      {
        country: "India",
        state: state
      }
    );

    res.json(response.data.data);

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cities" });
  }
}

module.exports.SaveAddress = async (req,res)=>{
    try{
    const {flat,building,landmark,road,pincode,state,city} = req.body;

    const result = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = result.data[0];

    if (data.Status !== "Success") return res.json({valid:false,pincode});

    const postOffices = data.PostOffice;

    // Check if at least one post office matches city & state
    const valid = postOffices.some(po =>
      po.District.toLowerCase() === city.toLowerCase() &&
      po.State.toLowerCase() === state.toLowerCase()
    );
    if(!valid) return res.json({valid:false,pincode});
    
    const details = flat+", "+building+", "+landmark+", "+road+", "+city+", "+pincode+", "+state;
    const add = {};
    add["details"] = details;
    add["pincode"] = pincode;

    if(!req.user.address) req.user.address = [];
    req.user.address.push(add);
    await req.user.save();
    res.json({valid:true,city});
}
    catch(err){console.log(err);}
}

module.exports.Loc = async(req,res)=>{
  try{
    const {lat,lon,flat,building} = req.body;
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;

    const result = await axios.get(url, {
      headers: {
        'User-Agent': 'VendrixApp/1.0 (contact@vendrix.com)'
      }});
    console.log("Address:", result.data);
    if(!req.user.address) req.user.address = [];
    const address = {};
    address.details = flat+", "+building+", "+result.data.display_name
    address.pincode = Number(result.data.address.postcode);
    req.user.address.push(address);
    await req.user.save();
    res.json({valid:true});
  }catch(err){
    console.log("saveUserData : "+err);
  }
}

module.exports.shippingRates = async({
  pickup_pincode,
  delivery_pincode,
  weight=1,
  cod = 0
}) =>{
  const token = await getToken();

  const response = await axios.get(
    "https://apiv2.shiprocket.in/v1/external/courier/serviceability/",
    {
      params: {
        pickup_postcode: pickup_pincode,
        delivery_postcode: delivery_pincode,
        weight: weight,
        cod: cod
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const companies =  response.data.data.available_courier_companies;
  const shipping = [];
  companies.forEach(e => {
    var cmp = {};
    cmp.name = e.courier_name;
    cmp.days = e.estimated_delivery_days;
    cmp.rate = e.rate;
    shipping.push(cmp);
  });
  return shipping;
  
}