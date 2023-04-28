const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {UserModel,validateUser, validateLogin,createToken} = require("../models/userModel")
const {auth} = require("../middlewares/auth")
const router = express.Router();

router.get("/", async(req,res) => {
  res.json({msg:"Users endpoint"}); 
})



// auth -> קורא קודם לפונקציית מיידל וואר שבודקת אם יש טוקן
router.get("/userInfo", auth ,async(req,res) => {
  try{
    const user = await UserModel.findOne({_id:req.tokenData._id},{password:0})
    res.json(user)
  }
  catch(err){
    console.log(err);
    res.status(502).json({err})
  }
})

// כיצד עבדנו לפני שהיה לנו פונקציית מידל וואר שבודקת טוקן
// היינו צריכים כמו ברברים לבדוק בתוך הראוטר עצמו
router.get("/userInfoTest", async(req,res) => {
  // נרצה לבדוק אם נשלח טוקן לאתר דרך ההידר
  // req.params, req.query, req.body, req.header
  const token = req.header("x-api-key");
  if(!token){
    return res.status(401).json({err:"You need send token 111" })
  }
  try{
    
    // מנסה לפענח את הטוקן
    const decodeToken = jwt.verify(token, "monkeysSecret");
    // {password:0 } -> יחזיר את כל המאפיינים חוץ מהסיסמא
    // {password:1 } -> יחזיר את הסיסמא בלבד ואת האיי די

    const user = await UserModel.findOne({_id:decodeToken._id},{password:0})
    res.json(user);
    // res.json(decodeToken);
  }
  catch(err){
    // אם נסיון הפענוח לא צלח  בגלל שהטוקן לא תקין או לא בתוקף
    // נגיע לכאן
    res.status(401).json({err:"token invalid or expired 2222"})
  }
})

router.post("/", async(req,res) => {
  const validBody = validateUser(req.body);
  if(validBody.error){
    return res.status(400).json(validBody.error.details);
  }
  try{
    const user = new UserModel(req.body);
    // הצפנה של הסיסמא
    user.password = await bcrypt.hash(user.password, 10);
    await user.save();
    // שינוי תצוגת הסיסמא לצד לקוח המתכנת
    user.password = "*****";
    res.status(201).json(user);
  }
  catch(err){
    if(err.code == 11000){
      return res.status(401).json({err:"Email already in system",code:11000})
    }
    console.log(err);
    res.status(502).json({err})
  }
})

router.post("/login", async(req,res) => {
  const validBody = validateLogin(req.body);
  if(validBody.error){
    return res.status(400).json(validBody.error.details);
  }
  try{
    // בודק אם המייל שנשלח בכלל קיים במסד
    // findOne -> מוצא אחד בלבד ומחזיר אובייקט,אם לא מוצא מחזיר אנדיפיינד
    const user = await UserModel.findOne({email:req.body.email});
    if(!user){
      return res.status(401).json({msg:"Email not found!"});
    }
    // אם הסיסמא מתאימה לרשומה שמצאנו במסד שלנו כמוצפנת
    //  bcrypt.compare -> בודק אם הסיסמא שהגיע מהצד לקוח בבאדי
    // תואמת לסיסמא המוצפנתת בסיסמא
    const passwordValid = await bcrypt.compare(req.body.password, user.password);
    if(!passwordValid){
      return res.status(401).json({msg:"Password worng!"});
    }
    const token = createToken(user._id)
    res.json({token});
    // לשלוח טוקן
  }
  catch(err){
    console.log(err);
    res.status(502).json({err})
  }
})

module.exports = router;