const jwt = require("jsonwebtoken");
const Register = require("../models/register");

const auth = async(req,res,next)=>{
    try {
        const token = req.cookies.jwt;
        const verifyUser =  jwt.verify(token,"iamramveersingandiamafillstackdeveloper")
        const document = await Register.findOne({_id:verifyUser._id});
        req.token= token;
        req.document= document;
        next();

    } catch (error) {
      res.status(401).send(error)
    }
}

module.exports = auth;