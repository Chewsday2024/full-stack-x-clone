import { CommentType } from "./CommentType"
import { UserType } from "./UserType"

export type PostType = {
  _id: string
  user: UserType
  text: string
  img: string
  likes: [
    _id: string,
    user: UserType
  ]
  comments: CommentType[]
  createdAt: Date
}