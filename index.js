const express = require("express");
const app = express();
const Sequelize = require("sequelize");

const modelLogs = require("./models/log");

var bodyParser = require('body-parser');

const https = require("https");
var request = require('request');

//sequelize-auto -o "./models" -d test -h localhost -u root -p 3306    -e mysql



const sequelize = new Sequelize("test", "root", "", {
    host: "localhost",
    dialect: "mysql" /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
  
    define: {
      freezeTableName: true
    }
  });
  
  sequelize
    .authenticate()
    .then(() => {
      console.log("Connection has been established successfully.");
    })
    .catch(err => {
      console.error("Unable to connect to the database:", err);
    });

    const Logs = modelLogs(sequelize, Sequelize);
    app.use(bodyParser.json());

    app.post("/login", function(req, res) {

        //console.log(req.body);

        const options = {
            uri: 'http://34.66.5.19/api/v1/login',
            method: "POST",
            body:  JSON.stringify(req.body),
            headers: {
                "content-type": "application/json",
                },
          };

          request(options, function (error, response, body) {
            //console.log('error:', error); // Print the error if one occurred
            //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            //console.log('body:', body); // Print the HTML for the Google homepage.

            if(response.statusCode != 200){
                res.status(response.statusCode).json(JSON.parse(body));
              




            }else{
                

                const dataUser = JSON.parse(body);

                const options2 = {
                    uri: 'http://localhost:3000/insertLog',
                    method: "POST",
                    body:  JSON.stringify(dataUser),
                    headers: {
                        "content-type": "application/json",
                        },
                  };


                request(options2, function (error, response, body2) {
                    // console.log('error:', error); // Print the error if one occurred
                    console.log('statusCode:', response.statusCode ); // Print the response status code if a response was received
                    console.log('body:', body2); // Print the HTML for the Google homepage.
        
                
                    if(response.statusCode != 200){
                        res.status(response.statusCode).json(body2);
                    }else{
                        res.status(response.statusCode).json(JSON.parse(body2));
                    }
                        
        
                        
                  
                 });


            } });

      });

    
      app.post("/insertLog", function(req, res) {
        //console.log("----------");
        //console.log(req.body.data);
        const datos = req.body.data;

        Logs.create({
            userId: datos.user.id,
            jwt : datos.jwt,
            createAt : new Date()           


          }
        ).then((x) => {
            res.status(200).send(x);
        })
      });



      app.get("/logs", function(req, res) {
        let page = Number(req.query.page) || 1;
        let limit = Number(req.query.limit) || 50;
        let offset = 0;
      
        Logs.findAndCountAll()
          .then(data => {
            // page number
            let pages = Math.ceil(data.count / limit);
            offset = limit * (page - 1);
            Logs.findAll({
              limit: limit,
              offset: offset,
              $sort: { id: 1 }
            }).then(Logs => {
              res
                .status(200)
                .json({ result: Logs, count: data.count, pages: pages });
            });
          })
          .catch(function(error) {
            res.status(500).send("Internal Server Error");
          });
      
      
      });
    

app.listen(3000, () => {
    //console.log("El servidor está inicializado en el puerto 3000");
  });
