import {Router} from 'express'
import { login, signup } from '../controllers/auth.controller'

const router = Router()

router.route("/login").post(login)
router.route("/register").post(signup)

export default router