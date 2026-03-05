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
    }
    ++count;
  }
  let additional = issues['Additional Issues'];
  if(additional) {
    if (typeof additional === "string") additional = [additional];
    allquestions = allquestions.find(q => q.question === "Additional Issues");

    for (let iss of allquestions.options){
      if(additional.includes(iss.text)){
        total += iss.severity;
      }
      ++count;
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
  const images=(req.files||[]).map(f=>({url:f.path,filename:f.filename}));
  const thumbnail=images[0] || null;
  const image = images.length > 1 ? images.slice(1) : images;
  const broken = new Broken({color :{
    color : req.body.color,
    images : image,
    thumbnail : thumbnail
  }});
  const device = req.body.device;
  broken.device = device;
  broken.product_id = req.body.product_id;
  broken.product_variant = req.body.ctr;
  const sellorrepair = req.body.intent;
  
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

  res.json({redirect:"/allmodels/"+sellorrepair+"/"+device});
}

module.exports.rental_duration = async(req,res)=>{
  const product_name = req.body.product_name;
  const clr = req.body.product_color;
  const lbl = req.body.product_label;
  
  const startdate = new Date(req.body.startdate);
  startdate.setHours(0,0,0,0);
  const enddate = new Date (req.body.enddate);
  enddate.setHours(0,0,0,0);

  const prod = await Product.findOneAndUpdate(
    { name: product_name, "color.color" : clr, "variant.label" : lbl },  
    { $set: { available: false, "duration.startDate" : startdate, "duration.endDate":enddate } }, 
    { new: true } 
  );
  res.json({redirect : "/rent/phone"});
}
module.exports.createModel = async(req,res)=>{
    const images=req.files.map(f=>({url:f.path,filename:f.filename}));

    const version = new Model({
  name: "Samsung Galaxy Watch 8",
  brand: "Samsung",
  type: "smartwatch",

  variants: [
    { 
      label: "40mm Bluetooth | 2GB RAM | 32GB Storage",
      size: "40mm",
      connectivity: "Bluetooth",
      ram: "2GB",
      storage: "32GB",
      price: 32999 
    },
    { 
      label: "44mm Bluetooth | 2GB RAM | 32GB Storage",
      size: "44mm",
      connectivity: "Bluetooth",
      ram: "2GB",
      storage: "32GB",
      price: 35999 
    },
    { 
      label: "40mm LTE | 2GB RAM | 32GB Storage",
      size: "40mm",
      connectivity: "LTE",
      ram: "2GB",
      storage: "32GB",
      price: 36999 
    },
    { 
      label: "44mm LTE | 2GB RAM | 32GB Storage",
      size: "44mm",
      connectivity: "LTE",
      ram: "2GB",
      storage: "32GB",
      price: 39999 
    }
  ],

  specifications: {
    display: "Super AMOLED (1.34″ / 1.47″), 3000 nits peak, Sapphire Crystal",
    processor: "Exynos W1000 (3nm)",
    battery: "325 mAh (40mm) / 435 mAh (44mm)"
  },

  colors: [
    {
      color: "Graphite",
      thumbnail: images[0],
      images: images.slice(1, 2)
    },
    {
      color: "Silver",
      thumbnail: images[2],
      images: images.slice(3, 4)
    }
  ],

  release_date: new Date("2025-07-25"),
  base_recycle_value: 5000
});

  await version.save();
  
  res.redirect("/allmodels/sell/phone");
}