const express = require('express');
const bodyparser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');



const bugsRouter = require('./routes/bugs');
const commentsRouter = require('./routes/comments');
const usersRouter = require('./routes/users');
const organizationRouter = require('./routes/organization');



const app = express();
const port = process.env.PORT || 3000;
app.use(bodyparser.json());
app.use(cookieParser());
app.use(cors());




app.use("/api", cors(), usersRouter);
app.use("/api", cors(), bugsRouter);
app.use("/api", cors(), commentsRouter);
app.use("/api", cors(), organizationRouter);



app.listen(port, () => {
    console.log(`Server is running on port: ${process.env.PORT || '3000'}`);
});

bugsRouter(app);
commentsRouter(app);
usersRouter(app);
organizationRouter(app);




