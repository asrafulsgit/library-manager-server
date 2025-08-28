import prisma from "../config/prismaClient.js";

// Create a new book
export const createBook = async (req, res) => {
  try {
    const { ...book } = req.body;

    const isBookExist = await prisma.book.findUnique({
      where: { isbn: book.isbn },
    });
    if (isBookExist) {
      return res.status(400).json({
        success: false,
        message: "Book with this ISBN already exists",
      });
    }

    const newBook = await prisma.book.create({
      data: {
        ...book,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: newBook,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      errors: err.message,
    });
  }
};

// Read books
export const getAllBooks = async (req, res) => {
  try {
    // const { filter,
    //   sortBy = 'createdAt',
    //   sort = 'desc',
    //   limit = '10'
    // } = req.query;

    // const query: any = {};
    // if (filter) {
    //   query.genre = filter;
    // }

    // const sortOption: any = {};
    // sortOption[sortBy as string] = sort === 'asc' ? 1 : -1;

    const books = await prisma.book.findMany({
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    //   .sort(sortOption)
    //   .limit(Number(limit));

    return res.status(200).json({
      success: true,
      message: "Books retrieved successfully",
      data: books,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      errors: err.message,
    });
  }
};

//featured books
// export const featuredBooks = async (req: Request, res: Response)  => {
//   try {
//     const books = await Book.find({available : true})
//       .sort({createdAt : -1})
//       .limit(6);

//     return res.status(200).json({
//       success: true,
//       message: 'Books retrieved successfully',
//       data: books
//     });
//   } catch (err: any) {
//      return res.status(500).json(
//       generaleError(err)
//      );
//   }
// };

// Read a book by ID
export const getBookById = async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await prisma.book.findUnique({ where: { id: bookId } });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book is not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Book retrieved successfully",
      data: book,
    });
  } catch (err) {
    console.error("Error fetching book by ID:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      errors: err.message,
    });
  }
};

// Update a book by ID
// export const updateBook = async (req: Request, res: Response)  => {
//   try {

//     const updateData = updateBookSchema.parse(req.body);
//     const parsed = bookIdValidation.parse(req.params);

//     const book = await Book.findById(parsed.bookId);

//     if (!book) {
//       return res.status(404).json(
//         generateValidationError({
//             bookId: {
//               message: 'Book not found',
//               name: 'ValidatorError',
//               properties: {
//                 message: 'Book not found',
//                 type: 'NotFound'
//               },
//               kind: 'NotFound',
//               path: 'bookId',
//               value: parsed.bookId
//             }
//           })

//       );
//     }

//     book.title = updateData.title ?? book.title;
//     book.author = updateData.author ?? book.author;
//     book.genre = updateData.genre ?? book.genre;
//     book.isbn = updateData.isbn ?? book.isbn;
//     book.description = updateData.description ?? book.description;
//     book.copies = updateData.copies ?? book.copies;

//     const updatedBook = await book.save();

//     return res.status(200).json({
//       success: true,
//       message: 'Book updated successfully',
//       data: updatedBook
//     });

//   } catch (err: any) {
//     console.error('Error updating book:', err);
//     if (err instanceof ZodError) {
//        return  res.status(400).json(
//           generateZodError(err, req.params)
//         )
//       }
//     return res.status(500).json(
//       generaleError(err)
//     );
//   }
// };

// Delete a book by ID
// export const deleteBook = async (req: Request, res: Response) => {
//   try {

//     const parsed = bookIdValidation.parse(req.params);

//     const deletedBook = await Book.findByIdAndDelete(parsed.bookId);

//     if (!deletedBook) {
//       return res.status(404).json(
//         generateValidationError({
//             bookId: {
//               message: 'Book not found',
//               name: 'ValidatorError',
//               properties: {
//                 message: 'Book not found',
//                 type: 'NotFound'
//               },
//               kind: 'NotFound',
//               path: 'bookId',
//               value: parsed.bookId
//             }
//           })
//       );
//     }

//     return res.status(200).json({
//       success: true,
//       message: 'Book deleted successfully',
//       data: null,
//     });
//   } catch (err: any) {
//     console.error('Error deleting book:', err);
//     if (err instanceof ZodError) {
//        return  res.status(400).json(
//           generateZodError(err, req.params)
//         )
//       }
//     return res.status(500).json(
//       generaleError(err)
//     );

//   }
// };

// borrow a book
export const borrowBook = async (req, res) => {
  try {
    const { items, dueDate } = req.body;
    const userId = req.params.id;
    const bookIds = items.map((i) => i.bookId);

    const createBorrow = await prisma.$transaction(async (transection) => {
      const books = await transection.book.findMany({
        where: { id: { in: bookIds } },
      });

      for (const item of items) {
        const book = books.find((b) => b.id === item.bookId);
        if (!book) {
          throw new Error(`Book with id ${item.bookId} not found`);
        }

        if (item.quantity > book.copies) {
          throw new Error(
            `Not enough copies of "${book.title}". Requested: ${item.quantity}, Available: ${book.copies}`
          );
        }

        if (!book.available) {
          throw new Error(
            `Book with id ${item.bookId} is Not available to sell`
          );
        }
      }

      const borrow = await transection.borrow.create({
        data: {
          dueDate,
          userId,
          BorrowItems: {
            create: [...items],
          },
        },
        include: { BorrowItems: { include: { book: true } } },
      });

      for (const item of items) {
        const book = books.find((b) => b.id === item.bookId);
        const remaining = book.copies - item.quantity;
        await transection.book.update({
          where: { id: item.bookId },
          data: {
            copies: remaining,
            available: remaining > 0,
          },
        });
      }

      return borrow;
    });

    return res.status(201).json({
      success: true,
      message: "Borrow success",
      data: createBorrow,
    });
  } catch (err) {
    console.error("Error borrowing book:", err);

    return res.status(500).json({
      success: false,
      message: "something went wrong",
      errors: err.message,
    });
  }
};
export const getAllBorrowSummary = async (req, res) => {
  try {
 
    // const borrows = await prisma.borrow.findMany({
    //   where :{userId},
    //   select : {
    //     BorrowItems: {
    //       select: {
    //         quantity: true,
    //         book: {
    //           select : {
    //             title : true
    //           }
    //         },
    //       },
    //     }
    //   },
     
    // });

     const groupedData = await prisma.borrowItems.groupBy({
      by: ['bookId'],
      _sum: {
        quantity: true
      }
    });
    const bookIds = groupedData.map(b => b.bookId);
    const bookDetails = await prisma.book.findMany({
      where : {id : {in : bookIds}}
    });

    const borrowedSummary = groupedData.map(book => {
        const bookData = bookDetails.find(b => b.id === book.bookId);

        return {
          quantity : book._sum.quantity,
          title :bookData.title,
          isbn : bookData.isbn
        }

    })

    return res.status(201).json({
      success: true,
      message: "Borrowed books summary retrieved successfully",
      data: borrowedSummary
    });
  } catch (err) {
    console.error("Error borrowing book:", err);

    return res.status(500).json({
      success: false,
      message: "something went wrong",
      errors: err.message,
    });
  }
};

// get books summary
// export const booksSummary = async (req: Request, res: Response) : Promise<Response> => {
//   try {
//     const summary = await Borrow.aggregate([
//       {
//         $group: {
//           _id: '$book',
//           totalQuantity: { $sum: '$quantity' },
//         },
//       },
//       {
//         $lookup: {
//           from: 'books',
//           localField: '_id',
//           foreignField: '_id',
//           as: 'bookDetails',
//         },
//       },
//       { $unwind: '$bookDetails' },
//       {
//         $project: {
//           _id: 0,
//           book: {
//             title: '$bookDetails.title',
//             isbn: '$bookDetails.isbn',
//           },
//           totalQuantity: 1,
//         },
//       },
//     ]);

//     return res.status(200).json({
//       success: true,
//       message: 'Borrowed books summary retrieved successfully',
//       data: summary,
//     });
//   } catch (error: any) {
//     console.error('Error generating summary:', error);
//     return res.status(500).json(
//       generaleError(error)
//     );
//   }
// };
