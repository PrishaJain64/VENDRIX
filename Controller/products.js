//Model includes
const {Model} = require('../models/versions');
const {Broken} = require('../models/broken');
const {Question} = require('../models/questions');
const {Product} = require("../models/products");

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
  name: "Sony WH-CH720N",
  brand: "Sony",
  type: "headphone",

  variants: [
    {
      label: "Bluetooth 5.2 | ANC | 35hr Battery",
      connectivity: "Bluetooth 5.2",
      battery_life: "Up to 35 Hours",
      price: 9990
    }
  ],

  specifications: {
    audio: "Sony Integrated Processor V1",
    noise_cancellation: "Active Noise Cancelling",
    battery: "Up to 35 hours",
    charging: "USB-C Fast Charging"
  },

  colors: [
    { color: "Black", thumbnail: images[0], images: images.slice(1,2) },
    { color: "Pink", thumbnail: images[2], images: images.slice(3,4) }
  ],

  release_date: new Date("2023-01-01"),
  base_recycle_value: 1500
});

  await version.save();
  
  res.redirect("/allmodels/sell/phone");
}