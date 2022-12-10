const express = require('express');
const connection = require('../connection');
const router = express.Router();
const ejs = require('ejs');
let pdf = require('html-pdf');
let path = require('path');
var fs = require('fs');
var uuid = require('uuid');
var auth = require('../services/authentication');


router.post('/genereteReport', auth.authenticateToken, (req, res, next)=>{
    const generatedUuid = uuid.v1();
    const orderDetails = req.body;
    var productDetailsReport = JSON.parse(orderDetails.productDetails);
    
    query = "insert into bill(name, uuid, email, contactNumber, paymentMethod, total, productDetails, createdBy) values(?,?,?,?,?,?,?,?)";
    connection.query(query, [orderDetails.name, generatedUuid, orderDetails.email, orderDetails.contactNumber, orderDetails.paymentMethod,orderDetails.totalAmount,orderDetails.productDetails, res.locals.email], (error, result)=>{
        if(!error){
            ejs.renderFile(path.join(__dirname,'',"report.ejs"),{productDetails:productDetailsReport, name:orderDetails.name,email: orderDetails.email, contactNumber: orderDetails.contactNumber, paymentMethod:orderDetails.paymentMethod, totalAmount: orderDetails.totalAmount}, (error, results)=>{
                if(error){
                    return res.status(500).json(error);
                }else{
                    pdf.create(results).toFile('./generated_pdf/'+generatedUuid+'.pdf', function(error, data){
                        if(error){
                            console.log(error);
                            return res.status(500).json(error);
                        }else{
                            return res.status(200).json({uuid:generatedUuid})
                        }
                    })
                }
            })
        }else{
            return res.status(500).json(error)
        }
    })
})

router.post('/getPDF', auth.authenticateToken, (req, res)=>{
    const orderDetails = req.body;
    const pdfPath = './generated_pdf/'+ orderDetails.uuid + '.pdf';
    if(fs.existsSync(pdfPath)){
        res.contentType("application/pdf");
        fs.createReadStream(pdfPath).pipe(res);
    }else{
        var productDetailsReport = JSON.parse(orderDetails.productDetails);
        ejs.renderFile(path.join(__dirname,'',"report.ejs"),{productDetails:productDetailsReport, name:orderDetails.name,email: orderDetails.email, contactNumber: orderDetails.contactNumber, paymentMethod:orderDetails.paymentMethod, totalAmount: orderDetails.totalAmount}, (error, results)=>{
            if(error){
                return res.status(500).json(error);
            }else{
                pdf.create(results).toFile('./generated_pdf/'+orderDetails.uuid+'.pdf', function(error, data){
                    if(error){
                        console.log(error);
                        return res.status(500).json(error);
                    }else{
                        res.contentType("application/pdf");
                        fs.createReadStream(pdfPath).pipe(res);
                    }
                })
            }
        })

    }
})

router.get('/getBills', auth.authenticateToken, (req, res, next)=>{
    var query = "select * from bill order by id DESC";
    connection.query(query, (error, results)=>{
        if(!error){
             return res.status(200).json(results);
        }else{
             return res.status(500).json(error);
        }
    })
})

router.delete('/delete/:id', auth.authenticateToken, (req, res, next)=>{
    const id = req.params.id;
    var query = "delete from bill where id=?";
    connection.query(query, [id], (error, results)=>{
        if(!error){
            if(results.affectedRows==0){
                return res.status(404).json({message:"Bill id does not found."})
            }
            return res.status(200).json({message:"Bill Delete Successfully."})
        }else{
            return res.status(500).json(error)
        }
    })
})

module.exports=router;