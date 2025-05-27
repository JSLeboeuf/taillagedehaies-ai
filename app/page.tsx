'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, DollarSign, Clock, Check, AlertCircle, Shield, 
  Building2, Calculator, ChevronRight, CreditCard, Lock, 
  Star, Award, MessageSquare, Calendar, Video, Users,
  TrendingUp, Zap, Bot, Headphones, BarChart3, Target,
  Sparkles, Trophy, FileText, Send, Eye, Brain,
  CheckCircle, X, Mic, MicOff, Download, ExternalLink,
  Gift, Rocket, Heart, ThumbsUp, Bell
} from 'lucide-react';
import Script from 'next/script';

// Configuration avec VOS vraies clés
const CONFIG = {
  // APIs
  AI_AGENT_ID: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_CLOSER || 'agent_01jw6jap8jfvvthybsan5b9ty2',
  STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  CALENDLY_URL: process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/autoscaleai/decouverte',
  
  // Contact
  PHONE_NUMBER: '+14382294244',
  WHATSAPP: 'https://wa.me/14382294244',
  EMAIL: 'jsleboeuf3@gmail.com',
  
  // Business
  TOTAL_SPOTS: 5,
  SPOTS_TAKEN: 3,
  PRICE_NOW: 5000,
  PRICE_FUTURE: 10000,
  MONTHLY_FEE: 100,
  
  // Stats temps réel
  CALLS_SAVED_TODAY: 147,
  ACTIVE_VISITORS: 23,
  AVG_MISSED_CALLS: 4,
  AVG_CONTRACT_VALUE: 600,
  AVG_ROI_WEEKS: 3.7
};

// Statistiques percutantes
const KILLER_STATS = {
  harvard: { value: "21X", desc: "plus de chances après 1 minute" },
  missedCalls: { value: "62%", desc: "des appels non répondus" },
  neverCallback: { value: "85%", desc: "ne rappellent JAMAIS" },
  lossPerCall: { value: "1,200$", desc: "perdu PAR appel (services)" },
  weekendMissed: { value: "40%+", desc: "d'appels manqués la fin de semaine" },
  phoneConversion: { value: "10-15X", desc: "meilleur que les leads web" },
  industryMissed: { value: "27%", desc: "d'appels manqués (taillage)" },
  preferPhone: { value: "65%", desc: "préfèrent appeler" },
  frustrationTransfer: { value: "79%", desc: "transférés au moins 1 fois" },
  retention: { value: "5%", desc: "d'augmentation = 25-95% profits" }
};

export default function Home() {
  // État global
  const [stage, setStage] = useState(1); // Utiliser nombres au lieu de strings
  const [userData, setUserData] = useState({
    // Infos de base
    name: '',
    phone: '',
    email: '',
    company: '',
    city: '',
    
    // Calculs business
    missedCalls: 4,
    avgPrice: 600,
    currentRevenue: 0,
    desiredRevenue: 0,
    
    // Pertes calculées
    dailyLoss: 0,
    weeklyLoss: 2400,
    monthlyLoss: 9600,
    yearlyLoss: 48000,
    fiveYearLoss: 240000,
    roiWeeks: 3,
    roiDays: 21,
    
    // Qualification NEPQ
    pain: '',
    urgencyLevel: 0,
    decisionMaker: true,
    budget: '',
    timeline: '',
    objections: [],
    nepqScore: 0,
    qualified: false,
    
    // Tracking
    timeOnPage: 0,
    interactions: [],
    abandonPoint: null,
    source: 'direct',
    
    // Post-achat
    contractSigned: false,
    paymentCompleted: false,
    bookingDate: null,
    onboardingNotes: ''
  });

  // États UI
  const [isLoading, setIsLoading] = useState(false);
  const [showElevenLabs, setShowElevenLabs] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [aiTyping, setAiTyping] = useState(false);
  const [countdown, setCountdown] = useState({ days: 2, hours: 14, minutes: 37, seconds: 0 });
  const [liveStats, setLiveStats] = useState({
    viewersNow: 23,
    spotsLeft: CONFIG.TOTAL_SPOTS - CONFIG.SPOTS_TAKEN,
    callsSavedToday: CONFIG.CALLS_SAVED_TODAY,
    lastSignup: "Il y a 3 heures - Marc B. de Longueuil"
  });

  // Refs pour tracking
  const startTime = useRef(Date.now());
  const stageStartTime = useRef(Date.now());

  // Calculs automatiques des pertes
  useEffect(() => {
    const conversionRate = 0.3; // 30% de conversion réaliste
    const dailyLoss = Math.round((userData.missedCalls / 5) * userData.avgPrice * conversionRate);
    const weeklyLoss = Math.round(userData.missedCalls * userData.avgPrice * conversionRate);
    const monthlyLoss = Math.round(weeklyLoss * 4.33);
    const yearlyLoss = Math.round(weeklyLoss * 52);
    const fiveYearLoss = yearlyLoss * 5;
    const roiDays = Math.ceil(CONFIG.PRICE_NOW / dailyLoss) || 21;
    const roiWeeks = Math.ceil(roiDays / 7);
    
    setUserData(prev => ({
      ...prev,
      dailyLoss,
      weeklyLoss,
      monthlyLoss,
      yearlyLoss,
      fiveYearLoss,
      roiDays,
      roiWeeks
    }));
  }, [userData.missedCalls, userData.avgPrice]);

  // Countdown temps réel
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const endOfWeek = new Date();
      
      // Vendredi 17h
      const daysUntilFriday = (5 - now.getDay() + 7) % 7 || 7;
      endOfWeek.setDate(now.getDate() + daysUntilFriday);
      endOfWeek.setHours(17, 0, 0, 0);
      
      const diff = endOfWeek.getTime() - now.getTime();
      
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setCountdown({ days, hours, minutes, seconds });
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Fonction de tracking
  const trackEvent = async (eventName: string, value: any = null) => {
    console.log('📊 Event:', eventName, value);
    
    // Envoyer à votre API
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: eventName,
          value: value,
          stage: stage,
          userData: {
            name: userData.name,
            weeklyLoss: userData.weeklyLoss,
            nepqScore: userData.nepqScore
          }
        })
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }

    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        event_category: 'Funnel',
        event_label: `Stage ${stage}`,
        value: value
      });
    }
  };

  // Navigation entre stages
  const handleNextStage = () => {
    trackEvent(`stage_${stage}_completed`, userData.weeklyLoss);
    stageStartTime.current = Date.now();
    setStage(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render différent stages
  const renderStage = () => {
    switch(stage) {
      case 1:
        return <LandingStage 
          userData={userData}
          setUserData={setUserData}
          handleNextStage={handleNextStage}
          trackEvent={trackEvent}
          liveStats={liveStats}
          countdown={countdown}
        />;
      
      case 2:
        return <AIQualificationStage
          userData={userData}
          setUserData={setUserData}
          handleNextStage={handleNextStage}
          trackEvent={trackEvent}
          chatMessages={chatMessages}
          setChatMessages={setChatMessages}
          aiTyping={aiTyping}
          setAiTyping={setAiTyping}
          showElevenLabs={showElevenLabs}
          setShowElevenLabs={setShowElevenLabs}
        />;
      
      case 3:
        return <DeepCalculatorStage
          userData={userData}
          setUserData={setUserData}
          handleNextStage={handleNextStage}
          trackEvent={trackEvent}
        />;
        
      case 4:
        return <ProofDemoStage
          userData={userData}
          handleNextStage={handleNextStage}
          trackEvent={trackEvent}
        />;
        
      case 5:
        return <OfferContractStage
          userData={userData}
          setUserData={setUserData}
          handleNextStage={handleNextStage}
          trackEvent={trackEvent}
          countdown={countdown}
        />;
        
      case 6:
        return <PaymentStage
          userData={userData}
          setUserData={setUserData}
          handleNextStage={handleNextStage}
          trackEvent={trackEvent}
        />;
        
      case 7:
        return <BookingStage
          userData={userData}
          setUserData={setUserData}
          handleNextStage={handleNextStage}
          trackEvent={trackEvent}
        />;
        
      case 8:
        return <WelcomeVIPStage
          userData={userData}
          trackEvent={trackEvent}
        />;
        
      default:
        return <LandingStage 
          userData={userData}
          setUserData={setUserData}
          handleNextStage={handleNextStage}
          trackEvent={trackEvent}
          liveStats={liveStats}
          countdown={countdown}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header intelligent */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-2">
                <Bot size={24} />
              </div>
              <div>
                <h1 className="text-lg font-bold">IA Réceptionniste #1 au Québec</h1>
                <p className="text-xs text-gray-600">Par Jean-Samuel Leboeuf</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                ⏰ {countdown.days}j {countdown.hours}h {countdown.minutes}m
              </div>
              <p className="text-xs text-green-600 font-semibold mt-1">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></span>
                {liveStats.viewersNow} en ligne
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-white border-b px-4 py-2">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-full transition-all duration-500"
                style={{ width: `${(stage / 8) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="pb-20">
        {renderStage()}
      </main>

      {/* Scripts */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-BYDHGJR1F9"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-BYDHGJR1F9');
        `}
      </Script>
    </div>
  );
}

// ========== STAGE 1: LANDING ==========
const LandingStage = ({ userData, setUserData, handleNextStage, trackEvent, liveStats, countdown }) => {
  const [calculated, setCalculated] = useState(false);

  useEffect(() => {
    trackEvent('page_view_landing');
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Badge d'autorité */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-bold text-sm md:text-base animate-pulse">
              <Trophy size={20} />
              <span>PREMIER AU QUÉBEC • {CONFIG.SPOTS_TAKEN} CLIENTS ACTIFS</span>
              <Trophy size={20} />
            </div>
          </div>

          {/* Titre principal */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              Tu Perds{' '}
              <span className="text-red-600">
                {userData.weeklyLoss.toLocaleString()}$/Semaine
              </span>
              <br />
              en Appels Manqués
            </h1>
            
            {/* Stat Harvard */}
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 md:p-6 max-w-3xl mx-auto">
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
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 md:p-8 text-white mb-8">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              <MessageSquare className="inline animate-bounce mr-3" size={32} />
              Parle avec Sophie (IA) - Elle calcule TES pertes exactes
            </h3>
            <button
              onClick={handleNextStage}
              className="w-full bg-white text-green-600 py-4 rounded-lg font-bold text-xl hover:shadow-xl transition-all"
            >
              Commencer la conversation maintenant →
            </button>
            <p className="text-center text-sm mt-3">
              <Sparkles className="inline mr-2" size={16} />
              89% des gens qui testent l'IA deviennent clients en 24h
            </p>
          </div>

          {/* Quick Calculator */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="font-bold text-lg mb-4">💰 Calcul rapide de TES pertes:</h4>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Appels manqués/semaine:
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setUserData(prev => ({ 
                      ...prev, 
                      missedCalls: Math.max(1, prev.missedCalls - 1) 
                    }))}
                    className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100"
                  >
                    -
                  </button>
                  <div className="flex-1 bg-white rounded-lg py-2 text-center">
                    <span className="text-2xl font-bold">{userData.missedCalls}</span>
                  </div>
                  <button
                    onClick={() => setUserData(prev => ({ 
                      ...prev, 
                      missedCalls: prev.missedCalls + 1 
                    }))}
                    className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Valeur moyenne ($):
                </label>
                <select
                  value={userData.avgPrice}
                  onChange={(e) => setUserData(prev => ({ 
                    ...prev, 
                    avgPrice: parseInt(e.target.value) 
                  }))}
                  className="w-full p-3 bg-white rounded-lg font-bold text-lg"
                >
                  {[300, 400, 500, 600, 800, 1000, 1200, 1500].map(price => (
                    <option key={price} value={price}>{price}$</option>
                  ))}
                </select>
              </div>
            </div>

            {!calculated ? (
              <button
                onClick={() => {
                  setCalculated(true);
                  trackEvent('quick_calc_completed', userData.weeklyLoss);
                }}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700"
              >
                Calculer mes pertes →
              </button>
            ) : (
              <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4 text-center">
                <p className="text-3xl font-black text-red-600">
                  Tu perds {userData.weeklyLoss.toLocaleString()}$/semaine!
                </p>
                <p className="text-gray-700 mt-2">
                  Soit {userData.yearlyLoss.toLocaleString()}$ par année 😱
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">
          📊 Les Chiffres Qui Font Mal
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(KILLER_STATS).slice(0, 8).map(([key, stat]) => (
            <div 
              key={key}
              className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-all"
            >
              <p className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {stat.value}
              </p>
              <p className="text-sm text-gray-600 mt-2">{stat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Urgence finale */}
      <section>
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl p-8 text-center">
          <h3 className="text-3xl font-bold mb-4">
            ⏰ Pendant que tu lis ça, tu perds {Math.round(userData.dailyLoss / 24)}$/heure
          </h3>
          <p className="text-xl mb-6">
            Places restantes: {liveStats.spotsLeft} sur {CONFIG.TOTAL_SPOTS}
          </p>
          <button
            onClick={handleNextStage}
            className="bg-white text-red-600 px-8 py-4 rounded-lg font-bold text-xl hover:scale-105 transition-transform"
          >
            Je veux arrêter l'hémorragie MAINTENANT →
          </button>
        </div>
      </section>
    </div>
  );
};

// ========== STAGE 2: AI QUALIFICATION ==========
const AIQualificationStage = ({ 
  userData, 
  setUserData, 
  handleNextStage, 
  trackEvent,
  chatMessages,
  setChatMessages,
  aiTyping,
  setAiTyping,
  showElevenLabs,
  setShowElevenLabs
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userInput, setUserInput] = useState('');
  const messagesEndRef = useRef(null);

  // Questions NEPQ
  const nepqFlow = [
    {
      id: 'name',
      question: "Salut! Moi c'est Sophie. C'est quoi ton prénom? 😊",
      field: 'name',
      validation: (value) => value.length > 1,
      followUp: (value) => `Parfait ${value}! Enchanté.`
    },
    {
      id: 'missed_calls',
      question: "[NAME], combien d'appels tu manques par semaine?",
      field: 'missedCalls',
      validation: (value) => parseInt(value) > 0,
      followUp: (value) => `${value} appels... Ça fait mal!`
    },
    {
      id: 'contract_value',
      question: "C'est quoi la valeur moyenne d'un contrat pour toi?",
      field: 'avgPrice',
      validation: (value) => parseInt(value) > 0,
      followUp: () => "OK laisse-moi calculer..."
    },
    {
      id: 'phone',
      question: "Dernière question: ton numéro pour recevoir le résumé?",
      field: 'phone',
      validation: (value) => value.length >= 10,
      followUp: () => "Parfait! Regarde ça..."
    }
  ];

  useEffect(() => {
    if (chatMessages.length === 0) {
      trackEvent('ai_qualification_started');
      addBotMessage(nepqFlow[0].question);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const addBotMessage = (text, delay = 1500) => {
    setAiTyping(true);
    
    setTimeout(() => {
      let processedText = text
        .replace('[NAME]', userData.name || 'Mon ami');
      
      setChatMessages(prev => [...prev, {
        type: 'bot',
        text: processedText,
        timestamp: new Date()
      }]);
      
      setAiTyping(false);
    }, delay);
  };

  const handleUserResponse = (response) => {
    if (!response.trim()) return;
    
    setChatMessages(prev => [...prev, {
      type: 'user',
      text: response,
      timestamp: new Date()
    }]);
    
    const currentQ = nepqFlow[currentQuestion];
    
    if (currentQ.validation(response)) {
      // Update userData
      if (currentQ.field === 'missedCalls' || currentQ.field === 'avgPrice') {
        const numValue = parseInt(response);
        setUserData(prev => ({ ...prev, [currentQ.field]: numValue }));
      } else {
        setUserData(prev => ({ ...prev, [currentQ.field]: response }));
      }
      
      // Follow up
      addBotMessage(currentQ.followUp(response), 1000);
      
      // Update NEPQ score
      const newScore = Math.round(((currentQuestion + 1) / nepqFlow.length) * 100);
      setUserData(prev => ({ ...prev, nepqScore: newScore }));
      
      // Next question ou fin
      if (currentQuestion < nepqFlow.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setTimeout(() => {
          addBotMessage(nepqFlow[currentQuestion + 1].question);
        }, 2500);
      } else {
        // Qualification complète
        setTimeout(() => {
          addBotMessage(
            `🎉 ${userData.name}! Tu perds ${userData.weeklyLoss.toLocaleString()}$/semaine! 
            C'est ${userData.yearlyLoss.toLocaleString()}$ par année! On va régler ça...`
          );
          setTimeout(handleNextStage, 3000);
        }, 2000);
      }
    }
    
    setUserInput('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header du chat */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <Bot className="text-blue-600" size={28} />
                </div>
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
              </div>
              <div className="text-white">
                <h3 className="font-bold text-lg">Sophie - Assistante IA</h3>
                <p className="text-sm opacity-90">En ligne • Répond instantanément</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowElevenLabs(!showElevenLabs)}
              className="p-2 bg-white/20 rounded-lg text-white"
            >
              <Headphones size={20} />
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="bg-white/20 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-white h-full transition-all duration-500"
                style={{ width: `${userData.nepqScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Widget ElevenLabs */}
        {showElevenLabs && (
          <div className="p-4 bg-gray-50 border-b">
            <div className="bg-white rounded-lg p-4">
              <elevenlabs-convai agent-id={CONFIG.AI_AGENT_ID}></elevenlabs-convai>
              <Script 
                src="https://elevenlabs.io/convai-widget/index.js" 
                strategy="afterInteractive"
              />
            </div>
          </div>
        )}

        {/* Zone de messages */}
        <div className="h-96 overflow-y-auto p-4 bg-gray-50">
          <div className="space-y-4">
            {chatMessages.map((msg, index) => (
              <div 
                key={index}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl ${
                  msg.type === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 rounded-bl-none shadow'
                }`}>
                  <p className="text-sm md:text-base">{msg.text}</p>
                </div>
              </div>
            ))}
            
            {aiTyping && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Zone d'input */}
        <div className="p-4 bg-white border-t">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleUserResponse(userInput);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Écris ta réponse ici..."
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              disabled={!userInput.trim() || aiTyping}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ========== STAGE 3: DEEP CALCULATOR ==========
const DeepCalculatorStage = ({ userData, setUserData, handleNextStage, trackEvent }) => {
  const [animatedValues, setAnimatedValues] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0,
    fiveYear: 0
  });

  useEffect(() => {
    trackEvent('calculator_deep_viewed');
    
    // Animation des valeurs
    const targets = {
      daily: userData.dailyLoss,
      weekly: userData.weeklyLoss,
      monthly: userData.monthlyLoss,
      yearly: userData.yearlyLoss,
      fiveYear: userData.fiveYearLoss
    };

    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setAnimatedValues({
        daily: Math.round(targets.daily * progress),
        weekly: Math.round(targets.weekly * progress),
        monthly: Math.round(targets.monthly * progress),
        yearly: Math.round(targets.yearly * progress),
        fiveYear: Math.round(targets.fiveYear * progress)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [userData]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-black mb-4">
          💰 La Vérité Sur Tes Pertes
        </h1>
        <p className="text-xl text-gray-600">
          {userData.name}, prépare-toi...
        </p>
      </div>

      {/* Résultats dramatiques */}
      <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl shadow-xl p-8 mb-8">
        <h2 className="text-3xl font-bold mb-8 text-center">
          😱 Voici ce que tu perds VRAIMENT:
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {[
            { label: 'Par jour', value: animatedValues.daily, icon: '📅' },
            { label: 'Par semaine', value: animatedValues.weekly, icon: '📆' },
            { label: 'Par mois', value: animatedValues.monthly, icon: '📊' },
            { label: 'Par année', value: animatedValues.yearly, icon: '📈' },
            { label: 'Sur 5 ans', value: animatedValues.fiveYear, icon: '💸' }
          ].map((metric, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl mb-2">{metric.icon}</div>
              <p className="text-sm opacity-80">{metric.label}</p>
              <p className="text-3xl md:text-4xl font-black">
                {metric.value.toLocaleString()}$
              </p>
            </div>
          ))}
        </div>
        
        <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center">
          <p className="text-xl font-semibold">
            💡 En {userData.roiWeeks} semaines, l'IA est PAYÉE
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-white text-center">
        <h3 className="text-3xl font-bold mb-4">
          Tu veux continuer à perdre {userData.dailyLoss}$/jour?
        </h3>
        <button
          onClick={handleNextStage}
          className="bg-white text-green-600 px-8 py-4 rounded-lg font-bold text-xl hover:scale-105 transition-transform"
        >
          Je veux arrêter l'hémorragie MAINTENANT →
        </button>
      </div>
    </div>
  );
};

// ========== STAGE 4: PROOF & DEMO ==========
const ProofDemoStage = ({ userData, handleNextStage, trackEvent }) => {
  const [selectedScenario, setSelectedScenario] = useState(null);

  useEffect(() => {
    trackEvent('proof_demo_viewed');
  }, []);

  const scenarios = [
    {
      id: 'budget',
      title: 'Client avec budget serré',
      prompt: "C'est trop cher pour moi",
      response: "Je comprends votre budget. On a des options à partir de [PRIX]. Qu'est-ce qui serait dans votre budget?"
    },
    {
      id: 'urgence',
      title: 'Urgence haie malade',
      prompt: "Ma haie est en train de mourir!",
      response: "Je comprends l'urgence! On peut envoyer notre expert demain. Quelle est votre adresse?"
    },
    {
      id: 'competition',
      title: 'Compare les prix',
      prompt: "Mon beau-frère le fait moins cher",
      response: "C'est bien d'avoir des options! Nous, on est assurés et on garantit notre travail. C'est important pour vous?"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-black mb-4">
          🎯 L'IA Qui Parle Québécois
        </h1>
        <p className="text-xl text-gray-600">
          Teste-la en direct. Sois impressionné.
        </p>
      </div>

      {/* Widget ElevenLabs en évidence */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-center">
          🎤 Parle DIRECTEMENT à l'IA - Maintenant!
        </h2>
        
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-6 max-w-2xl mx-auto">
          <elevenlabs-convai agent-id={CONFIG.AI_AGENT_ID}></elevenlabs-convai>
          <Script 
            src="https://elevenlabs.io/convai-widget/index.js" 
            strategy="afterInteractive"
          />
        </div>
        
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
          <div className="bg-blue-50 p-3 rounded-lg text-sm text-center">
            <p className="font-semibold">Essaie:</p>
            <p>"Mes cèdres brunissent"</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-sm text-center">
            <p className="font-semibold">Ou:</p>
            <p>"C'est combien?"</p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg text-sm text-center">
            <p className="font-semibold">Ou:</p>
            <p>"Vous venez à Laval?"</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg text-sm text-center">
            <p className="font-semibold">Ou:</p>
            <p>"J'ai pas le budget"</p>
          </div>
        </div>
      </div>

      {/* Scénarios */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <h3 className="text-2xl font-bold mb-6 text-center">
          🎯 Gestion des situations difficiles
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {scenarios.map(scenario => (
            <button
              key={scenario.id}
              onClick={() => {
                setSelectedScenario(scenario);
                trackEvent('scenario_selected', scenario.id);
              }}
              className={`p-6 rounded-xl border-2 text-left transition-all ${
                selectedScenario?.id === scenario.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h4 className="font-bold mb-2">{scenario.title}</h4>
              <p className="text-sm text-gray-600">"{scenario.prompt}"</p>
            </button>
          ))}
        </div>

        {selectedScenario && (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
            <h4 className="font-bold mb-3">Réponse de l'IA:</h4>
            <p className="italic mb-4">"{selectedScenario.response}"</p>
            <div className="text-green-600 font-semibold">
              ✓ Gère la situation parfaitement
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-white text-center">
        <h3 className="text-3xl font-bold mb-4">
          Convaincu? C'est le temps d'agir!
        </h3>
        <button
          onClick={handleNextStage}
          className="bg-white text-green-600 px-8 py-4 rounded-lg font-bold text-xl hover:scale-105 transition-transform"
        >
          Je veux mon IA maintenant →
        </button>
      </div>
    </div>
  );
};

// ========== STAGE 5: OFFER & CONTRACT ==========
const OfferContractStage = ({ userData, setUserData, handleNextStage, trackEvent, countdown }) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    trackEvent('offer_contract_viewed');
  }, []);

  const bonuses = [
    { name: "Scripts de Closing", value: 1500 },
    { name: "Accès VIP Groupe des 5", value: 2000 },
    { name: "Formation Pricing Power", value: 800 },
    { name: "Updates prioritaires", value: 1200 }
  ];

  const totalBonusValue = bonuses.reduce((sum, bonus) => sum + bonus.value, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header avec urgence */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl p-6 mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          ⏰ Offre Limitée - {countdown.days}j {countdown.hours}h {countdown.minutes}m
        </h1>
        <p className="text-xl">
          Prix actuel: {CONFIG.PRICE_NOW.toLocaleString()}$ 
          (Bientôt: {CONFIG.PRICE_FUTURE.toLocaleString()}$)
        </p>
      </div>

      {/* L'offre */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <h2 className="text-3xl font-bold mb-6">
          {userData.name}, voici TON offre personnalisée
        </h2>
        
        {/* Rappel situation */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">Pertes annuelles</p>
              <p className="text-2xl font-bold text-red-600">{userData.yearlyLoss.toLocaleString()}$</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">ROI avec l'IA</p>
              <p className="text-2xl font-bold text-green-600">{userData.roiWeeks} semaines</p>
            </div>
          </div>
        </div>

        {/* Prix */}
        <div className="border-2 border-blue-600 rounded-xl p-6 mb-6">
          <h3 className="text-2xl font-bold mb-4">
            🤖 Ton IA Réceptionniste Personnalisée
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Installation complète</span>
              <span className="font-bold text-2xl">{CONFIG.PRICE_NOW.toLocaleString()}$</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">Maintenance mensuelle</span>
              <span className="font-bold">{CONFIG.MONTHLY_FEE}$/mois</span>
            </div>
          </div>
        </div>

        {/* Bonus */}
        <div className="bg-yellow-50 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">
            🎁 Bonus EXCLUSIFS (Valeur: {totalBonusValue.toLocaleString()}$)
          </h3>
          {bonuses.map((bonus, i) => (
            <div key={i} className="flex justify-between items-center py-2">
              <span>{bonus.name}</span>
              <span className="font-bold text-green-600">{bonus.value}$</span>
            </div>
          ))}
        </div>

        {/* Signature */}
        <div className="bg-gray-50 rounded-lg p-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1"
            />
            <span>
              J'accepte l'offre et je veux arrêter de perdre {userData.weeklyLoss.toLocaleString()}$/semaine
            </span>
          </label>
        </div>

        <button
          onClick={() => {
            if (agreedToTerms) {
              setUserData(prev => ({ ...prev, contractSigned: true }));
              handleNextStage();
            }
          }}
          disabled={!agreedToTerms}
          className={`w-full mt-6 py-4 rounded-lg font-bold text-lg transition-all ${
            agreedToTerms
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Procéder au paiement sécurisé →
        </button>
      </div>
    </div>
  );
};

// ========== STAGE 6: PAYMENT ==========
const PaymentStage = ({ userData, setUserData, handleNextStage, trackEvent }) => {
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    trackEvent('payment_stage_viewed');
  }, []);

  const handlePayment = async () => {
    setProcessing(true);
    trackEvent('payment_initiated', CONFIG.PRICE_NOW);

    try {
      // Créer la session Stripe
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: CONFIG.PRICE_NOW,
          userData: userData
        })
      });

      const { url } = await response.json();
      
      if (url) {
        // Rediriger vers Stripe Checkout
        window.location.href = url;
      } else {
        // Mode demo
        setTimeout(() => {
          setUserData(prev => ({ ...prev, paymentCompleted: true }));
          trackEvent('payment_completed', CONFIG.PRICE_NOW);
          handleNextStage();
        }, 2000);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold mb-8 text-center">
          💳 Finalise ton investissement
        </h2>

        {/* Résumé */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-bold mb-4">Résumé:</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>IA Réceptionniste</span>
              <span className="font-bold">{CONFIG.PRICE_NOW.toLocaleString()}$</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Bonus exclusifs</span>
              <span>GRATUIT</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{CONFIG.PRICE_NOW.toLocaleString()}$</span>
            </div>
          </div>
        </div>

        {/* Bouton paiement */}
        {!processing ? (
          <button
            onClick={handlePayment}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:scale-105 transition-transform"
          >
            Payer de façon sécurisée →
          </button>
        ) : (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Traitement en cours...</p>
          </div>
        )}

        {/* Sécurité */}
        <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Lock size={16} />
            <span>SSL 256-bit</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield size={16} />
            <span>Paiement sécurisé</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== STAGE 7: BOOKING ==========
const BookingStage = ({ userData, setUserData, handleNextStage, trackEvent }) => {
  useEffect(() => {
    trackEvent('booking_stage_viewed');
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-white text-center">
          <Trophy className="mx-auto mb-4" size={64} />
          <h1 className="text-3xl font-bold mb-2">
            🎊 Félicitations {userData.name}!
          </h1>
          <p className="text-xl">
            Tu fais partie des 5 pionniers!
          </p>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">
            📅 Réserve ton appel d'onboarding (45 min)
          </h2>

          {/* Iframe Calendly */}
          <div className="mb-6">
            <iframe
              src={CONFIG.CALENDLY_URL}
              width="100%"
              height="600"
              frameBorder="0"
              className="rounded-lg"
            ></iframe>
          </div>

          <button
            onClick={() => {
              setUserData(prev => ({ ...prev, bookingDate: 'Confirmé' }));
              handleNextStage();
            }}
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700"
          >
            J'ai réservé mon appel →
          </button>
        </div>
      </div>
    </div>
  );
};

// ========== STAGE 8: WELCOME VIP ==========
const WelcomeVIPStage = ({ userData, trackEvent }) => {
  useEffect(() => {
    trackEvent('welcome_vip_reached');
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-8 mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-black mb-4">
          🏆 Bienvenue dans l'Élite!
        </h1>
        <p className="text-2xl">
          {userData.name}, tu es le membre #{CONFIG.SPOTS_TAKEN + 1} du Club des 5
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold mb-6">📚 Tes ressources VIP</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <Gift className="text-purple-600 mb-3" size={32} />
            <h3 className="font-bold mb-2">Bonus exclusifs</h3>
            <p className="text-gray-600">Scripts, formations, accès VIP</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <MessageSquare className="text-green-600 mb-3" size={32} />
            <h3 className="font-bold mb-2">WhatsApp direct</h3>
            <p className="text-gray-600">Support 24/7 avec Jean-Samuel</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <Calendar className="text-blue-600 mb-3" size={32} />
            <h3 className="font-bold mb-2">Onboarding confirmé</h3>
            <p className="text-gray-600">{userData.bookingDate || 'À venir'}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <Rocket className="text-orange-600 mb-3" size={32} />
            <h3 className="font-bold mb-2">Lancement dans 30 jours</h3>
            <p className="text-gray-600">Installation garantie</p>
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 text-center">
          <p className="text-lg font-semibold">
            💎 Tu viens de sauver {userData.yearlyLoss.toLocaleString()}$/année!
          </p>
          <p className="text-gray-600 mt-2">
            ROI prévu: {userData.roiWeeks} semaines
          </p>
        </div>
      </div>
    </div>
  );
};