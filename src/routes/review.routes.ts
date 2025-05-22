
import {Router} from 'express'
import { authMiddleware } from '../middleware/auth.middleware';
import { deleteReview, updateReview } from '../controllers/review.controller';


const router = Router()

router.route("/:id").put(authMiddleware,updateReview)
router.route("/:id").delete(authMiddleware,deleteReview)

export default router;