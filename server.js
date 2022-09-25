const express = require('express');
const app = express();
const dataArr = require('./storage');
const multer = require('multer');
const upload = multer();
const AWS = require('aws-sdk');
AWS.config.update({
    region: 'ap-southeast-1',
    accessKeyId: 'AKIA4OQBDFUQRGTTEMPQ',
    secretAccessKey: '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'
});
const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = 'SanPham';

app.use(express.static('./templates'));
app.set('view engine', 'ejs');
app.set('views', './templates');

app.get('/', (req, res) =>{
    const params = {
        TableName: tableName
    };

    docClient.scan(params, (err, data) => {
        if(err){
            return res.send('error:: ', err);
        } else{
            // console.log('data:: ', JSON.stringify(data));
            return res.render('index', { data: data.Items });
        }
    });
});

app.post('/save', upload.fields([]), (req, res) =>{
    const maSanPham = Number(req.body.maSanPham);
    const tenSanPham = req.body.tenSanPham;
    const soLuong  = Number(req.body.soLuong);

    const params = {
        TableName: tableName,
        Item: {
          "maSanPham": maSanPham,
          "tenSanPham": tenSanPham,
          "soLuong": soLuong
        }
    };

    docClient.put(params, (err, data) => {
        if(err){
            console.log('error:: ', err);
            return res.send('error:: ', err);
        } else{
            console.log('data:: ', JSON.stringify(data));
            return res.redirect('/');
        }
    });
});

app.post('/delete', upload.fields([]), (req, res) => {
    const listCheckboxSelected = Object.keys(req.body);
    //req.body trả về 1 object chứa các cặp key & value định dạng:
    // '123456': 'on',
    // '123458': 'on',
    //listCheckboxSelected trả về 1 array: [ '123456', '123458', '96707133' ]
    if(listCheckboxSelected.length <= 0){
        return res.redirect('/');
    } 
    function onDeleteItem(length){
        const params = {
            TableName: tableName,
            Key: {
              "maSanPham": Number(listCheckboxSelected[length])
            }
        }
        docClient.delete(params, (err, data) => {
            if(err)
                return res.send(String(err));
            else{
                if(length > 0){
                    console.log('data deleted:: ', JSON.stringify(data));
                    onDeleteItem(length - 1);
                }
                else
                    return res.redirect('/');
            }
        });
    }
    onDeleteItem(listCheckboxSelected.length - 1);
});

app.listen(4000, () =>{
    console.log('Running in port 4000..');
});