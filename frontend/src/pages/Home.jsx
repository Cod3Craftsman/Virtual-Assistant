import { useContext } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from "react-router-dom"
import axios from 'axios'
function Home() {
  const { userData, serverUrl, setUserData } = useContext(userDataContext)
  const navigate = useNavigate()
  const handleLogOut = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true })
      setUserData(null)
      navigate("/signin")
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-[black] to-[#02023d] flex justify-center items-center flex-col gap-[15px]">
      <button className="min-w-[150px] h-[60px] mt-[30px] text-black bg-white absolute rounded-full font-semibold text-[19px] top-[20px] right-[20px] cursor-pointer" onClick={() => handleLogOut()}>Log Out</button>
      <button className="min-w-[150px] h-[60px] mt-[30px] text-black bg-white absolute rounded-full font-semibold text-[19px] top-[100px] right-[20px] px-[20px] py-[10px] cursor-pointer" onClick={() => navigate("/customize")}>Customize Your Assistant</button>

      <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg'>
        <img src={userData?.assistantImage} alt="" className='h-full object-cover' />
      </div>
      <h1 className='text-white text-[18px] font-semibold'>Welcome {userData?.name ? userData.name.charAt(0).toUpperCase() + userData.name.slice(1) : ''} , I'm {userData?.assistantName}</h1>

    </div>
  )
}

export default Home