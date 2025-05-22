
import { Request, Response } from 'express'
import { prisma } from '../client'

export const findBook = async (req: Request, res: Response) => {
    try {
        const { reqTitle, reqAuthor } = req.query

        const results = await prisma.book.findMany({
            where: {
                AND: [
                    reqTitle ? {
                        title: {
                            contains: reqTitle as string,
                            mode: 'insensitive'
                        }
                    } : {},
                    reqAuthor ? {
                        author: {
                            contains: reqAuthor as string,
                            mode: 'insensitive'
                        }
                    } : {}
                ]
            },
            select: {
                book_id: true,
                title: true,
                genre: true,
                price: true,
            }
        })
        res.status(200).json({ status: 200, data: results, message: "Data Fetched Successfully" })
        return
    } catch (err) {
        res.status(500).json({ status: 500, message: "Internal Server Error" })
        console.log(err);
        return
    }
}