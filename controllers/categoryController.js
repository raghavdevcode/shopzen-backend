const Category = require("../models/Category");

const createCategory = async (req,res)=>{

try{

const category = await Category.create({

name:req.body.name,
image:req.file.path

});

res.status(201).json(category);

}
catch(err){

res.status(500).json({
message:err.message
});

}

};



const getCategories = async(req,res)=>{

try{

const categories = await Category.find().sort({createdAt:-1});

res.json(categories);

}
catch(err){

res.status(500).json({
message:err.message
});

}

};



const getCategory = async(req,res)=>{

try{

const category = await Category.findById(req.params.id);

if(!category){

return res.status(404).json({
message:"Category not found"
});

}

res.json(category);

}
catch(err){

res.status(500).json({
message:err.message
});

}

};



const updateCategory = async(req,res)=>{

try{

const updateData={
name:req.body.name
};

if(req.file){

updateData.image=req.file.path;

}

const category = await Category.findByIdAndUpdate(

req.params.id,
updateData,
{new:true}

);

res.json(category);

}
catch(err){

res.status(500).json({
message:err.message
});

}

};



const deleteCategory = async(req,res)=>{

try{

await Category.findByIdAndDelete(req.params.id);

res.json({
message:"Category deleted successfully"
});

}
catch(err){

res.status(500).json({
message:err.message
});

}

};



module.exports={
createCategory,
getCategories,
getCategory,
updateCategory,
deleteCategory
};