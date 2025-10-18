import { useContext, useState } from "react"
import { userDataContext } from "../context/UserContext"

function Customize2() {
  const {userData} = useContext(userDataContext)
  const [assistantName, setAssistantName] = useState(userData?. assistantName || "")
  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex justify-center items-center flex-col p-[20px]">
      <h1 className="text-white text-[30px] mb-[40px] text-center">Enter your <span className="text-blue-200">Assistant Name</span></h1>
      <input type="text" placeholder="eg: Jarvis" required className="w-full max-w-[600px] h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]" value={assistantName} onChange={(e)=> setAssistantName(e.target.value)}/>
      {assistantName && <button className="min-w-[300px] h-[60px] mt-[30px] bg-white rounded-full font-semibold text-[19px] cursor-pointer" onClick={() => navigate("/customize2")}>Finally Create Your Assistant</button>}
      
    </div>
  )
}

export default Customize2