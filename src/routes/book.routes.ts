
import { Router } from "express";
import { addBook, getBookById ,getReviews,submitReview} from "../controllers/books.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router()

router.route("/").post(authMiddleware,addBook)
router.route("/:id").get(authMiddleware,getBookById)
router.route("/:id/review").get(authMiddleware,getReviews)
router.route("/:id/review").post(authMiddleware,submitReview)

export default router