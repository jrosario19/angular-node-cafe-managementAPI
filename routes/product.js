const express = require('express');
const connection = require('../connection');
const router = express.Router();
var auth = require('../services/authentication');
var checkRole = require('../services/checkRole');

router.post('/add', auth.authenticateToken, checkRole.checkRole, (req, res, next)=>{
    let product=req.body;
    query = "insert into product(name, categoryId, description, price, status) values(?,?,?,?,'true')";
    connection.query(query, [product.name, product.categoryId, product.description, product.price], (error, results)=>{
        if(!error){
            return res.status(200).json({message:"Product Added Successfully"});
        }else{
            return res.status(500).json(error);
        }
    })
})

router.get('/get', auth.authenticateToken,(req, res, next)=>{
    var query = "select p.id, p.name, p.description, p.price, p.status, c.id as categoryId, c.name as categoryName from product as p INNER JOIN category as c where p.categoryId=c.id";
    connection.query(query, (error, results)=>{
        if(!error){
            return res.status(200).json(results);
        }else{
            return res.status(500).json(error);
        }
    })
})

module.exports=router;