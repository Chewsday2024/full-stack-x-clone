import { Router } from 'express'
import { login, logout, signup } from '../controllers/auth.controller'


const router = Router()


router.post('singup', signup)
router.post('login', login)
router.post('logout', logout)



export default router