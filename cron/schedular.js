const {Deployment} = require("../Controller/transfer");
const {dailycheck} = require("../Controller/transfer");
const cron = require("node-cron");

cron.schedule('* * * * *',async ()=>{
    try{
    if(await dailycheck()){
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