import {Routes, Route, Navigate} from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from 'react';
import { Loader } from "lucide-react"


const App =() => {
  const {authUser,checkAuth, isCheckingAuth} = useAuthStore()

  useEffect(() => {
    checkAuth()
  },[checkAuth]);

  console.log({authUser});
  if (isCheckingAuth && !authUser) {
    return <div className='flex justify-center items-center h-screen'>  
      <Loader className="size-10 animate-spin" />
    </div>
  } ;




  return (
   <div>
    <Navbar />
    <Routes>
      <Route path="/" element={authUser ? <HomePage />:<Navigate to ="/login"/>  } />
      <Route path="/signup" element={!authUser ? <SignUpPage/> :<Navigate to="/singup"/>} />
      <Route path="/login" element={!authUser ? <LoginPage />: <Navigate to="/"/>} />
      <Route path="/settins" element={<SettingsPage />} />
      <Route path="/profile" element={authUser ? <ProfilePage />:<Navigate to="/login"/>} />

    </Routes>
   </div>
  )
};
export default App;