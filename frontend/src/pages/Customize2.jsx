import { useContext, useState } from "react"
import { userDataContext } from "../context/UserContext"
import axios from "axios"
import { MdKeyboardBackspace } from "react-icons/md"
import { useNavigate } from "react-router-dom"
function Customize2() {
  const { userData, backendImage, selectedImage, serverUrl, setUserData } = useContext(userDataContext)
  const [assistantName, setAssistantName] = useState(userData?.assistantName || "")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const handleUpdateAssistant = async () => {
    try {
      setLoading(true)
      let formData = new FormData()
      formData.append("assistantName", assistantName)
      if (backendImage) {
        formData.append("assistantImage", backendImage)
      } else {
        formData.append("imageUrl", selectedImage)
      }
      const result = await axios.post(`${serverUrl}/api/user/update`, formData, { withCredentials: true })
      console.log(result.data)
      setUserData(result.data)
      setLoading(false)
      navigate("/")
    } catch (error) {
      console.log(error)
      setLoading(false)

    }
  }
  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex justify-center items-center flex-col p-[20px] relative">
      <MdKeyboardBackspace className="absolute text-white top-[30px] left-[30px] w-[25px] h-[25px] cursor-pointer" onClick={() => navigate("/customize")} />
      <h1 className="text-white text-[30px] mb-[40px] text-center">Enter your <span className="text-blue-200">Assistant Name</span></h1>
      <input type="text" placeholder="eg: Jarvis" required className="w-full max-w-[600px] h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]" value={assistantName} onChange={(e) => setAssistantName(e.target.value)} />
      {assistantName && <button disabled={loading} className="min-w-[300px] h-[60px] mt-[30px] bg-white rounded-full font-semibold text-[19px] cursor-pointer" onClick={() => handleUpdateAssistant()}>{loading ? "Loading..." : "Finally Create Your Assistant"}</button>}

    </div>
  )
}

export default Customize2