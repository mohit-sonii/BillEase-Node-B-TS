import { Router } from "express";
import {findBook} from "../controllers/search.controller"

const router = Router()

router.route("/").get(findBook)

export default router