const express = require('express');
const connection = require('../connection');
const router = express.Router();

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


module.exports= router;