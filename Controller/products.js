//Model includes
const {Product}=require('../models/products');

module.exports.renderAllProducts=async (req,res)=>{
    const products=await Product.find({});
    res.render("products/index",{products});
}
module.exports.renderNewPage=(req,res)=>{
    res.render('products/new')
}

module.exports.renderProduct=async (req,res)=>{
    const {id}=req.params;
    const product=await Product.findById(id);
    res.render('products/show',{product});  
}

module.exports.createProduct=async (req,res)=>{

        const images=req.files.map(f=>({url:f.path,filename:f.filename}));
        const image=images.slice(1);
        const thumbnail=images[0];

        const product=await new Product(req.body.products);
        product.images=image;
        product.thumbnail=thumbnail;
        
        product.specifications=req.body.specification;
        await product.save();
        res.redirect('/products');
}