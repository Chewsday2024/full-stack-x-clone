export type UserType = {
  _id?: string
  fullName: string
  username: string
  email: string
  bio: string
  link: string
  following?: string[]
  profileImg?: string | null
  coverImg?: string | null
  newPassword: string
  currentPassword: string
}