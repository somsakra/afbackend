import express, { Request, Response, Application } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import userRouter from "./route/userRoute.js";
import activityRouter from './route/activityRoute.js';
import { authenticateToken } from './middleware/authentication.js';

const PORT = process.env.PORT || 3000;

const app: Application = express();

app.use(cors())
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));


app.use('/user', userRouter );
app.use('/activity', authenticateToken, activityRouter );


app.get('/',(req: Request, res: Response) => {
    res.send('Hello World!');
});
   

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

