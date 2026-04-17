
//Model includes
const {Model} = require('../models/versions');
const {Broken} = require('../models/broken');
const {Question} = require('../models/questions');
const {Product} = require("../models/products");

function getConditionLabel(score) {
  switch (true) {
    case (score >= 90):
      return "Excellent";
    case (score >= 75):
      return "Very Good";
    case (score >= 60):
      return "Good";
    case (score >= 45):
      return "Fair";
    case (score >= 25):
      return "Poor";
    default:
      return "Critical";
  }
}

async function DateEvaluator (device, dt){
  const sd = new Date();
  sd.setDate(sd.getDate()+3 );
  sd.setHours(0,0,0,0);

  const date = dt || sd;

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
  if(total/count > 2) return "rent";
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
   total = total.toFixed(2);
  return total
}
async function Totalrecycle(issues,device){
  var total = {
    userTotal :0,
    completeTotal:0
  };
  if (!(issues && Object.keys(issues).length > 0)) return total;

  var allquestions = await Question.find({type:device,intent :"recycle"},{question :1, options:1});

  for(let aq of allquestions){
    if(issues[aq.question]){
      var option = aq.options.find(o => o.text === issues[aq.question]);
      total.userTotal += option.value;
    }
    total.completeTotal+=aq.options[0].value;
  }
  return total
}
module.exports.findTotalrepair = async(req,res)=>{
  const issues = req.body.issues;
  const device = req.body.device;
  const actual_price = Number(req.body.actual_price);
  
  var total = await Totalrepair(issues,device);

  const fp = (actual_price-total).toFixed(2);
  res.json({deductions: total, finalprice: fp});

}
module.exports.findTotalrecycle = async(req,res)=>{
  const issues = req.body.issues;
  const device = req.body.device;
  const actual_price = Number(req.body.actual_price);

  const total = await Totalrecycle(issues,device);

  const fp = actual_price+total.userTotal;
  const eco_impact = parseInt((total.userTotal*100)/total.completeTotal);
  const condition = getConditionLabel(eco_impact);
  const cmax = 70;
  const wmax =  0.2;
  const pmax = 275;

  const csaved = (eco_impact*cmax/100).toFixed(2);
  const ewsaved = (eco_impact*wmax/100).toFixed(2);
  const ensaved = (eco_impact*pmax/100).toFixed(2);

  res.json({deductions:fp,condition,eco_impact,reduction:total.userTotal,csaved,ewsaved,ensaved,issues});
}
module.exports.Rental_Repair = async()=>{
  try{
      var now = new Date();
      now.setHours(0,0,0,0);
  
      var yest = new Date();
      yest.setHours(0,0,0,0);
      yest.setDate(yest.getDate()-3);

      await Product.updateMany(
      { "duration.endDate": yest },
      [{$set: {unavailable: {$subtract: [
                "$unavailable",
                {$size: {$filter: {input: "$duration",as: "d",cond: { $eq: ["$$d.endDate", yest] }}}}]}}}],{
                  updatePipeline:true

                });

      const repairproducts = await Product.aggregate([
        {$match : {"duration.endDate" : yest}},
        {$unwind:"$duration"},
        {$match : {"duration.endDate" : yest}}
      ]) || [];

      await Product.updateMany(
      { "duration.endDate": yest },
      {
        $pull: {
          duration: { endDate: yest }
        }
      }
    );
    
    const unique_names = [...new Set(repairproducts.map(i=>i.name))];
    const models = await Model.find({name : {$in:unique_names}}).lean();

    const modelMap = {};
    models.forEach(m => {
      modelMap[m.name] = m;
    });
    repairproducts.forEach(async item => {

    const model = modelMap[item.name];

    const variantIndex = model.variants.findIndex(
      v => v.label === item.variant.label
    );

    const fin = new Broken({
      product_id : model._id,
      product_variant : variantIndex,
      device : item.device,
      color: {
        color: item.color.color,
        images: model.colors.find(c => c.color === item.color.color)?.images || [],
        thumbnail: model.colors.find(c => c.color === item.color.color)?.thumbnail,
        hexcode: item.color.hexcode
      },
      issues : [],
      amount : 0,
      intent: "rent",
      scheduled_time : await DateEvaluator(item.device,yest)
    });

    console.log(fin);
    await fin.save();

});}catch(err){
  console.log(err);
}
}
module.exports.saveBroken = async(req,res)=>{
  const images=(req.files||[]).map(f=>({url:f.path,filename:f.filename}));
  const thumbnail=images[0] || null;
  const image = images.length > 1 ? images.slice(1) : images;
  const broken = new Broken({color :{
    color : req.body.color,
    images : image,
    thumbnail : thumbnail,
    hexcode : req.body.hexcode
  }});
  const device = req.body.device;
  broken.device = device;
  broken.product_id = req.body.product_id;
  broken.product_variant = req.body.ctr;
  
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
  broken.amount = Number(req.body.deductions).toFixed(2) || 0;
  broken.intent = intent;
  broken.scheduled_time = date;

  await broken.save();

  res.json({valid:true});
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
    {
    $inc: {
      available: -1,
      unavailable: 1
    },
    $push: {
      duration: {
        startDate: startdate,
        endDate: enddate
      }
    }
  },
    { new: true } 
  );
  res.json({redirect : "/rent/phone"});
}
module.exports.createModel = async(req,res)=>{
    const images=req.files.map(f=>({url:f.path,filename:f.filename}));

    const version = new Model({
  "name": "Lenovo Legion 7i",
  "brand": "Lenovo",
  "type": "laptop",
  "variants": [
    {
      "label": "Intel Core Ultra 7 | RTX 5070 | 16GB | 1TB SSD",
      "price": 179990
    },
    {
      "label": "Intel Core Ultra 9 | RTX 5080 | 32GB | 1TB SSD",
      "price": 229990
    }
  ],
  "specifications": {
    "display": "16-inch 3.2K OLED, 165Hz",
    "processor": "Intel Core Ultra HX Series",
    "graphics": "NVIDIA RTX 50-series (AI DLSS 4)",
    "battery": "Performance-optimized gaming battery"
  },
  "colors": [
    {
      "color": "Shadow Black",
      "images": images.slice(1,3),
      "thumbnail": images[0],
      "hexcode": "#0B0B0B"
    },
    {
      "color": "Glacier White",
      "images": images.slice(4,6),
      "thumbnail": images[3],
      "hexcode": "#F5F5F5"
    }
  ],
  "release_date": "2026-02-01T00:00:00.000Z",
  "base_recycle_value": 20000
}


);

  await version.save();
  
  res.redirect("/allmodels/sell/phone");
}