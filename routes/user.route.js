
import {Router} from 'express'
import { createUser } from '../controllers/user.controllers.js';

const userRouter = Router()

userRouter.post('/register',createUser)

export default userRouter;