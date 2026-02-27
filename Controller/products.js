//Model includes
const {Model} = require('../models/versions');
const {Broken} = require('../models/broken');
const {Question} = require('../models/questions');
const {Product} = require("../models/products");

async function DateEvaluator (device){
  const date = new Date();
  date.setDate(date.getDate()+3 );
  date.setHours(0,0,0,0);

  const beginningCount = await Broken.countDocuments({device,scheduled_time: date});

  if(beginningCount<5) return date;

  const result = await Broken.aggregate([
    {$match: { device,scheduled_time :{$gt : date}}},
    {$group: {_id: "$scheduled_time",count: { $sum: 1 }}},
    {$match: {count: { $lt: 5 }}},
    {$sort: { _id: 1 }},
    {$limit: 1}
  ]);

  if(result.length) return result[0]._id;

  const secresult = await Broken.aggregate([
    {$match : {device, scheduled_time: {$gte : date}}},
    {$group: {_id: "$scheduled_time"}},
    {$sort: { _id: -1 }},
    {$limit: 1}
  ])
  var newdate = new Date(secresult[0]._id);
  newdate.setDate(newdate.getDate()+1);
  newdate.setHours(0,0,0,0);
  return newdate;

}
async function SeverityCheck(issues,allquestions){
  var count = 0;
  var total = 0;
  if (!(issues && Object.keys(issues).length > 0)) return "refurbish";

  for(let aq of allquestions){
    if(aq.question === "Additional Issues") continue;
    if(issues[aq.question]){
      var option = aq.options.find(o => o.text === issues[aq.question]);
      total += option.severity;
      ++count;
    }
  }
  let additional = issues['Additional Issues'];
  if(additional) {
    if (typeof additional === "string") additional = [additional];
    allquestions = allquestions.find(q => q.question === "Additional Issues");

    for (let iss of allquestions.options){
      if(additional.includes(iss.text)){
        total += iss.severity;
        ++count;
      }
    }
  }
  if(total/count > 3) return "rent";
  else return "refurbish";
}

async function IssuesValue(issues,allquestions){
  var result = {};
  if (!(issues && Object.keys(issues).length > 0)) return result;

  for(let aq of allquestions){
    if(aq.question === "Additional Issues") continue;
    if(issues[aq.question]){
      var option = aq.options.find(o => o.text === issues[aq.question]);
      result[option.text] = option.value;
    }
  }
  let additional = issues['Additional Issues'];
  if(additional) {
    if (typeof additional === "string") additional = [additional];
    allquestions = allquestions.find(q => q.question === "Additional Issues");

    for (let iss of allquestions.options){
      if(additional.includes(iss.text)){
        result[iss.text] = iss.value;
      }
    }
  }
  return result;
}
async function Totalrepair(issues,device){
  var total = 0;
  if (!(issues && Object.keys(issues).length > 0)) return total;

  var allquestions = await Question.find({type:device,intent :"repair"},{question :1, options:1});

  for(let aq of allquestions){
    if(aq.question === "Additional Issues") continue;
    if(issues[aq.question]){
      var option = aq.options.find(o => o.text === issues[aq.question]);
      total += option.value;
    }
  }
  let additional = issues['Additional Issues'];
  if(additional) {
    if (typeof additional === "string") additional = [additional];
    allquestions = allquestions.find(q => q.question === "Additional Issues");

    for (let iss of allquestions.options){
      if(additional.includes(iss.text)){
        total += iss.value;
      }
    }
  }
  return total
}
async function Totalrecycle(issues,device){
  var total = 0;
  if (!(issues && Object.keys(issues).length > 0)) return total;

  var allquestions = await Question.find({type:device,intent :"recycle"},{question :1, options:1});

  for(let aq of allquestions){
    if(issues[aq.question]){
      var option = aq.options.find(o => o.text === issues[aq.question]);
      total += option.value;
    }
  }
  return total
}
module.exports.findTotalrepair = async(req,res)=>{
  const issues = req.body.issues;
  const device = req.body.device;
  const actual_price = Number(req.body.actual_price);

  const total = await Totalrepair(issues,device);

  const fp = actual_price-total;
  res.json({deductions: total, finalprice: fp});

}
module.exports.findTotalrecycle = async(req,res)=>{
  const issues = req.body.issues;
  const device = req.body.device;
  const actual_price = Number(req.body.actual_price);

  const total = await Totalrecycle(issues,device);

  const fp = actual_price+total;
  res.json({deductions:fp});
}

module.exports.saveBroken = async(req,res)=>{
  const broken = new Broken();
  const device = req.body.device;
  broken.device = device;
  broken.product_id = req.body.product_id;
  broken.product_variant = req.body.ctr;
  broken.color = req.body.color;

  const images=(req.files||[]).map(f=>({url:f.path,filename:f.filename}));
  const thumbnail=images[0] || null;
  const image = images.length > 1 ? images.slice(1) : images;

  broken.images = image;
  broken.thumbnail = thumbnail;
  
  var allquestions = await Question.find({type:device,intent :"repair"},{question :1, options:1});

  const issues = await IssuesValue(req.body.issues,allquestions);
  var intent = "";
  if(req.body.intent == "sell"){
    intent = await SeverityCheck(req.body.issues,allquestions);
  }else{
    intent = req.body.intent;
  }
  const date = await DateEvaluator(device);
  
  broken.issues = Object.entries(issues).map(([name, value]) => ({name,value}));
  broken.amount = Number(req.body.deductions) || 0;
  broken.intent = intent;
  broken.scheduled_time = date;

  await broken.save();

  return res.json({redirect : "/allmodels/"+req.body.intent+"/"+device});
}

module.exports.rental_duration = async(req,res)=>{
  const product_name = req.body.product_name;
  const clr = req.body.color;
  const lbl = req.body.product_variant;
  const startdate = new Date(req.body.startdate);
  startdate.setHours(0,0,0,0);
  const enddate = new Date (req.body.enddate);
  enddate.setHours(0,0,0,0);

  const prod = await Product.findOneAndUpdate(
    { name: product_name, color : clr, "variant.label" : lbl },  
    { $set: { available: false, "duration.startDate" : startdate, "duration.endDate":enddate } }, 
    { new: true } 
  );
  res.json({redirect : "/rent/phone"});
}
module.exports.createModel = async(req,res)=>{
    const images=req.files.map(f=>({url:f.path,filename:f.filename}));
    const image=images.slice(1);
    const thumbnail=images[0];

    const version = new Model({
  name: "Samsung Galaxy S24",
  brand: "Samsung",
  type: "phone",

  variants: [
    { label: "8GB+128GB", storage: "128GB", ram: "8GB", price: 48900 },
    { label: "8GB+256GB", storage: "256GB", ram: "8GB", price: 54900 }
  ],

  images: [{ url: "", filename: "" }],

  thumbnail: { url: "", filename: "" },

  specifications: {
    display: "6.2-inch Dynamic AMOLED 2X, 120Hz",
    processor: "Exynos 2400 / Snapdragon 8 Gen 3",
    camera: "50MP + 12MP + 10MP Triple Camera",
    battery: "4000 mAh"
  },

  colors: ["Onyx Black", "Marble Gray", "Cobalt Violet"],

  release_date: new Date("2024-01-17"),

  base_recycle_value: 2500
});

  version.images = image;
  version.thumbnail = thumbnail;

  await version.save();
  res.redirect("/allmodels/phone/sell");
}