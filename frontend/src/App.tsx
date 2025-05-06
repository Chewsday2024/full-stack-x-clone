import { Navigate, Route, Routes } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Toaster } from "react-hot-toast"


import NotificationPage from "./pages/notification/NotificationPage"
import SignUpPage from "./pages/auth/signup/SignUpPage"
import ProfilePage from "./pages/profile/ProfilePage"
import LoginPage from "./pages/auth/login/LoginPage"
import HomePage from "./pages/home/HomePage"

import RightPanel from "./components/common/RightPanel"
import Sidebar from "./components/common/Sidebar"

import LoadingSpinner from "./components/common/LoadingSpinner"
import { UserType } from "./types/UserType"
import authUserQueryOption from "./utils/queryoptions/authUserQueryOption"

function App() {
  const { data: authUser, isLoading } = useQuery<UserType>({
    queryKey: ['authUser'],
    queryFn: authUserQueryOption,
    retry: false
  })


  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size='lg' />
      </div>
    )
  }

  return (
    <div className="flex max-w-7xl mx-auto">
      {authUser && <Sidebar />}

      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to='/login' />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to='/' />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to='/' />} />
        <Route path="/notifications" element={authUser ? <NotificationPage /> : <Navigate to='/login' />} />
        <Route path="/profile/:username" element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
      </Routes>

      {authUser && <RightPanel />}

      <Toaster />
    </div>
  )
}

export default App
