const {Deployment,dailycheck} = require("../Controller/transfer");
const {Rental_Repair} = require("../Controller/products");
const cron = require("node-cron");

cron.schedule('* * * * *',async ()=>{
    try{
    if(await dailycheck()){
    await Rental_Repair();
    await Deployment();
    console.log("Daily deployment done");
    }
    else{
        console.log("Daily deployment completed");
    }
    }catch(err){
        console.log("error in deploying : "+err);
    }
});