import { Request, Response } from "express";
import User from "../models/user.model";
import Notification from "../models/notification.model";
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
    return
  }
}