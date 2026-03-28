const {Product}=require('../models/products');
const {Model} = require('../models/versions');
const {Broken} = require('../models/broken');
const {Daily} = require('../models/daily');

module.exports.Deployment = async()=>{
    var now = new Date();
    now.setHours(0,0,0,0);

    var yest = new Date();
    yest.setHours(0,0,0,0);
    yest.setDate(yest.getDate()-1);

    const fixedproducts = await Broken.find({scheduled_time : yest}).populate("product_id");
    if(fixedproducts.length){
    const result =  await Product.bulkWrite(
        fixedproducts.map(item => {

            const incField =
            item.intent === "refurbish"
                ? { stock: 1 }
                : item.intent === "rent"
                ? { available: 1 ,unavailable:0}
                : {};
            const setOnInsertFields = {
                variant: {
                    label: item.product_id.variants[item.product_variant].label,
                    storage: item.product_id.variants[item.product_variant].storage,
                    ram: item.product_id.variants[item.product_variant].ram,
                    price: {
                    amount: item.product_id.variants[item.product_variant].price
                    }
                },
                brand: item.product_id.brand,
                type: item.device,
                name: item.product_id.name,
                release_date: item.product_id.release_date,
                color: {
                    color: item.color.color,
                    images: item.product_id.colors.find(c => c.color === item.color.color)?.images || [],
                    thumbnail: item.product_id.colors.find(c => c.color === item.color.color)?.thumbnail,
                    hexcode: item.color.hexcode
                },
                price: {
                    amount: Math.round(item.product_id.variants[item.product_variant].price * 0.9)
                },
                intent: item.intent,
                specifications: Object.fromEntries(
                    Object.entries(item.product_id.specifications).map(([k, v]) => [k, v])
                )
                };

            return{
            updateOne: {
            filter: {
                name: item.product_id.name,
                "variant.label": item.product_id.variants[item.product_variant].label,
                "color.color": item.color.color,
                "intent" : item.intent
            },
            update: {
                $inc: incField,
                $setOnInsert: setOnInsertFields
            },
            upsert: true
            }
        }})
        );
    }
    const today = new Daily();
    today.date = now;
    today.status = true;
    
    await today.save();
    //delete from broken too
};

module.exports.dailycheck = async()=>{
    const now = new Date();
    now.setHours(0,0,0,0);
    const result = await Daily.findOne({date:now});
    if(result) return false;
    else return true;
};