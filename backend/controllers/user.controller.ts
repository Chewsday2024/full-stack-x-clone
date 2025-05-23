import { Request, Response } from "express";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import bcrypt from 'bcryptjs'
import { v2 as cloudinary } from "cloudinary";
// import mongoose from "mongoose";



export const getUserProfile = async (req: Request, res: Response) => {
  const { username } = req.params

  try {
    const user = await User.findOne({ username }).select('-password')
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    res.status(200).json(user)
  } catch (error: any) {
    console.log('Error in getUserProfile: ', error.message)
    res.status(500).json({ error: error.message })
    return
  }
}


export const followUnfollowUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const userToModify = await User.findById(id)

    const currentUser = await User.findById(req.user?._id)

    if (id === req.user?._id.toString()) {
      res.status(400).json({ error: "You can't follow/unfollow yourself" })
      return
    }

    if (!userToModify || !currentUser) {
      res.status(400).json({ error: 'User not found' })
      return
    }

    // const followedId = new mongoose.Types.ObjectId(id)

    const isFollowing = currentUser.following.map(id => id.toString()).includes(id)

    if (isFollowing) {
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user?._id } })
      await User.findByIdAndUpdate(req.user?._id, { $pull: { following: id } })


      res.status(200).json({ message: 'User unfollowed successfully' })
    } else {
      await User.findByIdAndUpdate(id, { $push: { followers: req.user?._id } })
      await User.findByIdAndUpdate(req.user?._id, { $push: { following: id } })

      const newNotification = new Notification({
        type: 'follow',
        from: req.user?._id,
        to: userToModify._id
      })

      await newNotification.save()

      res.status(200).json({ message: 'User followed successfully' })
    }

  } catch (error: any) {
    console.log('Error in followUnfollowUser: ', error.message)

    res.status(500).json({ error: error.message })
  }
}


export const getSuggestedUsers = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id

    const usersFollowedByMe = await User.findById(userId).select('following')

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId }
        }
      },
      {$sample: { size: 10 }}
    ])

    const filteredUsers = users.filter( user => !usersFollowedByMe?.following.includes(user._id))
    const suggestedUsers = filteredUsers.slice(0, 4)

    suggestedUsers.forEach( user => user.password = null)

    res.status(200).json(suggestedUsers)
  } catch (error: any) {
    console.log('Error in getSuggestedUsers: ', error.message)
    res.status(500).json({ error: error.message })
    return
  }
}


export const updateUser = async (req: Request, res: Response) => {
  const { fullName, email, username, password, bio, link, newPassword } = req.body
  let { profileImg, coverImg } = req.body

  const userId = req.user?._id

  try {
    let user = await User.findById(userId)

    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    if ((!newPassword && password) || (!password && newPassword)) {
      res.status(400).json({ error: 'Please provide both current password and new password' })
      return
    }

    if (password && newPassword) {
      const isMatch = await bcrypt.compare(password, user.password)

      if (!isMatch) {
        res.status(400).json({ error: 'Current password is incorrect' })
        return
      }

      if (newPassword.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters long' })
        return
      }


      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(newPassword, salt)
    }

    if (profileImg) {
      if (user.profileImg) {
        //  https://res.cloudinary.com/dkcdkuetg/image/upload/v1746019829/lffxlgomov9oslfv2f2d.jpg

        await cloudinary.uploader.destroy(user.profileImg.split('/').slice(7).join('/').split('.')[0])
      }

      const uploadedResponse = await cloudinary.uploader.upload(profileImg)

      profileImg = uploadedResponse.secure_url
    }


    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(user.coverImg.split('/').slice(7).join('/').split('.')[0])
      }

      const uploadedResponse = await cloudinary.uploader.upload(coverImg)

      coverImg = uploadedResponse.secure_url
    }


    user.fullName = fullName || user.fullName
    user.email = email || user.email
    user.username = username || user.username
    user.bio = bio || user.bio
    user.link = link || user.link
    user.profileImg = profileImg || user.profileImg
    user.coverImg = coverImg || user.coverImg

    user = await user.save()

    user.password = ''

    res.status(200).json(user)
    return
  } catch (error: any) {
    console.log('Error in updateUser: ', error.message)
    res.status(500).json({ error: error.message })
    return
  }
}