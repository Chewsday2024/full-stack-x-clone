import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'
import User from "../models/user.model.js";
import { JwtToken } from "../types/jsonwebtoken/type.js";




export const protectRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.jwt

    if (!token) {
      res.status(401).json({ error: 'Unauthorized: No Token Provided' })
      return
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtToken

    if (!decoded) {
      res.status(401).json({ error: 'Unauthorized: Invalid Token' })
      return
    }

    const user = await User.findById(decoded.userId).select('-password')

    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    req.user= user

    next()
  } catch (error: any) {
    console.log('Error in protectRoute middleware: ', error.message)
    res.status(500).json({ error: 'Internal Server Error' })
    return
  }
}