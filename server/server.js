const express = require('express');
const bodyparser = require('body-parser');
const cookieParser = require('cookie-parser');




const bugsRouter = require('./routes/bugs');
const commentsRouter = require('./routes/comments');
const usersRouter = require('./routes/users');
const organizationRouter = require('./routes/organization');



const app = express();
const port = process.env.PORT || 3000;
app.use(bodyparser.json());
app.use(cookieParser());


app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
        return res.status(200).json({});
    }
    next();
});




app.use("/api", usersRouter);
app.use("/api", bugsRouter);
app.use("/api", commentsRouter);
app.use("/api", organizationRouter);



app.listen(port, () => {
    console.log(`Server is running on port: ${process.env.PORT || '3000'}`);
});

bugsRouter(app);
commentsRouter(app);
usersRouter(app);
organizationRouter(app);




