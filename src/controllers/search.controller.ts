
import { Request, Response } from 'express'
import { prisma } from '../client'

/*
    • Have the required details in query
    • Search for any of the true condition if both the fieldsare present then do filter for both that is why AND is used, and instead we have filters

*/
export const findBook = async (req: Request, res: Response) => {
    try {
        const { reqTitle, reqAuthor } = req.query

        const results = await prisma.book.findMany({
            where: {
                AND: [
                    // if reqTitle is avaible do serach with title that contains reqTitle as any context otherwise keep it empty
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