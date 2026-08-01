const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
{
    name:{
        type:String,
        required:true,
        unique:true
    },

    image:{
        type:String,
        required:true
    }
},
{
       timestamps: {
      createdAt: false,
      updatedAt: false,
    },
    versionKey: false,
  }
);

module.exports = mongoose.model("Category",categorySchema, "Category");