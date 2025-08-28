import express from 'express';
import cors from 'cors';   
import userRouter from './routes/user.route.js';
import bookRouter from './routes/book.route.js';

const app = express();

app.use(cors());
app.use(express.json()); 

app.use('/api/v1/user',userRouter);
app.use('/api/v1/books',bookRouter);


export default app;