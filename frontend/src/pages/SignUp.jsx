import { useContext, useState } from "react"
import bg from "../assets/authBg.png"
import { IoEye } from "react-icons/io5"
import { IoEyeOff } from "react-icons/io5"
import { useNavigate } from "react-router-dom"
import { userDataContext } from "../context/UserContext"
import axios from "axios"
function SignUp() {
  const [showPassword, setShowPassword] = useState(false)
  const { serverUrl } = useContext(userDataContext)
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)
  const handleSignUp = async (e) => {
    e.preventDefault()
    setErr("")
    setLoading(true)
    try {
      let result = await axios.post(`${serverUrl}/api/auth/signup`, { name, email, password }, { withCredentials: true })
      console.log(result)
      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
      setErr(error.response.data.message)
    }
  }
  return (
    <div className="w-full h-[100vh] bg-cover flex justify-center items-center" style={{ backgroundImage: `url(${bg})` }}>
      <form className="w-[90%] h-[600px] max-w-[500px] bg-[#00000062] backdrop-blur shadow-lg shadow-black flex flex-col items-center justify-center gap-[20px] px-[20px]" onSubmit={handleSignUp}>
        <h1 className="text-white text-[30px] font-semibold mb-[30px]">Register to <span className="text-blue-400">Virtual Assistant</span></h1>
        <input type="text" required placeholder="Enter your Name" className="w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="email" required placeholder="Enter your Email" className="w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="w-full h-[60px] outline-none border-white bg-transparent text-white rounded-full text-[18px] relative">
          <input required type={showPassword ? "text" : "password"} placeholder="Enter your Password" className="w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]" value={password} onChange={(e) => setPassword(e.target.value)} />
          {!showPassword && <IoEye className="absolute top-[18px] right-[20px] w-[25px] h-[25px] text-white cursor-pointer" onClick={() => setShowPassword(true)} />}
          {showPassword && <IoEyeOff className="absolute top-[18px] right-[20px] w-[25px] h-[25px] text-white cursor-pointer" onClick={() => setShowPassword(false)} />}
        </div>
        {err.length > 0 && <p className="text-red-500 text-[17px]">*{err}</p>}
        <button className="min-w-[150px] h-[60px] mt-[30px] bg-white rounded-full font-semibold text-[19px]" disabled={loading}>{loading ? "Loading..." : "Sign Up"}</button>
        <p className="text-white">Already have an account? <span className="text-blue-400 text-[18px] cursor-pointer" onClick={() => navigate("/signin")}>Sign In</span></p>
      </form>
    </div>

  )
}

export default SignUp