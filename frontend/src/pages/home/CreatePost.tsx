import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRef, useState } from "react"
import { BsEmojiSmileFill } from 'react-icons/bs'
import { CiImageOn } from "react-icons/ci"
import { IoCloseSharp } from "react-icons/io5"
import toast from "react-hot-toast"
import { UserType } from "../../types/UserType"
import authUserQueryOption from "../../utils/queryoptions/authUserQueryOption"




type createPostPayLoad = {
  text: string,
  img: string | null
}


function CreatePost() {
  const [text, setText] = useState("")
  const [img, setImg] = useState<string | null>(null)
  const imgRef = useRef<HTMLInputElement | null>(null)

  
  
  const { data: authUser } = useQuery<UserType>({ queryKey: ["authUser"], queryFn: authUserQueryOption })
  
  const queryClient = useQueryClient()


  const {
    mutate: createPost,
    isPending,
    isError,
    error,
  } = useMutation<void, Error, createPostPayLoad>({
    mutationFn: async ({ text, img }) => {
      try {
        const res = await fetch('/api/posts/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text, img })
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Something went wrong')
        }

        return data
      } catch (error) {
        if (error && error === 'string') {
          throw new Error(error)
        } else {
          throw error
        }
      }
    },
    onSuccess: () => {
      setText("")
      setImg(null)
      toast.success('Post created successfully')
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    createPost({ text, img })
  };

  const handleImgChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files

    if (files && files[0]) {
      const file = files[0]

      const reader = new FileReader()

      reader.onload = () => {
        setImg(reader.result as string)
      }

      reader.readAsDataURL(file)
    }
  }



  return (
    <div className='flex p-4 items-start gap-4 border-b border-gray-700'>
      <div className='avatar'>
        <div className='w-8 rounded-full'>
          <img src={authUser?.profileImg || "/avatar-placeholder.png"} />
        </div>
      </div>
      
      <form className='flex flex-col gap-2 w-full' onSubmit={handleSubmit}>
        <textarea
          className='textarea w-full p-0 text-lg resize-none border-none focus:outline-none  border-gray-800'
          placeholder='What is happening?!'
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {img && (
          <div className='relative w-72 mx-auto'>
            <IoCloseSharp
              className='absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer'
              onClick={() => {
                setImg(null)

                if (imgRef.current) {
                  imgRef.current.value = '';
                }
              }}
            />

            <img src={img} className='w-full mx-auto h-72 object-contain rounded' />
          </div>
        )}

        <div className='flex justify-between border-t py-2 border-t-gray-700'>
          <div className='flex gap-1 items-center'>
            <CiImageOn
              className='fill-primary w-6 h-6 cursor-pointer'
              onClick={() => imgRef.current?.click()}
            />
            <BsEmojiSmileFill className='fill-primary w-5 h-5 cursor-pointer' />
          </div>

          <input type='file' accept='image/*' hidden ref={imgRef} onChange={handleImgChange} />

          <button className='btn btn-primary rounded-full btn-sm text-white px-4'>
            {isPending ? "Posting..." : "Post"}
          </button>
        </div>

        {isError && <div className='text-red-500'>{error.message}</div>}
      </form>
    </div>
  )
}
export default CreatePost