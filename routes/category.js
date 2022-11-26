const express = require('express');
const connection = require('../connection');
const router = express.Router();
var auth = require('../services/authentication');
var checkRole = require('../services/checkRole');

router.post('/add', auth.authenticateToken, checkRole.checkRole, (req, res, next)=>{
    let category=req.body;
    query = "insert into category(name) values(?)";
    connection.query(query, [category.name], (error, results)=>{
        if(!error){
            return res.status(200).json({message:"Category Added Successfully"});
        }else{
            return res.status(500).json(error);
        }
    })
})

router.get('/get', auth.authenticateToken, (req, res, next)=>{
    var query = "select * from category order by name";
    connection.query(query, (error, results)=>{
        if(!error){
            return res.status(200).json(results);
        }else{
            return res.status(500).json(error);
        }
    })
})

router.patch('/update', auth.authenticateToken,checkRole.checkRole, (req, res,next)=>{
    let category = req.body;
    var query = "update category set name=? where id=?";
    connection.query(query, [category.name, category.id], (error, results)=>{
        if(!error){
            if(results.affectedRows==0){
                return res.status(404).json({message:"Category id does not found."});
            }
            return res.status(200).json({message:"Category updated successfully."});
        }else {
            return res.status(500).json(error);
        }
    })
})

module.exports=router;