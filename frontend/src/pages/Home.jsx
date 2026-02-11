import { useContext, useRef, useState, useEffect } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from "react-router-dom"
import axios from 'axios'
import userImg from "/user.gif"
import aiImg from "/ai.gif"
import { CgMenuRight } from "react-icons/cg"
import { RxCross1 } from "react-icons/rx"

function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext)
  const navigate = useNavigate()
  const [listening, setListening] = useState(false)
  const [ham, setHam] = useState(false)
  const [userText, setUserText] = useState("")
  const [aiText, setAiText] = useState("")
  const isSpeakingRef = useRef(false)
  const recognitionRef = useRef(null)
  const isrecognizingRef = useRef(false)
  const synth = window.speechSynthesis
  const lastCommandTime = useRef(0);

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true })
      setUserData(null)
      navigate("/signin")
    } catch (error) {
      console.log(error)
    }
  }

  const startRecognition = () => {
    if (!isSpeakingRef.current && !isrecognizingRef.current) {
      try {
        recognitionRef.current?.start();
        setListening(true)
      }
      catch (error) {
        if (!error.message.includes("start")) {
          console.log("Recognition error : ", error)
        }
      }
    }
  }

  // ✅ Minimal fix: added safeRecognition
  const safeRecognition = () => {
    if (recognitionRef.current && !isSpeakingRef.current && !isrecognizingRef.current) {
      try {
        recognitionRef.current.start()
      } catch (error) {
        if (error.name !== "InvalidStateError") {
          console.log("safeRecognition error:", error)
        }
      }
    }
  }

  const speak = (text) => {
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';

    let voices = window.speechSynthesis.getVoices()
    const hindiVoice = voices.find(v => v.lang === 'hi-IN');
    if (hindiVoice) {
      utterance.voice = hindiVoice;
    }

    isSpeakingRef.current = true;

    utterance.onend = () => {
      setAiText("");
      isSpeakingRef.current = false;
      setTimeout(() => {
        startRecognition();
      }, 800);
    };

    synth.cancel();
    synth.speak(utterance);
  };

  const handleCommand = (data) => {
    if (!data || !data.response) {
      console.error("No data received from assistant");
      return;
    }
    const { type, userInput, response } = data
    speak(response)

    if (type === 'google-search') window.open(`https://www.google.com/search?q=${encodeURIComponent(userInput)}`, '_blank')
    if (type === 'youtube-search' || type === 'youtube-play') window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(userInput)}`, '_blank')
    if (type === 'calculator-open') window.open(`https://www.google.com/search?q=calculator`, '_blank')
    if (type === 'instagram-open') window.open(`https://www.instagram.com/`, '_blank')
    if (type === 'facebook-open') window.open(`https://www.facebook.com/`, '_blank')
    if (type === 'whatsapp-open') window.open(`https://www.whatsapp.com/`, '_blank')
    if (type === 'weather-show') window.open(`https://www.google.com/search?q=${encodeURIComponent(userInput || 'current weather')}`, '_blank')
  }

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.lang = 'en-US'
    recognition.interimResults = false;
    recognitionRef.current = recognition
    let isMounted = true;

    const startTimeout = setTimeout(() => {
      if (isMounted && !isSpeakingRef.current && !isrecognizingRef.current) {
        try {
          recognition.start()
          console.log("Recognition requested to start")
        } catch (error) {
          if (error.name !== "InvalidStateError") console.log("start error:", error)
        }
      }
    }, 1000)

    recognition.onstart = () => {
      isrecognizingRef.current = true
      setListening(true)
    }

    recognition.onend = () => {
      isrecognizingRef.current = false
      setListening(false)
      if (isMounted && !isSpeakingRef.current) {
        setTimeout(() => {
          if (isMounted) safeRecognition()
        }, 1000)
      }
    }

    recognition.onerror = (event) => {
      console.warn("Recognition error : ", event.error)
      isrecognizingRef.current = false
      setListening(false)
      if (event.error !== "aborted" && isMounted && !isSpeakingRef.current) {
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
      if (!isSpeakingRef.current && !isrecognizingRef.current) safeRecognition()
    }, 10000)
    safeRecognition()

    return () => {
      isMounted = false
      recognition.stop()
      setListening(false)
      isrecognizingRef.current = false
      clearInterval(fallback)
    }

  }, [])

  return (
    <div className="w-full bg-gradient-to-t from-black to-[#02023d] flex flex-col items-center gap-[15px] pt-[60px] lg:pt-0 lg:justify-center relative overflow-y-auto">
      {/* Mobile menu icon */}
      <CgMenuRight
        className='lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px] cursor-pointer'
        onClick={() => setHam(true)}
      />

      {/* Mobile menu */}
      <div
        className={`absolute top-0 w-full h-full bg-[#00000053] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start ${ham ? "translate-x-0" : "translate-x-full"
          } transition-transform lg:hidden`}
      >
        <RxCross1
          className='text-white absolute top-[20px] right-[20px] w-[25px] h-[25px] cursor-pointer'
          onClick={() => setHam(false)}
        />

        <button
          className="min-w-[150px] h-[60px] text-black bg-white rounded-full font-semibold text-[19px]"
          onClick={handleLogOut}
        >
          Log Out
        </button>

        <button
          className="min-w-[150px] h-[60px] text-black bg-white rounded-full font-semibold text-[19px] px-[20px]"
          onClick={() => navigate("/customize")}
        >
          Customize Your Assistant
        </button>

        <div className='w-full h-[2px] bg-gray-400'></div>
        <h1 className='text-white font-semibold text-[19px]'>History</h1>

        <div className='w-full h-[400px] overflow-y-auto flex flex-col gap-[20px]'>
          {userData.history?.map((his, index) => (
            <span key={index} className='text-gray-200 text-[18px]'>
              {his}
            </span>
          ))}
        </div>
      </div>

      {/* Desktop buttons */}
      <button
        className="min-w-[150px] h-[60px] text-black bg-white absolute rounded-full font-semibold text-[19px] top-[20px] right-[20px] hidden lg:block"
        onClick={handleLogOut}
      >
        Log Out
      </button>

      <button
        className="min-w-[150px] h-[60px] text-black bg-white absolute rounded-full font-semibold text-[19px] top-[100px] right-[20px] px-[20px] hidden lg:block"
        onClick={() => navigate("/customize")}
      >
        Customize Your Assistant
      </button>

      {/* Assistant image (responsive height) */}
      <div className='w-[260px] h-[320px] sm:w-[300px] sm:h-[400px] flex justify-center items-center overflow-hidden rounded-3xl shadow-lg'>
        <img
          src={userData?.assistantImage}
          alt=""
          className='h-full object-cover'
        />
      </div>

      {/* Welcome text */}
      <h1 className='text-white text-[18px] font-semibold text-center px-4'>
        Welcome {userData?.name
          ? userData.name.charAt(0).toUpperCase() + userData.name.slice(1)
          : ""}{" "}
        , I'm {userData?.assistantName}
      </h1>

      {/* GIF */}
      {aiText && <img src={aiImg} alt="" className='w-[160px] sm:w-[200px]' />}
      {!aiText && <img src={userImg} alt="" className='w-[160px] sm:w-[200px]' />}

      {/* Command text */}
      <div className="w-[90%] max-w-[500px] min-h-[60px] flex items-center justify-center text-center px-4">
        <p className="text-white font-semibold text-[18px] break-words">
          {userText ? userText : aiText ? aiText : ""}
        </p>
      </div>
    </div>
  )
}

export default Home
