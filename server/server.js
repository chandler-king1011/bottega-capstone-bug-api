const express = require('express');
const bodyparser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require("cors");
const fileUpload = require("express-fileupload");




const bugsRouter = require('./routes/bugs');
const commentsRouter = require('./routes/comments');
const usersRouter = require('./routes/users');
const organizationRouter = require('./routes/organization');



const app = express();
const port = process.env.PORT || 5000;

app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));
app.use(cors());
app.use(bodyparser.json());
app.use(cookieParser());






app.use("/api", usersRouter);
app.use("/api", bugsRouter);
app.use("/api", commentsRouter);
app.use("/api", organizationRouter);



app.listen(port, () => {
    console.log(`Server is running on port: ${process.env.PORT || '5000'}`);
});

bugsRouter(app);
commentsRouter(app);
usersRouter(app);
organizationRouter(app);




