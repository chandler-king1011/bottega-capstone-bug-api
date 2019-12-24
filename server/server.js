const express = require('express');
const bodyparser = require('body-parser');


const bugsRouter = require('./routes/bugs');
const commentsRouter = require('./routes/comments');


//server set up
const app = express();
const port = process.env.PORT || 3000;
app.use(bodyparser.json());
app.use("/api", bugsRouter);
app.use("/api", commentsRouter)


app.listen(port, () => {
    console.log(`Server is running on port: ${process.env.PORT || '3000'}`);
});

bugsRouter(app);
commentsRouter(app);




