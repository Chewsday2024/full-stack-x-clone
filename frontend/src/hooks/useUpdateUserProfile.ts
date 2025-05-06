import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"



import { UserType } from "../types/UserType"



function useUpdateUserProfile() {
  const queryClient = useQueryClient()

  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useMutation<void, Error, UserType | { coverImg: string | ArrayBuffer | null, profileImg: string | ArrayBuffer | null }>({
    mutationFn: async ( formData ) => {
      try {
        const res = await fetch(`/api/users/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify( formData )
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
      toast.success('Profile updated successfully')

      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['authUser'] }),
        queryClient.invalidateQueries({ queryKey: ['userProfile'] })
      ])
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })


  return { updateProfile, isUpdatingProfile }
}


export default useUpdateUserProfile