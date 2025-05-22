
import { Request, Response } from 'express'
import { prisma } from '../client'

/*
    • Take Id from params
    • Take the data
    • store the data which is given like whether it is an updated rating or updated review. do stroe it in object
    • update the result with given review id
*/
export const updateReview = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { newRating, newDes } = req.body
        const updatedValues: {
            rating?: number,
            description?: string
        } = {}
        if (newRating != undefined) updatedValues.rating = parseInt(newRating)
        if (newDes != undefined) updatedValues.description = newDes

        await prisma.review.update({
            where: {
                review_id: id
            },
            data: updatedValues
        })

        res.status(204).json({ status: 204, message: "Data Updated Successfully" })
        return;
    } catch (err) {
        res.status(500).json({ status: 500, message: "Internal Server Eroror" })
        console.log(err)
        return;
    }
}

/*
    • Take Id from params
    • Delete the record with given id
*/
export const deleteReview = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        try {
            await prisma.review.delete({
                where: {
                    review_id: id
                }
            })
            res.status(200).json({ status: 200, message: "Data Deleted Successfully" })
            return

        } catch (err: any) {

            // in Prisma when we try to delete a record which does not exists, priisma gives use an error with code P2025 and this can be catch and we can send our repsosne without clashing out code
            if (err.code === 'P2025') {
                res.status(404).json({ status: 404, message: "Not Found" })
            } else {
                res.status(500).json({ status: 500, message: "Data Failed to delete" })
            }
            return
        }
    } catch (err) {
        res.status(500).json({ status: 500, message: "Internal Server Eroror" })
        console.log(err)
        return;
    }
}