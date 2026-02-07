import { useContext, useRef, useState } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from "react-router-dom"
import axios from 'axios'
import { useEffect } from 'react'
import userImg from "../../public/user.gif"
import aiImg from "../../public/ai.gif"
function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext)
  const navigate = useNavigate()
  const [listening, setListening] = useState(false)
  const [userText, setUserText] = useState("")
  const [aiText, setAiText] = useState("")
  const isSpeakingRef = useRef(false)
  const recognitionRef = useRef(null)
  const synth = window.speechSynthesis
  const lastCommandTime = useRef(0);
  const handleLogOut = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true })
      setUserData(null)
      navigate("/signin")
    } catch (error) {
      console.log(error)
    }
  }


  const startRecognition = () => {
    try {
      recognitionRef.current?.start();
      setListening(true)

    } catch (error) {
      if (!error.message.includes("start")) {
        console.log("Recognition error : ", error)
      }
    }
  }

  const speak = (text) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'hi-IN';
    const voices = window.speechSynthesis.getVoices()
    const hindiVoice = voices.find(v => v.lang === 'hi-IN');
    if (hindiVoice) {
      utterance.voice = hindiVoice;
    }
    isSpeakingRef.current = true
    utterance.onend = () => {
      isSpeakingRef.current = false;
      startRecognition()
    };
    synth.speak(utterance)
  }


  const handleCommand = (data) => {
    if (!data) {
      console.error("No data received from assistant");
      return;
    }
    const { type, userInput, response } = data
    speak(response)

    if (type === 'google-search') {
      const query = encodeURIComponent(userInput)
      window.open(`https://www.google.com/search?q=${query}`, '_blank')
    }

    if (type === 'youtube-search') {
      const query = encodeURIComponent(userInput)
      window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank')
    }

    if (type === 'youtube-play') {
      const query = encodeURIComponent(userInput)
      window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank')
    }

    if (type === 'calculator-open') {
      window.open(`https://www.google.com/search?q=calculator`, '_blank')
    }

    if (type === 'instagram-open') {
      window.open(`https://www.instagram.com/`, '_blank')
    }

    if (type === 'facebook-open') {
      window.open(`https://www.facebook.com/`, '_blank')
    }

    if (type === 'whatsapp-open') {
      window.open(`https://www.whatsapp.com/`, '_blank')
    }

    if (type === 'weather-show') {
      const query = encodeURIComponent(userInput || 'current weather')
      window.open(`https://www.google.com/search?q=${query}`, '_blank')
    }

  }




  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.lang = 'en-US'

    recognitionRef.current = recognition
    const isrecognizingRef = { current: false }
    const safeRecognition = () => {
      if (!isSpeakingRef.current && !isrecognizingRef.current) {
        try {
          recognition.start()
        } catch (error) {
          if (error.name !== "InvalidStateError") {
            console.log("start error:", error)
          }
        }
      }
    }

    recognition.onstart = () => {
      isrecognizingRef.current = true
      setListening(true)
    }

    recognition.onend = () => {
      isrecognizingRef.current = false
      setListening(false)
    }

    if (!isSpeakingRef.current) {
      setTimeout(() => {
        safeRecognition()
      }, 1000)
    }



    recognition.onerror = (event) => {
      console.warn("Recognition error : ", event.error)
      isrecognizingRef.current = false
      setListening(false)
      if (event.error !== "aborted" && !isSpeakingRef.current) {
        setTimeout(() => {
          safeRecognition()
        }, 1000)
      }
    }


    recognition.onresult = async (e) => {
      if (!userData || !userData.assistantName) return;

      const transcript = e.results[e.results.length - 1][0].transcript.trim();
      console.log("command : ", transcript);

      if (transcript.toLowerCase().includes(userData.assistantName.toLowerCase())) {
        setAiText("")
        setUserText(transcript)
        const now = Date.now();
        if (now - lastCommandTime.current < 3000) return;
        lastCommandTime.current = now;

        recognition.stop();
        isrecognizingRef.current = false;
        setListening(false);

        const data = await getGeminiResponse(transcript);
        console.log("Gemini returned: ", data);

        handleCommand(data);
        setAiText(data.response)
        setUserText("")
      }
    };

    const fallback = setInterval(() => {
      if (!isSpeakingRef.current && !isrecognizingRef.current) {
        safeRecognition()
      }
    }, 10000)
    safeRecognition()
    return () => {
      recognition.stop()
      setListening(false)
      isrecognizingRef.current = false
      clearInterval(fallback)
    }

  }, [])

  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-[black] to-[#02023d] flex justify-center items-center flex-col gap-[15px]">
      <button className="min-w-[150px] h-[60px] mt-[30px] text-black bg-white absolute rounded-full font-semibold text-[19px] top-[20px] right-[20px] cursor-pointer" onClick={() => handleLogOut()}>Log Out</button>
      <button className="min-w-[150px] h-[60px] mt-[30px] text-black bg-white absolute rounded-full font-semibold text-[19px] top-[100px] right-[20px] px-[20px] py-[10px] cursor-pointer" onClick={() => navigate("/customize")}>Customize Your Assistant</button>

      <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg'>
        <img src={userData?.assistantImage} alt="" className='h-full object-cover' />
      </div>
      <h1 className='text-white text-[18px] font-semibold'>Welcome {userData?.name ? userData.name.charAt(0).toUpperCase() + userData.name.slice(1) : ''} , I'm {userData?.assistantName}</h1>
      {aiText && <img src={aiImg} alt="" className='w-[200px]'/>}
      {!aiText && <img src={userImg} alt="" className='w-[200px]'/>}
    </div>
  )
}

export default Home