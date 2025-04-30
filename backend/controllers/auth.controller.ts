import { Request, Response } from "express";
import bcrypt from 'bcryptjs'
import User, { mongoUserType } from "../models/user.model";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken";




export const signup = async (req: Request, res: Response) => {
  try {
    const { fullName, username, email, password }: mongoUserType = req.body

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' })
      return
    }

    const existingUser = await User.findOne({ username })
    if (existingUser) {
      res.status(400).json({ error: 'Username is already taken' })
      return
    }

    const existingEmail = await User.findOne({ email })
    if (existingEmail) {
      res.status(400).json({ error: 'Email is already taken' })
      return
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 charaters long' })
      return
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new User({
      fullName,
      username,
      email,
      password: hashedPassword
    })

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res)
      await newUser.save()

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg
      })
    } else {
      res.status(400).json({ error: 'Invalid user data' })
    }
  } catch (error: any) {
    console.log('Error in signup controller: ', error.message)
    res.status(500).json({ error: 'Internal Server Error' })
    return
  }
}



export const login = async (req: Request, res: Response) => {
  try {
    const { username, password }: mongoUserType = req.body
    const user = await User.findOne({ username })
    const isPasswordCorrect = await bcrypt.compare( password, user?.password || '')

    if (!user || !isPasswordCorrect) {
      res.status(400).json({ error: 'Invalid username or password' })
      return
    }

    generateTokenAndSetCookie(user._id, res)

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.coverImg
    })

  } catch (error: any) {
    console.log('Error in login controller: ', error.message)
    res.status(500).json({ error: 'Internal Server Error' })
    return
  }
}



export const logout = async (req: Request, res: Response) => {
  try {
    res.cookie('jwt', '', { maxAge: 0 })
    res.status(200).json({ message: 'Logged out successfully' })
  } catch (error: any) {
    console.log('Error in logout controller: ', error.message)
    res.status(500).json({ error: 'Internal Server Error' })
    return
  }
}



export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).select('-password')

    res.status(200).json(user)
  } catch (error: any) {
    console.log('Error in getMe controller: ', error.message)
    res.status(500).json({ error: 'Internal Server Error' })
    return
  }
}