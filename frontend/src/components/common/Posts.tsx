import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"


import PostSkeleton from "../skeletons/PostSkeleton"
import Post from "./Post"
import { PostType } from "../../types/PostType"
import postsQueryOption from "../../utils/queryoptions/postsQueryOption"



type Props = {
  feedType?: string
  username?: string
  userId?: string
}



function Posts({ feedType, username, userId }: Props) {
  const getPostEndpoint = () => {
    switch (feedType) {
      case "forYou":
        return "/api/posts/all"

      case "following":
        return "/api/posts/following"

      case "posts":
        return `/api/posts/user/${username}`

      case "likes":
        return `/api/posts/likes/${userId}`

      default:
        return "/api/posts/all"
    }
  }

  const POST_ENDPOINT = getPostEndpoint()

  const {
    data: posts,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: () => postsQueryOption(POST_ENDPOINT),
  })


  useEffect(() => {
    refetch();
  }, [feedType, refetch, username])


  return (
		<>
			{(isLoading || isRefetching) && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}

			{!isLoading && !isRefetching && posts?.length === 0 && (
				<p className='text-center my-4'>No posts in this tab. Switch 👻</p>
			)}
      
			{!isLoading && !isRefetching && posts && (
				<div>
					{posts.map((post: PostType) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	)
}
export default Posts