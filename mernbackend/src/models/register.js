
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")


const userSchema= new mongoose.Schema({
    fullname:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true,
        unique:true
    },
    mobile:{
        type:Number,
        require:true,
        unique:true
    },
    password:{
        type:String,
        require:true
    },
    confirmpassword:{
        type:String,
        require:true
    },
    tokens:[{
        token:{
            type:String,
            require:true
        }
    }]
});


// this method is used to create  a tokenid

// const createtoken = async()=>{

//     // create token
//     const token = await jwt.sign({_id:"64025859a17f1f788f42f552"},"djfskldjflksdjfklsdjfklsdjfklsdjfklsdfsdf",{
//         expiresIn:"2 second"
//     });
//     console.log(token);

//     //    verify token
//     const userver = jwt.verify(token,"djfskldjflksdjfklsdjfklsdjfklsdjfklsdfsdf")
//     console.log(userver);
// }
// createtoken();


// generating token
userSchema.methods.mytoken=async function(){
    try {
        const token = jwt.sign({_id:this.id.toString()},process.env.SECRET_KEY)
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        return token;
    } catch (error) {
        res.send("this is my error"+error)
        console.log("this is my error" + error)
    }
}


// hashing the password then store in database

userSchema.pre("save",async function(next){
    if(this.isModified("password")){
        // const password = await bcrypt.hash(password,10);
        console.log(this.password);
        this.password = await bcrypt.hash(this.password,10);
        console.log(this.password);
        this.confirmpassword = undefined;
    }
    next();
})

// create Collection 





const Register= new mongoose.model("Register",userSchema);

module.exports = Register;
