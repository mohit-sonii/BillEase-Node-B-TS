import { Response, Request } from "express"
import { prisma } from "../client";
import jwt from 'jsonwebtoken'
import { JWT } from "../util/tokenCookie";

/* 
    • Checking of cookie is pretty redundant beacuse a user can reach here only and only if he is authenticated else it will not be here, but jsut for safety concern i let it go. 

    • The user id can be added in the Request but it works without error in JavaScript but in TypeScript this often gives type error which i was unable to resolve even after hours of troubleshooting so which is why I am using token and fetch user again and again
*/

/*
    • Take required data as input
    • Check whether we have cookie or not, if not then return unautoeized
    • Store the book in the database
*/

export const addBook = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, genre } = req.body;
        let {price} = req.body;
        price = parseInt(price)
        const cookie = req.cookies?.auth_for_book
        if (!cookie) {
            res.status(404).json({ status: 404, message: "Unauthorized" })
            return
        }

        const findSameTitleBook = await prisma.book.findFirst({
            where: {
                title: title
            },
            select: {
                title: true,
                author: true,
            }
        })
        if (findSameTitleBook != null) {
            res.status(409).json({ status: 409, message: "Book with this title aleady exists" })
            return;
        }
        const decoded = jwt.decode(cookie) as JWT
        try {
            await prisma.book.create({
                data: {
                    title,
                    genre,
                    // this is coz we need to make a relationship and hence we need to connect them with reliable tables. here theauthor field is an entity that is connected with user_id as the author and user are same, because only user can add the book
                    author: {
                        connect: {
                            user_id: decoded.id
                        }
                    },
                    price,
                }
            })

        } catch (err) {
            res.status(500).json({ status: 500, message: "Something went wrong " })
            console.log(err)
            return
        }
        res.status(201).json({ status: 201, message: "Book Saved Successfully" })
        return

    } catch (err) {
        res.status(500).json({ status: 500, message: "Internal Server Error" })
        console.log(err)
        return
    }
}

/*
    • Get author name, genre and page number from query parameter
    • Find the book with any thing that we have either from name or genre, if we have both find from both, anyone do serach from anyone. only then
*/

export const getBooks = async (req: Request, res: Response) => {
    try {
        const { authorName, genr, page } = req.query
        let currPage = parseInt(page as string) || 1
        if (currPage == 0) currPage = 1;
        const books = await prisma.book.findMany({
            where: {
                AND: [
                    // if the authorName is avaiable so serach for it else do nothing
                    authorName ? {
                        author: {
                            username: {
                                contains: authorName as string,
                                mode: 'insensitive'
                            }
                        }
                    } : {},
                    // if the genere is present do search for it else do nothing
                    genr ? {
                        genre: {
                            contains: genr as string,
                            mode: 'insensitive'
                        }
                    } : {}
                ]
            },
            select: {
                book_id:true,
                title: true,
                genre: true,
                author: {
                    select: {
                        username: true
                    }
                },
                price: true
            },
            skip: (currPage - 1) * 10,
            take: 10
        })
        res.status(200).json({
            status: 200, data: books, message:
                "Books fetched Successfully"
        })
        return
    } catch (err) {
        res.status(500).json({ status: 500, message: "Internal Server Error" })
        console.log(err)
        return
    }
}

// just type interface for Book Extraction
interface bookType {
    title: string,
    genre: string,
    price: number,
    author: {
        username: string
    },
    reviews: {
        rating: number,
        description: string
    }[]
}


/*
    • get Id from params
    • find the book from that id and if found return it else leave it
*/

export const getBookById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const book: any = await prisma.book.findUnique({
            where: {
                book_id: id
            },
            select: {
                title: true,
                author: {
                    select: {
                        username: true
                    }
                },
                price: true,
                genre: true,
                reviews: {
                    select: {
                        review_id: true,
                        rating: true,
                        description: true
                    },
                }
            }
        })

        if (!book) {
            res.status(404).json({ status: 404, message: "Book not found" })
        }
        const total_reviews = book.reviews.length;
        const sumTheReviews = book.reviews.reduce((acc: any, item: any) => { return acc + item.rating }, 0)
        const average = (sumTheReviews / total_reviews).toFixed(2)
        res.status(200).json({
            status: 200,
            data: { book, average },
            message: "Data Fetched Successfully"
        })
    } catch (err) {
        res.status(500).json({ status: 500, message: "Internal Server Error" })
        console.log(err);
        return
    }
}


/*
    • Get page number from query for pagination
    • Find the review whose id match witht he params id which is book id
    • return the result and do add pagincation logic
*/
export const getReviews = async (req: Request, res: Response) => {
    try {
        const { page } = req.query
        let currPage = parseInt(page as string) || 1
        if (currPage == 0) currPage = 1
        const { id } = req.params

        const reviews = await prisma.review.findMany({
            where: {
                book_id: id
            },
            select: {
                review_id: true,
                rating: true,
                description: true
            },
            skip: (currPage - 1) * 10,
            take: 10
        })
        res.status(200).json({
            status: 200,
            data: reviews,
            currPage: currPage,
            message: "Reviews Fetched Successfully"
        })
        return;

    } catch (err) {
        res.status(500).json({ status: 500, message: "Internal Server Error" })
        console.log(err)
        return
    }
}

/*
    • To Submit a review do accept the book id from params and new data from body
    • do some auth work
    • create connection iwth that book and user id with that new review
*/
export const submitReview = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { ratings, description } = req.body
        const token = req.cookies?.auth_for_book;
        if (!token) {
            res.status(401).json({ status: 401, message: "Unauthorized" })
        }
        const decodedToken = jwt.decode(token) as JWT
        try {
            await prisma.review.create({
                data: {
                    book: {
                        connect: {
                            book_id: id
                        }
                    },
                    user: {
                        connect: {
                            user_id: decodedToken.id
                        }
                    },
                    rating: parseInt(ratings as string),
                    description
                }
            })
            res.status(200).json({ status: 200, message: "Thanks for your review" })
            return
        } catch (err: any) {

            // in Prisma there is an error code when we try to add a duplicate record, it throws an error beaucse of the unqiue like that was mentioned in the schema and hence this is a conflict meaning a user already reviewed once hence it will nto granted this time.
            if (err.code == 'P2002') {

                res.status(409).json({ status: 409, message: "User already reviewe dthe Book" })
            } else {
                res.status(500).json({ status: 500, message: "Error while submitting your review" })
            }
            console.log(err)
            return
        }


    } catch (err) {
        res.status(500).json({ status: 500, message: "Internal Server Error" })
        console.log(err)
        return;
    }
}