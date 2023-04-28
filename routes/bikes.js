const express = require("express");
const router = express.Router();
const {BikeModel,validateBike} = require("../models/bikeModel");
const { auth } = require("../middlewares/auth");

router.get("/", async(req,res) => {
    try {
        const page = req.query.page -1 || 0;
        const per_page = 5;
        const data = await BikeModel
            .find({})
            .limit(per_page)
            .skip(page * per_page)
        res.json(data);
    } catch (error) {
        console.log(error);
        res.status(502).json(error);
    }
})

router.get("/single/:id", async(req,res) => {
    try {
        const id = req.params.id;
        const data = await BikeModel.findOne({_id:id})
        res.json(data);
    } catch (error) {
        console.log(error);
        res.status(502).json(error);
    }
})



router.post("/",auth, async(req,res) => {
    const validateBody = validateBike(req.body);

    if(validateBody.error){
        return res.status(400).json(validateBody.error.details);
    }

    try {
        const Bike = new BikeModel(req.body);
        Bike.user_id = req.tokenData._id;
        await Bike.save();
        res.status(201).json(Bike);
    } catch (error) {
        console.log(error);
        res.status(502).json(error);
    }
})

router.put("/:id", async(req,res) => {
    const validateBody = validateBike(req.body);

    if(validateBody.error){
        return res.status(400).json(validateBody.error.details);
    }

    try {
        const id = req.params.id;
        const resp = await BikeModel.updateOne({_id:id},req.body);
        res.status(201).json(resp);
    } catch (error) {
        console.log(error);
        res.status(502).json(error);
    }
})

router.delete("/:id", async (req,res) => {
    try {
        const id = req.params.id;
        const resp = await BikeModel.deleteOne({_id:id});
        res.json(resp);
    } catch (error) {
        console.log(error);
        res.status(502).json(error);
    }
})


module.exports = router;

/*
    try {
        
    } catch (error) {
        console.log(error);
        res.status(502).json(error);
    }
*/