import { UserType } from "./UserType"

export type CommentType = {
  _id: string
  text: string
  user: UserType
}