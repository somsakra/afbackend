import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {

    try {
        const token = req.headers['authorization'];
        //Check token presence
        if (!token) {
            res.status(401).json({ message: 'No token provided' });
            return
        }
        const secret = process.env.JWT_SECRET || 'defaultsecret';
        //Verify token
        jwt.verify(token, secret, (err, user) => {
            if (err) {
                res.status(403).json({ message: 'Invalid token' });
                return
            }
            if(!user || typeof user === 'string' || !('userId' in user)) {
                res.status(403).json({ message: 'Invalid token payload' });
                return;
            }
            (req as any).user = user.userId;
            next();
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }

}