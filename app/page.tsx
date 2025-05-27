'use client'

import React, { useState, useEffect, useRef } from 'react'
import Script from 'next/script'
import { 
  Phone, DollarSign, Clock, Check, AlertCircle, Shield, 
  Building2, Calculator, ChevronRight, CreditCard, Lock, 
  Star, Award, MessageSquare, Calendar, Video, Users,
  TrendingUp, Zap, Bot, Headphones, BarChart3, Target,
  Sparkles, Trophy, FileText, Send, Eye, Brain,
  CheckCircle, X, Mic, MicOff, Download, ExternalLink,
  Gift, Rocket, Heart, ThumbsUp, Bell, ArrowRight
} from 'lucide-react'

// Configuration
const CONFIG = {
  SPOTS_TAKEN: 3,
  SPOTS_TOTAL: 5,
  LIVE_UPDATE_INTERVAL: 30000,
  COUNTDOWN_HOURS: 48,
  HEYGEN_VIDEO_ID: '7d66ab95a1c04a57817a97d426cb9303',
  STRIPE_LINK: 'https://buy.stripe.com/test_00g7uM5XI1Rn9uJg3R6c007',
  CALENDLY_URL: 'https://calendly.com/autoscaleai/decouverte',
  AI_AGENT_SOPHIE: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_SOPHIE || '',
  AI_AGENT_OUTBOUND: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_OUTBOUND || '',
  AI_AGENT_CLOSER: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_CLOSER || '',
  AI_PHONE: process.env.TWILIO_PHONE_NUMBER || '(438) 900-4385',
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
}

// Stats principales
const KILLER_STATS = {
  harvard: { value: "21X", desc: "plus de chances après 1 minute" },
  missedCalls: { value: "62%", desc: "des appels non répondus" },
  neverCallback: { value: "85%", desc: "ne rappellent JAMAIS" },
  lossPerCall: { value: "1,200$", desc: "perdu PAR appel (services)" },
  weekendMissed: { value: "40%+", desc: "d'appels manqués la fin de semaine" },
  phoneConversion: { value: "10-15X", desc: "meilleur que les leads web" },
  industryMissed: { value: "27%", desc: "d'appels manqués (taillage)" },
  preferPhone: { value: "65%", desc: "préfèrent appeler" },
}

// Types
interface UserData {
  name: string
  phone: string
  email: string
  company: string
  missedCalls: number
  avgPrice: number
  dailyLoss: number
  weeklyLoss: number
  monthlyLoss: number
  yearlyLoss: number
  fiveYearLoss: number
  currentSolution: string
  urgency: string
  budget: string
  decisionMaker: boolean
  nepqScore: number
  stage: string
  leadId?: string
  sessionId: string
}

interface StageProps {
  navigateToStage: (stage: string) => void
  userData: UserData
  setUserData: (data: any) => void
  trackEvent: (event: string, value?: any, data?: any) => void
  liveStats?: any
  countdown?: any
  chatMessages?: any[]
  setChatMessages?: (messages: any[]) => void
  aiTyping?: boolean
  setAiTyping?: (typing: boolean) => void
  sendSMS?: (message: string, to?: string) => Promise<any>
}

// Widget ElevenLabs déclaration
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        'agent-id': string;
      }, HTMLElement>;
    }
  }
}

export default function Home() {
  // État principal
  const [currentStage, setCurrentStage] = useState('landing')
  const [userData, setUserData] = useState<UserData>({
    name: '',
    phone: '',
    email: '',
    company: '',
    missedCalls: 4,
    avgPrice: 600,
    dailyLoss: 0,
    weeklyLoss: 0,
    monthlyLoss: 0,
    yearlyLoss: 0,
    fiveYearLoss: 0,
    currentSolution: '',
    urgency: '',
    budget: '',
    decisionMaker: true,
    nepqScore: 0,
    stage: 'landing',
    sessionId: generateSessionId()
  })

  // États UI
  const [liveStats, setLiveStats] = useState({
    activeVisitors: 47,
    callsAnswered: 12847,
    moneySaved: 3248000,
    lastSignup: '2 minutes'
  })
  const [countdown, setCountdown] = useState(CONFIG.COUNTDOWN_HOURS * 3600)
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [aiTyping, setAiTyping] = useState(false)

  // Génération de session ID
  function generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Tracking des événements
  const trackEvent = async (event: string, value?: any, data?: any) => {
    console.log('📊 Event:', event, value, data)
    
    // Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, {
        value: value,
        ...data
      })
    }
    
    // Facebook Pixel
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', event, {
        value: value,
        currency: 'CAD',
        ...data
      })
    }
    
    // Analytics custom via API
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          value,
          stage: currentStage,
          userData: {
            name: userData.name,
            weeklyLoss: userData.weeklyLoss,
            nepqScore: userData.nepqScore
          },
          sessionId: userData.sessionId,
          timestamp: new Date().toISOString()
        })
      })
    } catch (error) {
      console.error('Analytics error:', error)
    }
  }

  // Navigation entre stages
  const navigateToStage = (stage: string) => {
    setCurrentStage(stage)
    setUserData({ ...userData, stage })
    trackEvent('stage_transition', 1, { from: currentStage, to: stage })
    window.scrollTo(0, 0)
  }

  // Calcul des pertes
  const calculateLosses = (missedCalls: number, avgPrice: number) => {
    const conversionRate = 0.3 // 30% réaliste
    const dailyLoss = Math.round((missedCalls / 5) * avgPrice * conversionRate)
    const weeklyLoss = Math.round(missedCalls * avgPrice * conversionRate)
    const monthlyLoss = Math.round(weeklyLoss * 4.33)
    const yearlyLoss = Math.round(weeklyLoss * 52)
    const fiveYearLoss = yearlyLoss * 5
    
    return { dailyLoss, weeklyLoss, monthlyLoss, yearlyLoss, fiveYearLoss }
  }

  // Envoi SMS
  const sendSMS = async (message: string, to?: string) => {
    try {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: to || userData.phone,
          message
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('📱 SMS sent:', result)
        return result
      }
    } catch (error) {
      console.error('SMS error:', error)
    }
    return null
  }

  // Effets
  useEffect(() => {
    trackEvent('page_view_landing')
    
    // Mise à jour des stats live
    const statsInterval = setInterval(() => {
      setLiveStats(prev => ({
        activeVisitors: prev.activeVisitors + Math.floor(Math.random() * 10 - 5),
        callsAnswered: prev.callsAnswered + Math.floor(Math.random() * 50),
        moneySaved: prev.moneySaved + Math.floor(Math.random() * 10000),
        lastSignup: `${Math.floor(Math.random() * 10 + 1)} minutes`
      }))
    }, CONFIG.LIVE_UPDATE_INTERVAL)
    
    // Countdown
    const countdownInterval = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1))
    }, 1000)
    
    return () => {
      clearInterval(statsInterval)
      clearInterval(countdownInterval)
    }
  }, [])

  // Mise à jour des pertes quand les paramètres changent
  useEffect(() => {
    const losses = calculateLosses(userData.missedCalls, userData.avgPrice)
    setUserData(prev => ({ ...prev, ...losses }))
  }, [userData.missedCalls, userData.avgPrice])

  // Rendu des stages
  const renderStage = () => {
    const stageProps: StageProps = {
      navigateToStage,
      userData,
      setUserData,
      trackEvent,
      liveStats,
      countdown,
      chatMessages,
      setChatMessages,
      aiTyping,
      setAiTyping,
      sendSMS
    }

    switch (currentStage) {
      case 'landing':
        return <LandingStage {...stageProps} />
      case 'ai-qualification':
        return <AIQualificationStage {...stageProps} />
      case 'deep-calculator':
        return <DeepCalculatorStage {...stageProps} />
      case 'proof-demo':
        return <ProofDemoStage {...stageProps} />
      case 'offer-contract':
        return <OfferContractStage {...stageProps} />
      case 'payment':
        return <PaymentStage {...stageProps} />
      case 'booking':
        return <BookingStage {...stageProps} />
      case 'welcome-vip':
        return <WelcomeVIPStage {...stageProps} />
      default:
        return <LandingStage {...stageProps} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {renderStage()}
    </div>
  )
}
// Composant AnimatedMoney
const AnimatedMoney: React.FC<{ value: number }> = ({ value }) => {
 const [displayValue, setDisplayValue] = useState(0)
 
 useEffect(() => {
   const duration = 1000
   const steps = 30
   const increment = value / steps
   let current = 0
   
   const timer = setInterval(() => {
     current += increment
     if (current >= value) {
       setDisplayValue(value)
       clearInterval(timer)
     } else {
       setDisplayValue(Math.round(current))
     }
   }, duration / steps)
   
   return () => clearInterval(timer)
 }, [value])
 
 return <span>{displayValue.toLocaleString()}</span>
}

// Stage 1: Landing
const LandingStage: React.FC<StageProps> = ({ 
 navigateToStage, 
 userData, 
 setUserData, 
 trackEvent, 
 liveStats, 
 countdown 
}) => {
 const [showDemo, setShowDemo] = useState(false)
 const [quickCalcDone, setQuickCalcDone] = useState(false)

 return (
   <div className="max-w-6xl mx-auto px-4 py-8">
     {/* Hero Section */}
     <section className="mb-12">
       <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl p-8 md:p-12 overflow-hidden relative">
         {/* Background pattern */}
         <div className="absolute inset-0 opacity-5">
           <div className="absolute inset-0" style={{
             backgroundImage: `repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 1px, transparent 15px)`,
           }} />
         </div>
         
         {/* Badge d'autorité */}
         <div className="text-center mb-8 relative z-10">
           <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-bold text-sm md:text-base animate-pulse">
             <Trophy size={20} />
             <span>PREMIER AU QUÉBEC • {CONFIG.SPOTS_TAKEN} CLIENTS ACTIFS</span>
             <Trophy size={20} />
           </div>
         </div>

         {/* Titre principal */}
         <div className="text-center mb-10 relative z-10">
           <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
             Tu Perds{' '}
             <span className="text-red-600 relative">
               <AnimatedMoney value={userData.weeklyLoss} />$/Semaine
               <span className="absolute -bottom-2 left-0 right-0 h-3 bg-red-200 opacity-30 transform skew-x-12"></span>
             </span>
             <br />
             en Appels Manqués
           </h1>
           
           {/* Stat Harvard */}
           <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 md:p-6 max-w-3xl mx-auto animate-bounce-slow">
             <p className="text-lg md:text-2xl text-gray-800">
               <span className="font-bold">Harvard Business Review:</span> Répondre en 1 minute = 
               <span className="text-green-600 font-black text-2xl md:text-3xl"> 21X</span> plus de chances de convertir
             </p>
             <p className="text-sm md:text-base text-gray-600 mt-2">
               Après 5 minutes? <span className="text-red-600 font-bold">-400% de conversion</span>
             </p>
           </div>
         </div>

         {/* CTA Principal */}
         <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 md:p-8 text-white mb-8 transform hover:scale-105 transition-all duration-300">
           <h3 className="text-2xl md:text-3xl font-bold mb-4 text-center flex items-center justify-center gap-3">
             <MessageSquare className="animate-bounce" size={32} />
             Parle avec Sophie (IA) - Elle calcule TES pertes exactes
           </h3>
           <button
             onClick={() => {
               navigateToStage('ai-qualification')
               trackEvent('start_ai_chat_hero', 1)
             }}
             className="w-full bg-white text-green-600 py-4 rounded-lg font-bold text-xl hover:shadow-xl transition-all"
           >
             Commencer la conversation maintenant →
           </button>
           <p className="text-center text-sm mt-3 flex items-center justify-center gap-2">
             <Sparkles size={16} />
             89% des gens qui testent l'IA deviennent clients en 24h
           </p>
         </div>

         {/* Quick Calculator */}
         <QuickCalculatorHero 
           userData={userData} 
           setUserData={setUserData}
           onComplete={() => setQuickCalcDone(true)}
           trackEvent={trackEvent}
         />
       </div>
     </section>

     {/* Stats Grid */}
     <section className="mb-12">
       <h2 className="text-3xl font-bold text-center mb-8">
         📊 Les Chiffres Qui Font Mal (Mais Qui Vont Te Motiver)
       </h2>
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {Object.entries(KILLER_STATS).slice(0, 8).map(([key, stat]: [string, any]) => (
           <div 
             key={key}
             className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
           >
             <p className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
               {stat.value}
             </p>
             <p className="text-sm text-gray-600 mt-2">{stat.desc}</p>
           </div>
         ))}
       </div>
       
       {/* Message percutant */}
       <div className="text-center mt-8 p-6 bg-red-50 rounded-xl">
         <p className="text-xl font-bold text-red-900">
           💸 Pendant que tu lis ça, tu viens de perdre{' '}
           <AnimatedMoney value={Math.round(userData.dailyLoss / 24 / 60)} />$ 
         </p>
         <p className="text-gray-700 mt-2">
           (Basé sur tes {userData.missedCalls} appels manqués/semaine à {userData.avgPrice}$/contrat)
         </p>
       </div>
     </section>

     {/* Démo IA */}
     <section className="mb-12">
       <DemoSection 
         showDemo={showDemo}
         setShowDemo={setShowDemo}
         trackEvent={trackEvent}
       />
     </section>

     {/* Plus de sections... */}
     <TestimonialsSection />
     <UrgencySection liveStats={liveStats} countdown={countdown} />
     
     {/* CTA Final */}
     <section className="text-center py-12">
       <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-8 text-white">
         <h2 className="text-3xl font-bold mb-4">
           ⏰ Les {CONFIG.SPOTS_TOTAL - CONFIG.SPOTS_TAKEN} Dernières Places Partent VITE
         </h2>
         <p className="text-xl mb-6">
           Ne laisse pas ton concurrent prendre TA place
         </p>
         <button
           onClick={() => {
             navigateToStage('ai-qualification')
             trackEvent('final_cta_clicked')
           }}
           className="bg-white text-red-600 px-8 py-4 rounded-full font-bold text-xl hover:shadow-xl transform hover:scale-105 transition-all inline-flex items-center"
         >
           Réserver Ma Place Maintenant <ArrowRight className="ml-2" />
         </button>
       </div>
     </section>
   </div>
 )
}

// Quick Calculator Component
const QuickCalculatorHero: React.FC<{
 userData: UserData
 setUserData: (data: any) => void
 onComplete: () => void
 trackEvent: (event: string, value?: any) => void
}> = ({ userData, setUserData, onComplete, trackEvent }) => {
 const [step, setStep] = useState(1)

 return (
   <div className="bg-white rounded-xl p-6 shadow-lg">
     <h3 className="text-xl font-bold mb-4">
       🧮 Calcul Rapide (30 secondes)
     </h3>
     
     {step === 1 && (
       <div>
         <p className="mb-4">Combien d'appels tu manques par semaine?</p>
         <input
           type="range"
           min="1"
           max="20"
           value={userData.missedCalls}
           onChange={(e) => setUserData({ ...userData, missedCalls: parseInt(e.target.value) })}
           className="w-full mb-2"
         />
         <p className="text-center text-2xl font-bold mb-4">{userData.missedCalls} appels</p>
         <button
           onClick={() => setStep(2)}
           className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold"
         >
           Suivant →
         </button>
       </div>
     )}
     
     {step === 2 && (
       <div>
         <p className="mb-4">Valeur moyenne d'un contrat?</p>
         <div className="grid grid-cols-3 gap-2 mb-4">
           {[400, 600, 800, 1000, 1500, 2000].map(price => (
             <button
               key={price}
               onClick={() => {
                 setUserData({ ...userData, avgPrice: price })
                 setStep(3)
                 onComplete()
                 trackEvent('quick_calc_completed', price)
               }}
               className="bg-gray-100 hover:bg-blue-100 py-2 rounded font-bold transition-colors"
             >
               {price}$
             </button>
           ))}
         </div>
       </div>
     )}
     
     {step === 3 && (
       <div className="text-center animate-bounce-in">
         <p className="text-3xl font-bold text-red-600">
           Tu perds {userData.weeklyLoss}$/semaine!
         </p>
         <p className="text-gray-600 mt-2">
           Soit {userData.yearlyLoss}$/année 😱
         </p>
       </div>
     )}
   </div>
 )
}
// Demo Section
const DemoSection: React.FC<{
 showDemo: boolean
 setShowDemo: (show: boolean) => void
 trackEvent: (event: string, value?: any) => void
}> = ({ showDemo, setShowDemo, trackEvent }) => {
 return (
   <div className="bg-white rounded-2xl shadow-xl p-8">
     <h2 className="text-3xl font-bold mb-6 text-center">
       🎤 Teste l'IA LIVE - Pose N'importe Quelle Question!
     </h2>
     
     <div className="text-center mb-8">
       <p className="text-lg text-gray-600 mb-4">
         L'IA comprend le québécois, répond en 2 secondes, gère toutes les situations
       </p>
     </div>

     {!showDemo ? (
       <div className="max-w-2xl mx-auto">
         <button
           onClick={() => {
             setShowDemo(true)
             trackEvent('demo_activated')
           }}
           className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-6 rounded-xl font-bold text-xl hover:scale-105 transition-transform flex items-center justify-center gap-3 shadow-lg"
         >
           <Headphones className="animate-pulse" size={32} />
           Activer la démo vocale maintenant
         </button>
         
         <p className="text-center text-sm text-gray-600 mt-4">
           ⚡ Aucune installation requise • Fonctionne sur tous les appareils
         </p>
       </div>
     ) : (
       <div className="max-w-3xl mx-auto">
         {/* Widget de démo vocale */}
         <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 shadow-inner">
           <div className="bg-white rounded-lg p-8">
             <elevenlabs-convai agent-id={CONFIG.AI_AGENT_OUTBOUND}></elevenlabs-convai>
             <Script src="https://elevenlabs.io/convai-widget/index.js" />
           </div>
         </div>
         
         {/* Performance metrics */}
         <div className="grid grid-cols-3 gap-4 mt-6">
           <div className="text-center">
             <p className="text-2xl font-bold text-green-600">2.1s</p>
             <p className="text-sm text-gray-600">Temps de réponse</p>
           </div>
           <div className="text-center">
             <p className="text-2xl font-bold text-blue-600">98%</p>
             <p className="text-sm text-gray-600">Compréhension</p>
           </div>
           <div className="text-center">
             <p className="text-2xl font-bold text-purple-600">24/7</p>
             <p className="text-sm text-gray-600">Disponible</p>
           </div>
         </div>
       </div>
     )}
   </div>
 )
}

// Testimonials Section
const TestimonialsSection: React.FC = () => {
 const testimonials = [
   {
     name: "Marc Tremblay",
     company: "Émondage Pro",
     image: "👨‍💼",
     text: "J'ai récupéré 3,200$/semaine! L'IA répond même le dimanche matin.",
     stars: 5
   },
   {
     name: "Sophie Gagnon",
     company: "Paysagement SG",
     image: "👩‍💼",
     text: "Plus jamais d'appels manqués. ROI en 2 semaines, c'est fou!",
     stars: 5
   },
   {
     name: "Pierre Dubois",
     company: "Taillage Expert",
     image: "👨‍💼",
     text: "L'installation en 30 jours, support A1. Je recommande à 100%.",
     stars: 5
   }
 ]

 return (
   <section className="py-12">
     <h2 className="text-3xl font-bold text-center mb-8">
       ⭐ Ils Récupèrent Déjà des Milliers $/Semaine
     </h2>
     <div className="grid md:grid-cols-3 gap-6">
       {testimonials.map((testimonial, i) => (
         <div key={i} className="bg-white rounded-xl shadow-lg p-6">
           <div className="flex items-center mb-4">
             <div className="text-4xl mr-4">{testimonial.image}</div>
             <div>
               <h3 className="font-bold">{testimonial.name}</h3>
               <p className="text-sm text-gray-600">{testimonial.company}</p>
             </div>
           </div>
           <div className="flex mb-3">
             {[...Array(testimonial.stars)].map((_, i) => (
               <Star key={i} size={20} className="text-yellow-400 fill-current" />
             ))}
           </div>
           <p className="text-gray-700">"{testimonial.text}"</p>
         </div>
       ))}
     </div>
   </section>
 )
}

// Urgency Section
const UrgencySection: React.FC<{ liveStats: any; countdown: number }> = ({ liveStats, countdown }) => {
 const hours = Math.floor(countdown / 3600)
 const minutes = Math.floor((countdown % 3600) / 60)
 const seconds = countdown % 60

 return (
   <section className="py-12">
     <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-white">
       <h2 className="text-3xl font-bold text-center mb-6">
         ⚡ Activité en Temps Réel
       </h2>
       
       <div className="grid md:grid-cols-3 gap-6 mb-8">
         <div className="text-center">
           <p className="text-4xl font-bold">{liveStats.activeVisitors}</p>
           <p>Visiteurs actifs</p>
         </div>
         <div className="text-center">
           <p className="text-4xl font-bold">{liveStats.callsAnswered.toLocaleString()}</p>
           <p>Appels répondus ce mois</p>
         </div>
         <div className="text-center">
           <p className="text-4xl font-bold">${(liveStats.moneySaved / 1000).toFixed(0)}K</p>
           <p>Économisés pour nos clients</p>
         </div>
       </div>
       
       <div className="text-center">
         <p className="text-xl mb-4">🔥 Dernière inscription: il y a {liveStats.lastSignup}</p>
         <div className="bg-white/20 rounded-lg p-4 inline-block">
           <p className="text-2xl font-bold">
             {String(hours).padStart(2, '0')}:
             {String(minutes).padStart(2, '0')}:
             {String(seconds).padStart(2, '0')}
           </p>
           <p className="text-sm">avant la fin de l'offre</p>
         </div>
       </div>
     </div>
   </section>
 )
}

// Stage 2: AI Qualification
const AIQualificationStage: React.FC<StageProps> = ({
 navigateToStage,
 userData,
 setUserData,
 trackEvent,
 chatMessages,
 setChatMessages,
 aiTyping,
 setAiTyping
}) => {
 const [currentQuestion, setCurrentQuestion] = useState(0)
 const [userInput, setUserInput] = useState('')
 const chatEndRef = useRef<HTMLDivElement>(null)

 const questions = [
   {
     ai: "Salut! 👋 Je suis Sophie, l'IA experte en récupération d'appels manqués. C'est quoi ton prénom?",
     field: 'name',
     validation: (value: string) => value.length > 1
   },
   {
     ai: (name: string) => `Enchanté ${name}! 🎯 Quel est le nom de ton entreprise?`,
     field: 'company',
     validation: (value: string) => value.length > 2
   },
   {
     ai: "Super! 📞 Maintenant la question qui fait mal... Combien d'appels tu manques par semaine environ?",
     field: 'missedCalls',
     type: 'number',
     validation: (value: string) => parseInt(value) > 0
   },
   {
     ai: "Aïe! 💸 Et c'est quoi la valeur moyenne d'un de tes contrats?",
     field: 'avgPrice',
     type: 'number',
     validation: (value: string) => parseInt(value) > 0
   },
   {
     ai: (name: string, loss: number) => `OMG ${name}! 😱 Tu perds ${loss}$/semaine! C'est urgent de régler ça?`,
     field: 'urgency',
     options: ['Très urgent!', 'Assez urgent', 'Je regarde mes options'],
     validation: (value: string) => value.length > 0
   },
   {
     ai: "Dernière question! 💪 T'es le/la boss qui peut dire OUI aujourd'hui?",
     field: 'decisionMaker',
     options: ['Oui, c\'est moi!', 'Je dois consulter'],
     validation: (value: string) => value.length > 0
   }
 ]

 useEffect(() => {
   // Message initial
   if (chatMessages?.length === 0) {
     setTimeout(() => {
       setChatMessages?.([{
         type: 'ai',
         text: questions[0].ai,
         timestamp: new Date()
       }])
     }, 500)
   }
 }, [])

 useEffect(() => {
   chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
 }, [chatMessages])

 const handleSubmit = async (e?: React.FormEvent) => {
   e?.preventDefault()
   
   const question = questions[currentQuestion]
   let value = userInput

   // Validation
   if (!question.validation(value)) {
     return
   }

   // Ajouter message utilisateur
   setChatMessages?.([
     ...(chatMessages || []),
     {
       type: 'user',
       text: value,
       timestamp: new Date()
     }
   ])

   // Mettre à jour les données
   const updates: any = { [question.field]: value }
   
   // Traitement spécial pour certains champs
   if (question.field === 'missedCalls') {
     updates.missedCalls = parseInt(value)
   } else if (question.field === 'avgPrice') {
     updates.avgPrice = parseInt(value)
     const losses = calculateLosses(userData.missedCalls, parseInt(value))
     Object.assign(updates, losses)
   } else if (question.field === 'urgency') {
     updates.urgency = value === 'Très urgent!' ? 'urgent' : value === 'Assez urgent' ? 'soon' : 'exploring'
   } else if (question.field === 'decisionMaker') {
     updates.decisionMaker = value === 'Oui, c\'est moi!'
   }

   setUserData({ ...userData, ...updates })
   setUserInput('')

   // Typing animation
   setAiTyping?.(true)
   
   setTimeout(() => {
     setAiTyping?.(false)
     
     if (currentQuestion < questions.length - 1) {
       // Prochaine question
       const nextQuestion = questions[currentQuestion + 1]
       let aiMessage = ''
       
       if (typeof nextQuestion.ai === 'function') {
         aiMessage = nextQuestion.ai(userData.name, userData.weeklyLoss)
       } else {
         aiMessage = nextQuestion.ai
       }
       
       setChatMessages?.([
         ...(chatMessages || []),
         {
           type: 'user',
           text: value,
           timestamp: new Date()
         },
         {
           type: 'ai',
           text: aiMessage,
           timestamp: new Date()
         }
       ])
       
       setCurrentQuestion(currentQuestion + 1)
     } else {
       // Qualification terminée
       const nepqScore = calculateNEPQScore(userData)
       setUserData({ ...userData, ...updates, nepqScore })
       
       trackEvent('ai_qualification_completed', nepqScore, {
         weeklyLoss: userData.weeklyLoss,
         urgency: updates.urgency
       })
       
       // Message final
       setChatMessages?.([
         ...(chatMessages || []),
         {
           type: 'user',
           text: value,
           timestamp: new Date()
         },
         {
           type: 'ai',
           text: `Parfait ${userData.name}! 🎯 J'ai tout ce qu'il me faut. Ton score de qualification est de ${nepqScore}/100. Je te montre maintenant EXACTEMENT comment on va récupérer tes ${userData.weeklyLoss}$/semaine...`,
           timestamp: new Date()
         }
       ])
       
       setTimeout(() => {
         navigateToStage('deep-calculator')
       }, 3000)
     }
   }, 1500)
 }

 const calculateLosses = (missedCalls: number, avgPrice: number) => {
   const conversionRate = 0.3
   const dailyLoss = Math.round((missedCalls / 5) * avgPrice * conversionRate)
   const weeklyLoss = Math.round(missedCalls * avgPrice * conversionRate)
   const monthlyLoss = Math.round(weeklyLoss * 4.33)
   const yearlyLoss = Math.round(weeklyLoss * 52)
   const fiveYearLoss = yearlyLoss * 5
   
   return { dailyLoss, weeklyLoss, monthlyLoss, yearlyLoss, fiveYearLoss }
 }

 const calculateNEPQScore = (data: any) => {
   let score = 0
   
   // Pertes financières (40 points max)
   if (data.weeklyLoss > 3000) score += 40
   else if (data.weeklyLoss > 2000) score += 30
   else if (data.weeklyLoss > 1000) score += 20
   else if (data.weeklyLoss > 500) score += 10
   
   // Urgence (30 points max)
   if (data.urgency === 'urgent') score += 30
   else if (data.urgency === 'soon') score += 20
   else if (data.urgency === 'exploring') score += 10
   
   // Décideur (30 points max)
   if (data.decisionMaker) score += 30
   
   return score
 }

 const currentQ = questions[currentQuestion]

 return (
   <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
     <div className="max-w-3xl mx-auto px-4">
       {/* Header */}
       <div className="text-center mb-8">
         <div className="inline-flex items-center bg-white rounded-full px-6 py-3 shadow-lg mb-4">
           <Bot className="text-purple-600 mr-2" size={24} />
           <span className="font-bold text-gray-800">Sophie • IA Qualificatrice</span>
         </div>
         <div className="text-sm text-gray-600">
           Question {currentQuestion + 1} sur {questions.length}
         </div>
       </div>

       {/* Chat container */}
       <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 h-[500px] overflow-y-auto">
         <div className="space-y-4">
           {chatMessages?.map((message, index) => (
             <div
               key={index}
               className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
             >
               <div
                 className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                   message.type === 'user'
                     ? 'bg-blue-600 text-white'
                     : 'bg-gray-100 text-gray-800'
                 }`}
               >
                 {message.text}
               </div>
             </div>
           ))}
           
           {aiTyping && (
             <div className="flex justify-start">
               <div className="bg-gray-100 rounded-2xl px-4 py-3">
                 <div className="flex space-x-2">
                   <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                   <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                   <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                 </div>
               </div>
             </div>
           )}
           
           <div ref={chatEndRef} />
         </div>
       </div>

       {/* Input form */}
       <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-4">
         {currentQ.options ? (
           <div className="grid grid-cols-2 gap-3">
             {currentQ.options.map((option, i) => (
               <button
                 key={i}
                 type="button"
                 onClick={() => {
                   setUserInput(option)
                   handleSubmit()
                 }}
                 className="bg-purple-100 hover:bg-purple-200 text-purple-800 py-3 px-4 rounded-lg font-medium transition-colors"
               >
                 {option}
               </button>
             ))}
           </div>
         ) : (
           <div className="flex gap-3">
             <input
               type={currentQ.type || 'text'}
               value={userInput}
               onChange={(e) => setUserInput(e.target.value)}
               placeholder="Ta réponse..."
               className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
               autoFocus
             />
             <button
               type="submit"
               disabled={!userInput}
               className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
             >
               <Send size={20} />
             </button>
           </div>
         )}
       </form>
     </div>
   </div>
 )
}
// Stage 3: Deep Calculator
const DeepCalculatorStage: React.FC<StageProps> = ({
  navigateToStage,
  userData,
  trackEvent
}) => {
  useEffect(() => {
    trackEvent('deep_calculator_viewed', userData.weeklyLoss)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header alarmant */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center bg-red-600 text-white rounded-full px-6 py-3 shadow-lg animate-pulse">
            <AlertCircle className="mr-2" size={24} />
            <span className="font-bold">ALERTE FINANCIÈRE CRITIQUE</span>
          </div>
        </div>

        {/* Résultats principaux */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-3xl font-bold text-center mb-8">
            {userData.name}, voici la vérité qui fait mal...
          </h1>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
              <h3 className="text-xl font-bold text-red-800 mb-4">
                💸 Pertes Actuelles
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Par jour:</span>
                  <span className="font-bold text-red-600">{userData.dailyLoss}$</span>
                </div>
                <div className="flex justify-between">
                  <span>Par semaine:</span>
                  <span className="font-bold text-red-600">{userData.weeklyLoss}$</span>
                </div>
                <div className="flex justify-between">
                  <span>Par mois:</span>
                  <span className="font-bold text-red-600">{userData.monthlyLoss}$</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span>Par année:</span>
                  <span className="font-black text-red-600">{userData.yearlyLoss}$</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
              <h3 className="text-xl font-bold text-green-800 mb-4">
                💰 Avec Sophie l'IA (Projection)
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Appels manqués:</span>
                  <span className="font-bold text-green-600">0</span>
                </div>
                <div className="flex justify-between">
                  <span>Temps de réponse:</span>
                  <span className="font-bold text-green-600">0.3 secondes</span>
                </div>
                <div className="flex justify-between">
                  <span>Revenue récupéré:</span>
                  <span className="font-bold text-green-600">+{userData.weeklyLoss}$/sem</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span>ROI annuel:</span>
                  <span className="font-black text-green-600">+{userData.yearlyLoss}$</span>
                </div>
              </div>
            </div>
          </div>

          {/* Message Jean-Samuel style */}
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6 mb-6">
            <p className="text-lg font-bold text-center mb-2">
              🚨 {userData.name}, ta business est comme un seau troué!
            </p>
            <p className="text-center">
              Pendant que tu soupes avec ta famille, {userData.weeklyLoss}$ s'en vont direct dans les poches de ton compétiteur.
              <br />
              <span className="font-bold">78% des clients vont avec le premier qui répond!</span>
            </p>
          </div>

          {/* Graph visuel des pertes */}
          <div className="bg-gray-900 rounded-xl p-6 text-white">
            <h3 className="text-xl font-bold mb-4">📊 Valeur perdue sur 10 ans</h3>
            <div className="h-64 flex items-end justify-around">
              {[1, 2, 3, 5, 10].map(year => (
                <div key={year} className="text-center">
                  <div 
                    className="bg-red-500 w-16 mx-auto rounded-t"
                    style={{ height: `${Math.min(year * 20, 200)}px` }}
                  />
                  <p className="mt-2 text-sm">{year} ans</p>
                  <p className="font-bold">{(userData.yearlyLoss * year).toLocaleString()}$</p>
                </div>
              ))}
            </div>
            <p className="text-center mt-4 text-2xl font-bold">
              Valeur d'entreprise perdue: <span className="text-red-400">{(userData.yearlyLoss * 5).toLocaleString()}$</span> 
            </p>
            <p className="text-center text-sm mt-2">
              (Une business se vend 5x le profit annuel)
            </p>
          </div>
        </div>

        {/* CTA urgent */}
        <div className="text-center">
          <button
            onClick={() => {
              trackEvent('proceed_to_demo', userData.weeklyLoss)
              navigateToStage('proof-demo')
            }}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-full font-bold text-xl shadow-xl hover:scale-105 transform transition-all inline-flex items-center"
          >
            Je veux récupérer mes {userData.weeklyLoss}$/semaine <ArrowRight className="ml-2" />
          </button>
          <p className="text-sm text-gray-600 mt-4">
            👇 Découvre comment Sophie va sauver tes appels en 0.3 secondes
          </p>
        </div>
      </div>
    </div>
  )
}

// Stage 4: Proof & Demo
const ProofDemoStage: React.FC<StageProps> = ({
  navigateToStage,
  userData,
  trackEvent
}) => {
  const [demoActive, setDemoActive] = useState(false)
  const [selectedTestCase, setSelectedTestCase] = useState('')

  const testCases = [
    { id: 'ginette', label: '👵 Ginette 80 ans', desc: 'Répète 10 fois' },
    { id: 'stephane', label: '🤓 Stéphane analytique', desc: 'Veut tout savoir' },
    { id: 'ahmed', label: '💰 Ahmed négociateur', desc: 'Veut -50%' },
    { id: 'urgent', label: '🚨 Job urgente', desc: 'Besoin maintenant' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            🎯 Sophie - L'IA Qui Connaît L'encyclopédie Des Haies Par Cœur
          </h1>
          <p className="text-xl text-gray-600">
            Elle répond en québécois, en 0.3 secondes, 24/7
          </p>
        </div>

        {/* Histoire Jean-Samuel */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">
            🌳 Pourquoi j'ai créé Sophie pour les tailleurs de haies?
          </h2>
          <div className="space-y-4 text-lg">
            <p>
              <span className="font-bold">J'suis Jean-Samuel.</span> J'ai fait du taillage de haies pendant 4 ans.
              J'ai déjà vendu 2,000$ de job en une heure en porte-à-porte.
            </p>
            <p>
              Aujourd'hui j'ai 4 cliniques vétérinaires, 1 compagnie de comptabilité, 50 portes en immobilier.
            </p>
            <p className="bg-green-50 p-4 rounded-lg">
              <span className="font-bold">Mon chum que j'ai mentoré de zéro?</span> 
              <br />Il fait maintenant 400,000$/saison avec 4 employés!
            </p>
            <p>
              <span className="font-bold">Mes racines viennent du taillage.</span> J'aime les tailleurs de haies.
              On est du monde d'action, des fonceurs. Pas des cols blancs qui prennent 40 ans pour agir.
            </p>
          </div>
        </div>

        {/* Demo IA */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold text-center mb-6">
            🔥 TESTE SOPHIE LIVE - Elle Gère TOUS Les Types de Clients!
          </h2>

          {/* Options de test */}
          <div className="grid md:grid-cols-4 gap-3 mb-6">
            {testCases.map(test => (
              <button
                key={test.id}
                onClick={() => {
                  setSelectedTestCase(test.id)
                  trackEvent('demo_test_selected', test.id)
                }}
                className={`p-3 rounded-lg font-medium transition-all ${
                  selectedTestCase === test.id
                    ? 'bg-white text-purple-600'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                <div className="text-lg">{test.label}</div>
                <div className="text-xs opacity-80">{test.desc}</div>
              </button>
            ))}
          </div>

          {/* Widget IA */}
          {!demoActive ? (
            <div className="text-center">
              <button
                onClick={() => {
                  setDemoActive(true)
                  trackEvent('demo_activated_proof')
                }}
                className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-xl hover:scale-105 transform transition-all inline-flex items-center"
              >
                <Phone className="mr-2" size={24} />
                Appeler Sophie: {CONFIG.AI_PHONE}
              </button>
              <p className="mt-4 text-sm">
                Ou utilise le widget ci-dessous pour parler directement
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6">
              <elevenlabs-convai agent-id={CONFIG.AI_AGENT_CLOSER}></elevenlabs-convai>
            </div>
          )}

          {/* Ce que Sophie fait */}
          <div className="mt-8 bg-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">✨ Sophie en action:</h3>
            <ul className="space-y-2">
              <li>✅ Connaît toutes les techniques de vente par cœur</li>
              <li>✅ Fait une soumission basée sur tes prix au pied carré</li>
              <li>✅ Book direct dans ton agenda avec toutes les infos</li>
              <li>✅ S'adapte au profil psychologique du client</li>
              <li>✅ Close avec les meilleures techniques de persuasion</li>
              <li>✅ Envoie une notification avec tous les détails</li>
            </ul>
          </div>
        </div>

        {/* Garantie Jean-Samuel */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-center mb-6">
            🛡️ Ma Garantie Personnelle
          </h2>
          <div className="bg-red-50 border-2 border-red-400 rounded-xl p-6 text-center">
            <p className="text-xl font-bold mb-4">
              "Si t'as pas refait ton argent cette saison..."
            </p>
            <p className="text-lg">
              Je prends mon cul pi mon char, pis je vais closer tes jobs en porte-à-porte pour toi!
            </p>
            <p className="text-sm mt-4 font-bold">
              C'est écrit dans le contrat. Je te garantis le ROI.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => {
              trackEvent('proceed_to_offer', userData.nepqScore)
              navigateToStage('offer-contract')
            }}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-full font-bold text-xl shadow-xl hover:scale-105 transform transition-all inline-flex items-center"
          >
            Je veux Sophie pour ma business <ArrowRight className="ml-2" />
          </button>
          <p className="text-sm text-gray-600 mt-4">
            ⏰ J'en prends juste 5 cette saison - 3 places restantes
          </p>
        </div>
      </div>
    </div>
  )
}
// Stage 5: Offer & Contract
const OfferContractStage: React.FC<StageProps> = ({
 navigateToStage,
 userData,
 trackEvent
}) => {
 const [contractAccepted, setContractAccepted] = useState(false)
 const [initials, setInitials] = useState('')

 const handleAcceptContract = () => {
   if (!initials || initials.length < 2) {
     alert('Veuillez entrer vos initiales')
     return
   }
   
   setContractAccepted(true)
   trackEvent('contract_accepted', 5000, {
     nepqScore: userData.nepqScore,
     weeklyLoss: userData.weeklyLoss
   })
   
   setTimeout(() => {
     navigateToStage('payment')
   }, 2000)
 }

 return (
   <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 py-8">
     <div className="max-w-4xl mx-auto px-4">
       {/* Header VIP */}
       <div className="text-center mb-8">
         <div className="inline-flex items-center bg-gradient-to-r from-yellow-600 to-yellow-500 text-white rounded-full px-6 py-3 shadow-lg">
           <Trophy className="mr-2" size={24} />
           <span className="font-bold">OFFRE EXCLUSIVE - 3 PLACES RESTANTES SUR 5</span>
         </div>
       </div>

       {/* L'offre principale */}
       <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
         <h1 className="text-3xl font-bold text-center mb-8">
           Sophie - Ta Réceptionniste IA À Vie
         </h1>

         {/* Comparaison */}
         <div className="bg-gray-100 rounded-xl p-6 mb-8">
           <h3 className="text-xl font-bold mb-4 text-center">
             💰 Compare avec une réceptionniste humaine:
           </h3>
           <div className="grid md:grid-cols-2 gap-6">
             <div className="bg-red-50 rounded-lg p-4">
               <h4 className="font-bold text-red-800 mb-3">❌ Humain (50,000$/an)</h4>
               <ul className="space-y-2 text-sm">
                 <li>• Congés maladie</li>
                 <li>• Vacances</li>
                 <li>• Erreurs humaines</li>
                 <li>• 40h/semaine max</li>
                 <li>• Formation longue</li>
                 <li>• Caprices</li>
               </ul>
             </div>
             <div className="bg-green-50 rounded-lg p-4">
               <h4 className="font-bold text-green-800 mb-3">✅ Sophie IA (5,000$ à vie)</h4>
               <ul className="space-y-2 text-sm">
                 <li>• Jamais malade</li>
                 <li>• 24/7/365</li>
                 <li>• 0.3 sec de réponse</li>
                 <li>• Clients illimités</li>
                 <li>• S'améliore seule</li>
                 <li>• Close tout</li>
               </ul>
             </div>
           </div>
         </div>

         {/* Ce qui est inclus */}
         <div className="space-y-6 mb-8">
           <h3 className="font-bold text-xl mb-3">🎁 TOUT CE QUE T'AS AVEC SOPHIE:</h3>
           
           <div className="space-y-4">
             <div className="flex items-start">
               <Check className="text-green-600 mr-3 mt-1" size={24} />
               <div>
                 <p className="font-bold">Sophie personnalisée pour {userData.company}</p>
                 <p className="text-sm text-gray-600">Connaît tes prix, services, territoire</p>
               </div>
             </div>
             
             <div className="flex items-start">
               <Check className="text-green-600 mr-3 mt-1" size={24} />
               <div>
                 <p className="font-bold">Script de vente à 2,000$/heure</p>
                 <p className="text-sm text-gray-600">Le même que j'utilisais en porte-à-porte</p>
               </div>
             </div>
             
             <div className="flex items-start">
               <Check className="text-green-600 mr-3 mt-1" size={24} />
               <div>
                 <p className="font-bold">Blueprint pour atteindre 1M$ de chiffre d'affaires</p>
                 <p className="text-sm text-gray-600">Mon système complet étape par étape</p>
               </div>
             </div>
             
             <div className="flex items-start">
               <Check className="text-green-600 mr-3 mt-1" size={24} />
               <div>
                 <p className="font-bold">Mon numéro de cell pour du coaching SMS</p>
                 <p className="text-sm text-gray-600">Je réponds en 24h max</p>
               </div>
             </div>
             
             <div className="flex items-start">
               <Check className="text-green-600 mr-3 mt-1" size={24} />
               <div>
                 <p className="font-bold">Automatisation sondage satisfaction</p>
                 <p className="text-sm text-gray-600">10/10 = demande Google review + références</p>
               </div>
             </div>
             
             <div className="flex items-start">
               <Check className="text-green-600 mr-3 mt-1" size={24} />
               <div>
                 <p className="font-bold">Installation en max 4 semaines</p>
                 <p className="text-sm text-gray-600">100+ heures de développement custom</p>
               </div>
             </div>
           </div>
         </div>

         {/* Pricing */}
         <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white mb-8">
           <div className="text-center">
             <p className="text-lg mb-2">Prix régulier</p>
             <div className="text-5xl font-bold mb-4">
               <span className="line-through opacity-50">10,000$</span>
               <span className="ml-4">5,000$</span>
             </div>
             <p className="text-xl mb-6">+ 100$/mois (4h de réceptionniste)</p>
             
             <div className="bg-white/20 rounded-lg p-4 mb-6">
               <p className="font-bold text-lg">⏰ OFFRE 24H SEULEMENT:</p>
               <p className="text-2xl font-bold">50% DE RABAIS = 5,000$ au lieu de 10,000$</p>
             </div>
             
             <p className="text-2xl font-bold">
               💰 ROI: Tu récupères {userData.weeklyLoss}$/semaine
             </p>
             <p className="text-lg">
               = {Math.round(5000 / userData.weeklyLoss)} semaines pour être rentable!
             </p>
           </div>
         </div>

         {/* Calcul Jean-Samuel */}
         <div className="bg-blue-50 rounded-xl p-6 mb-8">
           <h3 className="font-bold text-lg mb-3">🧮 Le calcul de Jean-Samuel:</h3>
           <p className="mb-3">
             "Écoute, avec 5,000$ tu vas faire {userData.yearlyLoss * 10}$ sur 10 ans.
           </p>
           <p className="font-bold text-xl text-center">
             Trouve-moi un meilleur rendement que ça!
           </p>
         </div>

         {/* Contract */}
         <div className="bg-gray-100 rounded-xl p-6">
           <h3 className="font-bold text-lg mb-4">📝 Contrat Simple (2 minutes)</h3>
           
           <div className="bg-white rounded-lg p-4 mb-4 text-sm space-y-2">
             <p><strong>Parties:</strong> {userData.company} et AI Réceptionniste Inc. (Jean-Samuel Leboeuf)</p>
             <p><strong>Service:</strong> Sophie - IA réceptionniste 24/7 à vie</p>
             <p><strong>Installation:</strong> Maximum 4 semaines</p>
             <p><strong>Support:</strong> Illimité, SMS direct avec Jean-Samuel</p>
             <p><strong>Garantie:</strong> ROI ou je viens closer en personne</p>
             <p><strong>Prix:</strong> 5,000$ installation + 100$/mois</p>
           </div>
           
           <div className="space-y-4">
             <div>
               <label className="block text-sm font-medium mb-2">
                 Entrez vos initiales pour accepter:
               </label>
               <input
                 type="text"
                 value={initials}
                 onChange={(e) => setInitials(e.target.value.toUpperCase())}
                 placeholder="Ex: JD"
                 className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                 maxLength={4}
               />
             </div>
             
             <button
               onClick={handleAcceptContract}
               disabled={!initials || initials.length < 2}
               className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
             >
               {contractAccepted ? (
                 <span className="flex items-center justify-center">
                   <CheckCircle className="mr-2" /> Contrat accepté! Redirection...
                 </span>
               ) : (
                 'J\'accepte et je deviens ACTION (pas suiveux)'
               )}
             </button>
           </div>
         </div>
       </div>
     </div>
   </div>
 )
}

// Stage 6: Payment
const PaymentStage: React.FC<StageProps> = ({
 navigateToStage,
 userData,
 trackEvent
}) => {
 const [paymentProcessing, setPaymentProcessing] = useState(false)

 const handlePayment = () => {
   setPaymentProcessing(true)
   trackEvent('payment_initiated', 5000)
   
   // Redirection vers Stripe
   setTimeout(() => {
     window.location.href = CONFIG.STRIPE_LINK
   }, 1000)
 }

 return (
   <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8">
     <div className="max-w-3xl mx-auto px-4">
       {/* Sécurité */}
       <div className="text-center mb-8">
         <div className="inline-flex items-center bg-green-600 text-white rounded-full px-6 py-3 shadow-lg">
           <Lock className="mr-2" size={20} />
           <span className="font-bold">PAIEMENT 100% SÉCURISÉ</span>
         </div>
       </div>

       {/* Message Jean-Samuel */}
       <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6 mb-8">
         <p className="text-lg font-bold text-center">
           "C'est tellement malade qu'avec tout ce que je viens de t'expliquer, 
           à ce prix-là, c'est pas moi qui va te supplier d'accepter!"
         </p>
         <p className="text-center mt-2">- Jean-Samuel</p>
       </div>

       {/* Résumé de commande */}
       <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
         <h1 className="text-2xl font-bold mb-6">Finalise ta commande</h1>
         
         <div className="border-2 border-green-200 rounded-lg p-6 mb-6">
           <h3 className="font-bold text-lg mb-4">📋 Résumé pour {userData.company}</h3>
           
           <div className="space-y-3">
             <div className="flex justify-between">
               <span>Sophie IA à vie (valeur 10,000$)</span>
               <span className="font-bold">5,000$</span>
             </div>
             <div className="flex justify-between">
               <span>Abonnement mensuel</span>
               <span className="font-bold">100$/mois</span>
             </div>
             <div className="flex justify-between text-green-600">
               <span>🎁 Script 2,000$/h</span>
               <span className="font-bold">INCLUS</span>
             </div>
             <div className="flex justify-between text-green-600">
               <span>🎁 Blueprint 1M$</span>
               <span className="font-bold">INCLUS</span>
             </div>
             <div className="flex justify-between text-green-600">
               <span>🎁 Coaching SMS</span>
               <span className="font-bold">INCLUS</span>
             </div>
             
             <div className="border-t pt-3 mt-3">
               <div className="flex justify-between text-xl font-bold">
                 <span>Total aujourd'hui:</span>
                 <span>5,000$</span>
               </div>
               <p className="text-sm text-gray-600 mt-1">
                 Prochain paiement: 100$ dans 1 mois
               </p>
             </div>
           </div>
         </div>

         {/* ROI Calculator */}
         <div className="bg-green-50 rounded-lg p-6 mb-6">
           <h3 className="font-bold mb-3">💰 Ton ROI Projeté</h3>
           <div className="space-y-2 text-sm">
             <div className="flex justify-between">
               <span>Revenue récupéré/semaine:</span>
               <span className="font-bold text-green-600">+{userData.weeklyLoss}$</span>
             </div>
             <div className="flex justify-between">
               <span>Coût/semaine:</span>
               <span className="font-bold">-25$</span>
             </div>
             <div className="flex justify-between text-lg font-bold text-green-600">
               <span>Profit NET/semaine:</span>
               <span>+{userData.weeklyLoss - 25}$</span>
             </div>
           </div>
           <p className="text-center mt-4 text-lg font-bold">
             🚀 Rentabilisé en {Math.round(5000 / (userData.weeklyLoss - 25))} semaines!
           </p>
         </div>

         {/* Payment button */}
         <button
           onClick={handlePayment}
           disabled={paymentProcessing}
           className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-lg font-bold text-xl hover:scale-105 transform transition-all disabled:opacity-50"
         >
           {paymentProcessing ? (
             <span className="flex items-center justify-center">
               <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
               Redirection vers paiement sécurisé...
             </span>
           ) : (
             <span className="flex items-center justify-center">
               <CreditCard className="mr-3" />
               ACTION - Payer 5,000$ maintenant
             </span>
           )}
         </button>
         
         <div className="flex items-center justify-center mt-4 text-sm text-gray-600">
           <Lock size={16} className="mr-2" />
           Paiement crypté SSL • Stripe certifié PCI
         </div>
       </div>

       {/* Urgency */}
       <div className="text-center">
         <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4">
           <p className="font-bold text-red-800">
             ⚠️ ATTENTION: J'en prends juste 5 cette saison
           </p>
           <p className="text-sm text-red-600 mt-1">
             3 places restantes - Ton compétiteur est peut-être en train de payer...
           </p>
         </div>
       </div>
     </div>
   </div>
 )
}

// Stage 7: Booking
const BookingStage: React.FC<StageProps> = ({
 navigateToStage,
 userData,
 trackEvent
}) => {
 const [bookingCompleted, setBookingCompleted] = useState(false)

 const handleBooking = () => {
   setBookingCompleted(true)
   trackEvent('onboarding_booked')
   
   // Ouvrir Calendly
   window.open(CONFIG.CALENDLY_URL, '_blank')
   
   setTimeout(() => {
     navigateToStage('welcome-vip')
   }, 2000)
 }

 return (
   <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
     <div className="max-w-4xl mx-auto px-4">
       <div className="text-center mb-8">
         <div className="inline-flex items-center bg-blue-600 text-white rounded-full px-6 py-3 shadow-lg">
           <Calendar className="mr-2" size={20} />
           <span className="font-bold">RÉSERVE TON INSTALLATION VIP</span>
         </div>
       </div>

       <div className="bg-white rounded-2xl shadow-xl p-8">
         <h1 className="text-3xl font-bold text-center mb-8">
           🎉 Let's go {userData.name}!
         </h1>
         
         <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-8">
           <p className="text-center text-lg font-bold">
             T'es maintenant dans le club des ACTION, pas des suiveux!
           </p>
           <p className="text-center mt-2">
             Sophie va être prête dans max 4 semaines
           </p>
         </div>

         <div className="mb-8">
           <h2 className="text-xl font-bold mb-6">📅 Prochaines étapes:</h2>
           
           <div className="space-y-4">
             <div className="flex items-start">
               <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                 1
               </div>
               <div>
                 <h3 className="font-bold">Call d'installation (30 min)</h3>
                 <p className="text-gray-600">On configure Sophie ensemble</p>
               </div>
             </div>
             
             <div className="flex items-start">
               <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                 2
               </div>
               <div>
                 <h3 className="font-bold">Je code Sophie sur mesure</h3>
                 <p className="text-gray-600">100+ heures de développement pour {userData.company}</p>
               </div>
             </div>
             
             <div className="flex items-start">
               <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                 3
               </div>
               <div>
                 <h3 className="font-bold">Sophie commence à closer! 💰</h3>
                 <p className="text-gray-600">Tu reçois des notifications de jobs bookées</p>
               </div>
             </div>
           </div>
         </div>

         <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white text-center">
           <h3 className="text-xl font-bold mb-4">
             ⏰ Choisis ton créneau maintenant
           </h3>
           <p className="mb-6">
             Plus vite on se parle, plus vite Sophie récupère tes {userData.weeklyLoss}$/semaine!
           </p>
           
           <button
             onClick={handleBooking}
             className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:scale-105 transform transition-all"
           >
             {bookingCompleted ? (
               <span className="flex items-center justify-center">
                 <CheckCircle className="mr-2" /> Calendrier ouvert!
               </span>
             ) : (
               <span className="flex items-center justify-center">
                 <Calendar className="mr-2" /> Réserver mon installation
               </span>
             )}
           </button>
         </div>
       </div>
     </div>
   </div>
 )
}

// Stage 8: Welcome VIP
const WelcomeVIPStage: React.FC<StageProps> = ({
 userData,
 trackEvent,
 sendSMS
}) => {
 useEffect(() => {
   trackEvent('funnel_completed', userData.yearlyLoss, {
     company: userData.company,
     nepqScore: userData.nepqScore
   })
   
   // Send welcome SMS
   sendSMS?.(
     `🎉 Let's go ${userData.name}! Sophie va être prête dans max 4 semaines. Tu vas récupérer ${userData.weeklyLoss}$/semaine! P.S. Texte ACTION au 450-280-3222 si t'as des questions - Jean-Samuel`,
     userData.phone
   )
 }, [])

 return (
   <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center py-8">
     <div className="max-w-4xl mx-auto px-4 text-white text-center">
       <div className="mb-8">
         <Trophy size={80} className="mx-auto mb-6 animate-bounce" />
         <h1 className="text-5xl font-bold mb-4">
           Bienvenue dans le Club des ACTION! 🎉
         </h1>
       </div>

       <div className="bg-white/20 backdrop-blur rounded-2xl p-8 mb-8">
         <h2 className="text-2xl font-bold mb-6">
           {userData.name}, t'es maintenant un fonceur, pas un suiveux!
         </h2>
         
         <div className="grid md:grid-cols-3 gap-6 mb-8">
           <div>
             <Rocket size={48} className="mx-auto mb-3" />
             <h3 className="font-bold mb-2">Dans 24-48h</h3>
             <p>Call avec Jean-Samuel ou son équipe</p>
           </div>
           <div>
             <Brain size={48} className="mx-auto mb-3" />
             <h3 className="font-bold mb-2">Dans 2-3 semaines</h3>
             <p>Sophie en test privé pour toi</p>
           </div>
           <div>
             <DollarSign size={48} className="mx-auto mb-3" />
             <h3 className="font-bold mb-2">Dans 4 semaines</h3>
             <p>+{userData.weeklyLoss}$/semaine garantis!</p>
           </div>
         </div>
         
         <div className="bg-white/20 rounded-lg p-6">
           <h3 className="text-xl font-bold mb-3">📱 Contact Direct</h3>
           <p className="mb-2">SMS Jean-Samuel: 450-280-3222</p>
           <p className="mb-2">Email: support@sophieai.ca</p>
           <p>Texte "ACTION" pour toute question!</p>
         </div>
       </div>

       <div className="space-y-4">
         <p className="text-xl">
           💌 Check tes courriels - toutes les infos arrivent!
         </p>
         <p className="text-lg opacity-80">
           P.S. T'as pris la meilleure décision pour ta business. 
           <br />
           Pendant que tes compétiteurs dorment, Sophie va closer! 
         </p>
       </div>
     </div>
   </div>
 )
}
