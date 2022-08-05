const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());


//Multer file upload
// app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 7777;
dotenv.config();

//MongoDB Connect
mongoose.connect(
    process.env.DB_CONNECT, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    // useCreateIndex: true,
}).then((data) => console.log(`MongoDB connected with server: ${data.connection.host}`)).catch((err)=> {
    console.log(err);
})

//Route Middlewares
// const apiRoutes = require('./routes/api/api');
// const Content = require('./models/Content');
// app.use("/api", apiRoutes);



//Route Middlewares
const apiRoutes = require('./routes/api');
app.use("/api", apiRoutes);

app.listen(PORT, () => console.log(`Server Up and Running on Port ${PORT}`));