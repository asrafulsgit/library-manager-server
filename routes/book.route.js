
import {Router} from 'express'
import { borrowBook, createBook, getAllBooks, getBookById } from '../controllers/book.controllers.js';

const bookRouter = Router()

bookRouter.post('/',createBook)
bookRouter.get('/all',getAllBooks)
bookRouter.get('/:id',getBookById)
bookRouter.post('/borrow/:id',borrowBook)

export default bookRouter;