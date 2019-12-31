const express = require('express');
const bodyparser = require('body-parser');
const cookieParser = require('cookie-parser');



const bugsRouter = require('./routes/bugs');
const commentsRouter = require('./routes/comments');
const usersRouter = require('./routes/users');



const app = express();
const port = process.env.PORT || 3000;
app.use(bodyparser.json());
app.use(cookieParser());




app.use("/api,", usersRouter);
app.use("/api", bugsRouter);
app.use("/api", commentsRouter);



app.listen(port, () => {
    console.log(`Server is running on port: ${process.env.PORT || '3000'}`);
});

bugsRouter(app);
commentsRouter(app);
usersRouter(app);




