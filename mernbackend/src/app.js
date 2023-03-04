require('dotenv').config();
const express = require("express");
require("./db/connection");
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");
const hbs = require("hbs");
const Register = require("./models/register");
const { rmSync } = require("fs");
const cookieParser = require("cookie-parser")
const auth = require("./middleware/auth");
const bcrypt = require('bcryptjs');


app.use(cookieParser());
app.use(express.json());  // this is used for postman
app.use(express.urlencoded({ extended: false })); // for use google json gets


console.log(process.env.SECRET_KEY)// no-one can see this when used .env 

//serving public file which is store in public folder
const public_path = path.join(__dirname, "../public");
app.use(express.static(public_path));

//serving dynamic file
const dynamic_path = path.join(__dirname, "../templates/views");
app.set("view engine", "hbs");
app.set("views", dynamic_path);


//serving dynamic file
const partials_path = path.join(__dirname, "../templates/partials");
hbs.registerPartials(partials_path)



app.get("/", (req, res) => {
    res.render("home", { name: "MERN STACK STUDENT", img: "/img/1.png" })
});
app.get("/about", (req, res) => {
    res.render("about", { name: "RAMVEER SINGH", img: "/img/2.png" })
});
app.get("/contact", (req, res) => {
    res.render("contact")
});
app.get("/register", (req, res) => {
    res.render("register")
});
app.get("/secret", auth, (req, res) => {
    // console.log(`This is my secret page token ${req.cookies.jwt}`)
    res.render("secret")
});
app.get("/login", (req, res) => {
    res.render("login")
});
app.get("/logout", auth, async (req, res) => {
    try {

        req.document.tokens = req.document.tokens.filter((currentEle) => {
            return currentEle.token !== req.token;
        })

        res.clearCookie("jwt");
        await req.document.save();
        res.render("login");
    } catch (error) {
        res.status(500).send(error)
    }
});

// use post request 
app.post("/register", async (req, res) => {
    try {
        const password = req.body.password;
        const confirmpassword = req.body.password;
        if (password === confirmpassword) {
            const userdata = new Register({
                fullname: req.body.fullname,
                email: req.body.email,
                mobile: req.body.mobile,
                password: req.body.password,
                confirmpassword: req.body.confirmpassword
            });
            const token = await userdata.mytoken();
            console.log("my token is " + token);

            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 50000),
                httpOnly: true
            });

            const savedata = await userdata.save();
            res.status(201).render("home");
        }
    } catch (error) {
        res.status(400).send(error)

    }
});

app.post("/login", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const useremail = await Register.findOne({ email: email });
        
        //     bcrypt password ko again check when login
        
        const isMatch = await bcrypt.compare(password, useremail.password);
       
        const token = await useremail.mytoken();

        console.log("This is my token " + token);
        
        if (isMatch) {
            res.status(201).render("home")
        }
        else {
            res.send("invalid Password")
        }
        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 50000),
            httpOnly: true
        });

        //  this is basic method to varify password

        //          if(useremail.password===password){
        //               res.status(201).render("home")
        //      }else{
        //         res.send("invalid login details")
        //     }
    } catch (error) {
        res.status(400).send("invalid loing detail")
    }
});

// increpted by bcrypt hashing password

// const securePassword = async(password)=>{
//    const  passwordHash = await bcrypt.hash(password,10);
//    console.log(passwordHash);

//    const  passwordmatch = await bcrypt.compare(password,passwordHash);
//    console.log(passwordmatch);
// }

// securePassword("thapa@123");




app.listen(port, () => {
    console.log(`the server is running port no http://localhost:${port}`);
});
