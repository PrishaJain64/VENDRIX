const {Model} = require('../models/versions.js');
const puppeteer = require('puppeteer');
const path = require('path');
const ejs = require("ejs");
const fs = require("fs");
const { Device } = require('../models/devices.js');
const { all } = require('axios');

module.exports.Filter = async(req,res)=>{
    //brand, price,psort,nsort;
        let br = [];
        if(req.body.brand)
        br = Array.isArray(req.body.brand) ? req.body.brand : [req.body.brand];
        const pr = Number(req.body.price) || 0;
        const psort = Number(req.body.psort) || 0;
        const nsort = Number(req.body.nsort) || 0;
        const device = req.params.device || "all";
    
        const match = {};
        const sort = {};

        const recycleprice = await Device.findOne({device:device}).lean();
    
        if(device && device != "all") match["type"] = device;
        if(pr){ 
          const estim = pr+recycleprice.max_recycle_addon;
          match["base_recycle_value"] = {$lte : estim};
        }
        if(br.length>0 && !br.includes("all")) match["brand"] = {$in : br};
        if(psort && (psort===1 || psort === -1)) sort["variants.0.price"] = psort;
        if(nsort) sort["name"] = nsort;
        console.log(pr);
    
        const pipeline = [];
        if(match && Object.keys(match).length >0){
            pipeline.push({$match : match});
        }
        if (sort && Object.keys(sort).length > 0) {
            pipeline.push({ $sort: sort });
        }
    
        const allmod = await Model.aggregate(pipeline).collation({locale :"en",strength : 2});
        allmod.forEach(el=>{
          el.maxvalue = el.base_recycle_value + recycleprice.max_recycle_addon;
          console.log(el.maxvalue);
        })
        res.render("recycle/recycle",{allmod,device,pr,psort,nsort,br,currentUrl:req.originalUrl});
}

module.exports.All = async (req,res)=>{
    var search = req.query.search;
    var brand = req.query.brand;
           var device = req.params.device;
            var pr=0;
            var psort=0;
            var nsort = 0;
            var br = [];
           var filter = {};
           const recycleprice = await Device.findOne({device:device}).lean();
       if(search) filter.name = {$regex:"^"+search, $options:"i"};
           if(brand) filter.brand = brand
           if(device) filter.type = device;
            const allmod = await Model.find(filter).lean();
            allmod.forEach(el=>{
              el.maxvalue = Number(el.base_recycle_value) + Number(recycleprice.max_recycle_addon);
            })
        res.render("recycle/recycle",{allmod,pr,psort,nsort,br,device,currentUrl:req.originalUrl,search,brand:brand||"all"});
}

module.exports.Download = async(req,res)=>{
    try {
    // 🔹 Dynamic data
    const results = req.body;
    console.log(results);
    //css
    const cssPath = path.join(__dirname, "../public/css/eco_report.css");
    const css = fs.readFileSync(cssPath, "utf8");
    //  EJS → HTML
    const html = await ejs.renderFile(
        path.join(__dirname, "..", "views", "recycle", "eco_report.ejs"),
      {results,css}
    );

    // 🔹 Launch browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // 🔹 Set HTML
    await page.setContent(html, { waitUntil: "domcontentloaded" });

    // 🔹 Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true
    });

    await browser.close();

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `../pdfs/eco-report-${timestamp}.pdf`;

    //to server
    const filePath = path.join(__dirname, fileName);
    fs.writeFileSync(filePath, pdfBuffer);  // saves PDF to ./pdfs folder
    console.log("PDF saved at:", filePath);

     // Send PDF to client
    // res.set({
    //   "Content-Type": "application/pdf",
    //   "Content-Disposition": "attachment; filename=eco-report-vendrix.pdf",
    // });
    // res.send(pdfBuffer);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating PDF");
  }
}
