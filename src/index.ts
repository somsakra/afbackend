import { prisma } from "./lib/prisma.js";
import express, { Request, Response, Application } from 'express';

const PORT = process.env.PORT || 3000;

const app: Application = express();

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.post('/', async (req: Request, res: Response) => {
    console.log(req.body);
    const user = await prisma.user.create({
        data: {
            email: req.body.email,
            name: req.body.name,
            password: req.body.password
        }
    });
    res.json(user);
});
   


app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

