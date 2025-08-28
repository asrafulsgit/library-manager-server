
import {Router} from 'express'
import { borrowBook, createBook, getAllBooks, getAllBorrowSummary, getBookById } from '../controllers/book.controllers.js';

const bookRouter = Router()

bookRouter.post('/',createBook)
bookRouter.get('/all',getAllBooks)
bookRouter.get('/:id',getBookById)
bookRouter.post('/borrow/:id',borrowBook)
bookRouter.get('/borrow/summary',getAllBorrowSummary)

export default bookRouter;