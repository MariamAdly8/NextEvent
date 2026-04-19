import HTTPError from './../utils/httpError.js';
import Event from './../models/eventModel.js';
import Category from './../models/categoryModel.js';

export const getAllCategories=async(req,res,next)=>{
    try{
        const categories=await Category.find();
        return res.status(200).json({
            status:"Success",
            categories
        });
    }catch(err){
        next(err);
    }       
}

export const getCategoryById=async(req,res,next)=>{
    try{
        const category=await Category.findById(req.params.id);
        if(!category)
            return next(new HTTPError(404,"Category not found"))
        return res.status(200).json({
            status:"Success",
            category
        });
    }catch(err){
        next(err);
    }    
}

export const createCategory=async(req,res,next)=>{
    try{
        const {name}=req.body;
        const category=await Category.create({
            name
        });
        return res.status(201).json({
            status:"Success",
            message:"Category created",
            category
        })
    }catch(err){
        next(err);
    }
}

export const updateCategory=async(req,res,next)=>{
    try{
        const categoryId=req.params.id;
        const category=await Category.findById(categoryId);
        if(!category)
            return next(new HTTPError(404,"Category not exist"));
        const {name}=req.body;
        category.name=name||category.name;
        await category.save();
        return res.status(200).json({
            status:"Success",
            message:"Category updated successfully",
            category
        });
    }catch(err){
        next(err);
    }
}

export const deleteCategory = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        const category = await Category.findByIdAndDelete(categoryId);
        if (!category) {
            return next(new HTTPError(404, "Category not found"));
        }

        await Event.updateMany(
            { category: categoryId },
            { $unset: { category: 1 } } 
        );

        return res.status(200).json({
            status: "Success",
            message: "Category deleted"
        });
    } catch (err) {
        next(err);
    }
}