const exp = require("express");
const app = exp();
require('dotenv').config();//process.env
const mongoose = require("mongoose");
const userApp = require("./APIs/userApi");
const authorApp = require("./APIs/authApi");
const adminApp = require("./APIs/adminApi");
const cors=require('cors')
app.use(cors(
    {
        origin: ['https://ideaquill-1.onrender.com', 'https://ideaquill-2-frontend.onrender.com'], // Replace with your frontend URL
        
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    }
))

const port = process.env.PORT || 3000;

//db connection
mongoose.connect(process.env.DBURL)
    .then(() => {
        app.listen(port, () => console.log(`server listening on port ${port}..`))
        console.log("DB connection success")
    })
    .catch(err => console.log("Error in DB connection ", err))

//body parser middleware
app.use(exp.json())
//connect API rouites
app.use('/user-api',userApp)
app.use("/author-api",authorApp)
app.use('/admin-api',adminApp)


//error handler
app.use((err,req,res,next)=>{
    console.log("err object in express error handler :",err)
    
    res.send({message:err.message})
})

