const express = require('express');
const connection = require('../connection');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer=require('nodemailer');
require('dotenv').config();


router.post('/signup', (req, res)=>{
    let user = req.body;
    query = "select email, password, role, status from user where email=?";
    connection.query(query,[user.email], (error, results)=>{
        if(!error){
            if(results.length <=0){
                query = "insert into user(name, contactNumber, email, password,status,role) values(?,?,?,?, 'false', 'user')"
                connection.query(query, [user.name, user.contactNumber, user.email, user.password], (error, results)=>{
                    if(!error){
                        return res.status(200).json({message:"Successfully Registered."})
                    }else{
                        return res.status(500).json(error)
                    }
                });
            }else{
                return res.status(400).json({message: "Email Already Exist."})
            }
        }else{
            return res.status(500).json(error)
        }
    })
    
})

router.post('/login',(req, res)=>{
    const user = req.body;
    query = "select email, password, role, status from user where email=?";
    connection.query(query, [user.email], (error, results)=>{
        if(!error){
            if(results.length<=0 || results[0].password!=user.password){
                return res.status(401).json({message: "Incorrect Username or Password"});

            }else if(results[0].status==='false'){
                return res.status(401).json({message:"Wait for Admin Approval"})
            }else if(results[0].password==user.password){
                const response = {email: results[0].email,
                                  role:results[0].role};
                const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, {expiresIn:'8h'});
                return res.status(200).json({token:accessToken});

            }else{
                return res.status(400).json({message:"Something went wrong, please try again later."});
            }
        }else{
            return res.status(500).json(error);
        }
    })
})

var transporter = nodemailer.createTransport({
    service:'Hotmail',
    auth:{
        user:process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})

router.post('/forgotPassword', (req, res)=>{
    const user = req.body;
    const query = "select email, password from user where email=?";
    connection.query(query, [user.email], (error, results)=>{
        if(!error){
            if(results.length<=0){
                return res.status(200).json({message:"Password sent successfully to your email."})
            }else{
                var mailOptions = {
                    from: process.env.EMAIL,
                    to: results[0].email,
                    subject: 'Password by Cafe Management System',
                    html: '<p><b>Your Login details for Cafe Management System</b><br><b>Email: </b>'+results[0].email+'<br><b>Password: </b>'+results[0].password+'<br><a href="http://localhost:4200/user/login">Click here to login</a></p>'
                };
                transporter.sendMail(mailOptions, function(err, info){
                    if(error){
                        console.log(err)
                    }else{
                        console.log("Email sent: "+info.response)
                    }
                });
                return res.status(200).json({message:"Password sent successfully to your email."})
            }
        }else{
            return res.status(500).json(error)
        }
    })
})

module.exports= router;