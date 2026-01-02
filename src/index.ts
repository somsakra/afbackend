import express, { Request, Response, Application } from 'express';
import morgan from 'morgan';
import userRouter from "./route/userRoute.js";

const PORT = process.env.PORT || 3000;

const app: Application = express();

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));


app.use('/user', userRouter );


app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});
   

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

