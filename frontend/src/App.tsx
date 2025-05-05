import { Route, Routes } from "react-router-dom"


import NotificationPage from "./pages/notification/NotificationPage"
import SignUpPage from "./pages/auth/signup/SignUpPage"
import ProfilePage from "./pages/profile/ProfilePage"
import LoginPage from "./pages/auth/login/LoginPage"
import HomePage from "./pages/home/HomePage"

import RightPanel from "./components/common/RightPanel"
import Sidebar from "./components/common/Sidebar"


function App() {
  

  return (
    <div className="flex max-w-7xl mx-auto">
      <Sidebar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
      </Routes>

      <RightPanel />
    </div>
  )
}

export default App
