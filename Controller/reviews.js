const {Review} = require('../models/reviews');
const {Tag} = require('../models/tags');

module.exports.saveReview = async(req,res)=>{
    try{
    const imgs = (req.files||[]).map(f=>({url:f.path,filename:f.filename}));
    const review = new Review({
        user : req.user._id,
        product_name : req.body.name,
        intent : req.body.intent,
        stars:req.body.stars,
        title : req.body.reviewTitle,
        about : req.body.reviewBody,
        images : imgs
    });

    const about = (req.body.reviewTitle + " "+req.body.reviewBody).toLowerCase();
    const words = about.match(/\b\w{4,}\b/g) || [];

    const [tags={}] = await Tag.aggregate([
        {$match:{label : {$in : words}}},
        {$group:{_id:null,categories:{$addToSet:"$category"}}},
        {$project : {_id:0,categories:1}}
    ]);
    
    review.tags = tags?.categories ||[];

    await review.save();

    req.user.reviews.push(review._id);
    await req.user.save();
    
    res.json({valid:"valid"});
}catch(err){console.log(err)};
}

module.exports.Like = async(req,res)=>{
    try{
    const review = await Review.findById(req.body.id);
    const alreadyLiked = review.likedBy.includes(req.user._id);
    if (alreadyLiked) {
      // Unlike
      review.likes -= 1;
      review.likedBy.pull(req.user._id);
    } else {
      // Like
      review.likes += 1;
      review.likedBy.push(req.user._id);
    }
     await review.save();

    res.json({valid:"valid",liked:!alreadyLiked,likes:review.likes});
    }catch(err){console.log(err)};
}