const mongoose = require('mongoose');
const Joi = require('joi');

const date = new Date();


const bikeSchema = new mongoose.Schema({
    company:String,
    model:String,
    year:Number,
    price:Number,
    user_id:String
},{timestamps:true});

exports.BikeModel = mongoose.model("bikes",bikeSchema);

exports.validateBike = (_req_body) => {
    const validateBody  =  Joi.object({
        company:Joi.string().min(2).max(15).required(),
        model:Joi.string().min(2).max(15).required(),
        year:Joi.number().min(1816).max(Number(date.getFullYear())).required(),
        price:Joi.number().min(1).max(100000).required()
    });

    return validateBody.validate(_req_body);
}

