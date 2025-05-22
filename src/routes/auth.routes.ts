import {Router} from 'express'
import { login, signup } from '../controllers/auth.controller'

const router = Router()

router.route("/login").post(login) // have  apost request to /login and when it reaches to the point call login method and process accorsingly
router.route("/signup").post(signup)

export default router