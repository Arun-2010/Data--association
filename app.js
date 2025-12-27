const express=require('express');
const app=express();
const cookiesParser=require('cookie-parser');
const userSchema=require('./models/user');
const brcypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const { BaseCollection } = require('mongoose');


app.set('view engine','ejs');
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookiesParser());

app.get('/',(req,res)=>{
    res.render("index");
})

app.get('/profile',isloggedIn, async (req,res)=>{
    let userData=await userSchema.findOne({email:req.user.email});
    res.render("profile",{userData});
})

app.get('/login',(req,res)=>{
    res.render("login");
})


    app.get('/logout',(req,res)=>{
        res.clearCookie('token');
        res.send("Logged out Successfully");
        res.redirect('/login');
})

app.post('/register',async (req,res)=>{
    let {email,password,username,name,age}=req.body;
    let user=await userSchema.findOne({email});
    if(user)return res.send('User already exists');   
     brcypt.genSalt(10,async (err,salt)=>{
        brcypt.hash(password,salt,async (err,hash)=>{
           let user=await userSchema.create({
                username,
                name,
                email,
                age,
                password:hash
            });
           let token= jwt.sign({id:user._id,email:email},'secret')
           res.cookie('token',token);
           res.send("created Successfully");
        }
        )
        })
})



app.post('/login',async (req,res)=>{
    let {email,password,}=req.body;
    let user=await userSchema.findOne({email});
    if(!user)return res.send('User does not exists create account');   
    brcypt.compare(password,user.password,async (err,result)=>{
        if(result){
         let token= jwt.sign({id:user._id,email:email},'secret')
           res.cookie('token',token);
              res.redirect('/profile');

    }
            else res.send("Invalid Credentials");
    })
})  


function isloggedIn(req,res,next){
    if(req.cookies.token=="") res.redirect('/login');
    else{
        let data=jwt.verify(req.cookies.token,'secret')
        req.user=data;
        next();
        } 
        
        
     }

app.listen(3000,()=>{
    console.log('Server is running on port 3000');
}); 