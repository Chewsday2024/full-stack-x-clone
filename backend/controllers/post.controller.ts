import { Request, Response } from "express";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import { v2 as cloudinary } from "cloudinary";
import Notification from "../models/notification.model.js";




export const createPost = async (req: Request, res: Response) => {
  try {
    const { text } = req.body
    let { img } = req.body
    const userId = req.user?._id.toString()

    const user = await User.findById(userId)
    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    if (!text && !img) {
      res.status(400).json({ error: 'Post must have text or image' })
      return
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img)
      img = uploadedResponse.secure_url
    }

    const newPost = new Post({
      user: userId,
      text,
      img
    })


    await newPost.save()

    res.status(201).json(newPost)

  } catch (error: any) {
    console.log('Error in createPost: ', error.message)
    res.status(500).json({ error: 'Internal server error' })
  }
}


export const deletePost = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      res.status(404).json({ error: 'Post not found' })
      return
    }

    if (post.user.toString() !== req.user?._id.toString()) {
      res.status(401).json({ error: 'You are not authorized to delete this post' })
      return
    }

    if (post.img) {
      //   https://res.cloudinary.com/dkcdkuetg/image/upload/v1746019829/lffxlgomov9oslfv2f2d.jpg

      const imgId = post.img.split('/').slice(7).join('/').split('.')[0]

      await cloudinary.uploader.destroy(imgId)
    }

    await Post.findByIdAndDelete(req.params.id)

    res.status(200).json({ message: 'Post deleted successfully' })
  } catch (error: any) {
    console.log('Error in deletePost: ', error.message)
    res.status(500).json({ error: 'Internal server error' })
  }
}


export const commentOnPost = async (req: Request, res: Response) => {
  try {
    const { text } = req.body
    const postId = req.params.id
    const userId = req.user?._id

    if (!text) {
      res.status(400).json({ error: 'Text field is required' })
      return
    }

    const post = await Post.findById(postId)
    if (!post) {
      res.status(404).json({ error: 'Post not found' })
      return
    }

    const comment = {user: userId, text}

    post.comments.push(comment)

    await post.save()

    res.status(200).json(post)

    
  } catch (error: any) {
    console.log('Error in commentOnPost: ', error.message)
    res.status(500).json({ error: 'Internal server error' })
  }
}


export const likeUnlikePost = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id 
    const { id: postId } = req.params

    const post = await Post.findById(postId)

    if (!post) {
      res.status(404).json({ error: 'Post not found' })
      return
    }

    const userLikedPost = post.likes.includes(userId!)

    if (userLikedPost) {
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } })
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } })

      const updatedLikes = post.likes.filter( id => id.toString() !== userId?.toString())

      res.status(200).json(updatedLikes)
    } else {
      post.likes.push(userId!)
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } })
      await post.save()

      const notification = new Notification({
        from: userId,
        to: post.user,
        type: 'like'
      })

      await notification.save()

      const updatedLikes = post.likes

      res.status(200).json(updatedLikes)
    }
  } catch (error: any) {
    console.log('Error in likeUnlikePost: ', error.message)
    res.status(500).json({ error: 'Internal server error' })
  }
}


export const getLikedPosts = async (req: Request, res: Response) => {
  const userId = req.params.id

  try {
    const user = await User.findById(userId)
    console.log(user)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate({
        path: 'user',
        select: '-password'
      })
      .populate({
        path: 'comments.user',
        select: '-password'
      })

      res.status(200).json(likedPosts)
  } catch (error: any) {
    console.log('Error in getLikedPosts: ', error.message)
    res.status(500).json({ error: 'Internal server error' })
  }
}


export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await Post.find().sort({ createAt: -1 })
      .populate({
        path: 'user',
        select: '-password'
      })
      .populate({
        path: 'comments.user',
        select: '-password'
      })

    if (posts.length === 0) {
      res.status(200).json([])
      return
    }

    res.status(200).json(posts)
  } catch (error: any) {
    console.log('Error in getAllPosts: ', error.message)
    res.status(500).json({ error: 'Internal server error' })
  }
}


export const getFollowingPosts = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id
    const user = await User.findById(userId)

    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const following = user.following

    const feedPosts = await Post.find({ user: { $in: following } }).sort({ createdAt: -1 })
      .populate({
        path: 'user',
        select: '-password'
      })
      .populate({
        path: 'comments.user',
        select: '-password'
      })

      res.status(200).json(feedPosts)
  } catch (error: any) {
    console.log('Error in getFollowingPosts: ', error.message)
    res.status(500).json({ error: 'Internal server error' })
  }
}


export const getUserPosts = async (req: Request, res: Response) => {
  try {
    const { username } = req.params
    const user = await User.findOne({ username })

    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const posts = await Post.find({ user: user._id }).sort()
      .populate({
        path: 'user',
        select: '-password'
      })
      .populate({
        path: 'comments.user',
        select: '-password'
      })

    res.status(200).json(posts)
  } catch (error: any) {
    console.log('Error in getUserPosts: ', error.message)
    res.status(500).json({ error: 'Internal server error' })
  }
}