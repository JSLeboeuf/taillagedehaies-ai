&apos;use client&apos;

import React, { useState, useEffect } from &apos;react&apos;
import {
  Phone, DollarSign, Clock, Check, AlertCircle, Shield,
  Building2, Calculator, ChevronRight, CreditCard, Lock,
  Star, Award, MessageSquare, Calendar, Video, Users,
  TrendingUp, Zap, Bot, Headphones, BarChart3, Target,
  Sparkles, Trophy, FileText, Send, Eye, Brain,
  CheckCircle, X, Mic, MicOff, Download, ExternalLink,
  Gift, Rocket, Heart, ThumbsUp, Bell
} from &apos;lucide-react&apos;

// Configuration centrale
const CONFIG = {
  STRIPE_PAYMENT_LINK: &apos;https://book.stripe.com/9B6aEX5XI1Rn9uJg3R6c007&apos;,
  HEYGEN_VIDEO_ID: &apos;7d66ab95a1c04a57817a97d426cb9303&apos;,
  SMS_FROM_NUMBER: &apos;+14389004385&apos;,
  GA_ID: &apos;G-BYDHGJR1F9&apos;,
  FB_PIXEL_ID: &apos;490629836&apos;,
  BUSINESS_NAME: &apos;Jean-Samuel Leboeuf&apos;,
}

// Types
interface UserData {
  stage: number
  name: string
  phone: string
  businessName: string
  currentReceptionist: string
  missedCallsPerWeek: number
  averageJobValue: number
  weeklyLoss: number
  urgency: string
  budget: string
  timeline: string
  decisionMaker: boolean
  nepqScore: number
  paymentCompleted: boolean
}

// Déclaration du widget ElevenLabs
declare global {
  namespace JSX {
    interface IntrinsicElements {
      &apos;elevenlabs-convai&apos;: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        &apos;agent-id&apos;: string;
      }, HTMLElement>;
    }
  }
}

export default function UltimateAIFunnel() {
  const [userData, setUserData] = useState<UserData>({
    stage: 1,
    name: &apos;&apos;,
    phone: &apos;&apos;,
    businessName: &apos;&apos;,
    currentReceptionist: &apos;&apos;,
    missedCallsPerWeek: 0,
    averageJobValue: 0,
    weeklyLoss: 0,
    urgency: &apos;&apos;,
    budget: &apos;&apos;,
    timeline: &apos;&apos;,
    decisionMaker: false,
    nepqScore: 0,
    paymentCompleted: false,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [showContract, setShowContract] = useState(false)
  const [contractAccepted, setContractAccepted] = useState(false)
  const [signature, setSignature] = useState(&apos;&apos;)
  const [phoneError, setPhoneError] = useState(&apos;&apos;)
  const [showVIPContent, setShowVIPContent] = useState(false)

  // Fonctions utilitaires
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat(&apos;fr-CA&apos;, {
      style: &apos;currency&apos;,
      currency: &apos;CAD&apos;,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, &apos;&apos;)
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  const trackEvent = (eventName: string, eventData: any = {}) => {
    console.log(&apos;📊 Event:&apos;, eventName, eventData)
    
    // Google Analytics
    if (typeof window !== &apos;undefined&apos; && (window as any).gtag) {
      (window as any).gtag(&apos;event&apos;, eventName, eventData)
    }
    
    // Facebook Pixel
    if (typeof window !== &apos;undefined&apos; && (window as any).fbq) {
      (window as any).fbq(&apos;track&apos;, eventName, eventData)
    }
  }

  const sendSMS = async (toNumber: string, message: string) => {
    try {
      const response = await fetch(&apos;/api/send-sms&apos;, {
        method: &apos;POST&apos;,
        headers: { &apos;Content-Type&apos;: &apos;application/json&apos; },
        body: JSON.stringify({ to: toNumber, message }),
      })
      
      if (!response.ok) {
        throw new Error(&apos;SMS sending failed&apos;)
      }
      
      const result = await response.json()
      console.log(&apos;📱 SMS sent:&apos;, result)
      return result
    } catch (error) {
      console.error(&apos;❌ SMS Error:&apos;, error)
      return null
    }
  }

  useEffect(() => {
    trackEvent(&apos;page_view&apos;, { page: &apos;ai_funnel_landing&apos; })
    
    // Load ElevenLabs script
    const script = document.createElement(&apos;script&apos;)
    script.src = &apos;https://elevenlabs.io/convai-widget/index.js&apos;
    script.async = true
    document.body.appendChild(script)
    
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const updateUserData = (data: Partial<UserData>) => {
    setUserData(prev => ({ ...prev, ...data }))
  }

  const nextStage = () => {
    const newStage = userData.stage + 1
    updateUserData({ stage: newStage })
    trackEvent(&apos;stage_progress&apos;, { 
      from_stage: userData.stage, 
      to_stage: newStage,
      user_name: userData.name,
      weekly_loss: userData.weeklyLoss 
    })
    window.scrollTo(0, 0)
  }

  const calculateNEPQScore = () => {
    let score = 0
    if (userData.missedCallsPerWeek > 10) score += 30
    else if (userData.missedCallsPerWeek > 5) score += 20
    else if (userData.missedCallsPerWeek > 0) score += 10

    if (userData.weeklyLoss > 3000) score += 30
    else if (userData.weeklyLoss > 1500) score += 20
    else if (userData.weeklyLoss > 500) score += 10

    if (userData.urgency === &apos;urgent&apos;) score += 20
    else if (userData.urgency === &apos;soon&apos;) score += 10

    if (userData.budget === &apos;ready&apos;) score += 20
    else if (userData.budget === &apos;planned&apos;) score += 10

    return score
  }

  const handlePhoneSubmit = () => {
    const cleanPhone = userData.phone.replace(/\D/g, &apos;&apos;)
    if (cleanPhone.length !== 10) {
      setPhoneError(&apos;Numéro invalide. Format: (514) 123-4567&apos;)
      return
    }
    setPhoneError(&apos;&apos;)
    nextStage()
  }

  const handleQualificationComplete = async () => {
    const score = calculateNEPQScore()
    updateUserData({ nepqScore: score })
    
    trackEvent(&apos;qualification_complete&apos;, {
      nepq_score: score,
      weekly_loss: userData.weeklyLoss,
      urgency: userData.urgency,
      budget: userData.budget
    })

    // Envoyer SMS de qualification
    if (userData.phone) {
      const message = `Salut ${userData.name}! 🚨 Tu perds ${formatCurrency(userData.weeklyLoss)}/semaine en appels manqués. Notre IA peut régler ça en 30 jours. Prêt à arrêter les pertes? -${CONFIG.BUSINESS_NAME}`
      await sendSMS(userData.phone, message)
    }

    // Facebook Pixel Lead Event
    if (typeof window !== &apos;undefined&apos; && (window as any).fbq) {
      (window as any).fbq(&apos;track&apos;, &apos;Lead&apos;, {
        value: userData.weeklyLoss * 4,
        currency: &apos;CAD&apos;
      })
    }

    nextStage()
  }

  const handleContractSign = () => {
    if (!signature.trim()) {
      alert(&apos;Veuillez signer le contrat&apos;)
      return
    }
    setContractAccepted(true)
    trackEvent(&apos;contract_signed&apos;, {
      signature: signature,
      nepq_score: userData.nepqScore
    })
    setShowContract(false)
    nextStage()
  }

  const handlePaymentClick = () => {
    trackEvent(&apos;payment_initiated&apos;, {
      amount: 5000,
      weekly_loss: userData.weeklyLoss,
      nepq_score: userData.nepqScore
    })
    
    // Redirection vers Stripe avec metadata
    const stripeUrl = `${CONFIG.STRIPE_PAYMENT_LINK}?prefilled_email=${encodeURIComponent(userData.phone + &apos;@client.taillagedehaies.ai&apos;)}&client_reference_id=${userData.phone}`
    window.location.href = stripeUrl
  }

  // Stage 1: Landing Hero
  const renderLanding = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full opacity-20 blur-3xl animate-pulse" style={{animationDelay: &apos;0.7s&apos;}}></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Trust badges */}
        <div className="flex justify-center mb-8 space-x-6 opacity-80">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-sm">Sécurisé</span>
          </div>
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-yellow-400" />
            <span className="text-sm">#1 au Québec</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-sm">500+ Clients</span>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-4xl mx-auto text-center">
          {/* Urgency banner */}
          <div className="inline-flex items-center bg-red-500/20 border border-red-500/50 rounded-full px-6 py-2 mb-8 animate-pulse">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="font-semibold">Tu perds de l&apos;argent MAINTENANT</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            Combien d&apos;Appels Tu <span className="text-red-400">PERDS</span> Chaque Semaine?
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Ton concurrent a une IA qui répond 24/7... <span className="text-yellow-300">Pas toi.</span>
          </p>

          {/* Value props */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <Phone className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">0 Appel Manqué</h3>
              <p className="text-sm text-blue-100">IA répond instantanément 24/7</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <DollarSign className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">+2400$/Semaine</h3>
              <p className="text-sm text-blue-100">Revenue moyen récupéré</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <Clock className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">30 Jours</h3>
              <p className="text-sm text-blue-100">Installation complète</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-3xl p-8 mb-8 transform hover:scale-105 transition-all">
            <h2 className="text-2xl font-bold mb-4">Découvre EXACTEMENT Combien Tu Perds</h2>
            <p className="mb-6">Calculateur IA Gratuit • 2 Minutes • Résultats Instantanés</p>
            <button
              onClick={nextStage}
              className="bg-white text-red-600 px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all inline-flex items-center"
            >
              Calculer Mes Pertes <ChevronRight className="ml-2" />
            </button>
          </div>

          {/* Social proof */}
          <div className="flex flex-col items-center space-y-4">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-2 border-white"></div>
              ))}
            </div>
            <p className="text-sm text-blue-200">
              <span className="font-bold text-white">523 entreprises</span> ont récupéré <span className="font-bold text-yellow-300">+1.2M$</span> ce mois
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  // Stage 2: Contact Info
  const renderContactInfo = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <MessageSquare className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">On Commence! 🚀</h2>
            <p className="text-blue-200">Ton diagnostic personnalisé en 2 minutes</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Ton prénom</label>
              <input
                type="text"
                value={userData.name}
                onChange={(e) => updateUserData({ name: e.target.value })}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors"
                placeholder="Ex: Jean"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ton numéro de cell</label>
              <input
                type="tel"
                value={userData.phone}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value)
                  updateUserData({ phone: formatted })
                }}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors"
                placeholder="(514) 123-4567"
              />
              {phoneError && (
                <p className="text-red-400 text-sm mt-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {phoneError}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nom de ton entreprise</label>
              <input
                type="text"
                value={userData.businessName}
                onChange={(e) => updateUserData({ businessName: e.target.value })}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors"
                placeholder="Ex: Taillage Pro Inc."
              />
            </div>

            <button
              onClick={handlePhoneSubmit}
              disabled={!userData.name || !userData.phone || !userData.businessName}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl transform hover:scale-105 transition-all flex items-center justify-center"
            >
              Continuer <ChevronRight className="ml-2" />
            </button>
          </div>

          <p className="text-xs text-center mt-6 text-blue-200">
            <Lock className="w-3 h-3 inline mr-1" />
            100% confidentiel • Aucun spam
          </p>
        </div>
      </div>
    </div>
  )

  // Stage 3: AI Qualification
  const renderQualification = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 text-white p-4">
      <div className="max-w-2xl mx-auto py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">
            Salut {userData.name}! 👋 Analysons tes pertes...
          </h2>
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 inline-flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-yellow-400" />
            <span>Réponds honnêtement pour un diagnostic précis</span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Question 1: Current receptionist */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold mb-4">Qui répond présentement à tes appels?</h3>
            <div className="grid gap-3">
              {[&apos;Moi-même&apos;, &apos;Ma conjointe&apos;, &apos;Un(e) employé(e)&apos;, &apos;Service de réponse&apos;, &apos;Personne&apos;].map((option) => (
                <button
                  key={option}
                  onClick={() => updateUserData({ currentReceptionist: option })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    userData.currentReceptionist === option
                      ? &apos;bg-blue-600 border-blue-400&apos;
                      : &apos;bg-white/10 border-white/20 hover:border-blue-400&apos;
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Question 2: Missed calls */}
          {userData.currentReceptionist && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold mb-4">Combien d&apos;appels tu manques par semaine?</h3>
              <input
                type="range"
                min="0"
                max="50"
                value={userData.missedCallsPerWeek}
                onChange={(e) => updateUserData({ missedCallsPerWeek: parseInt(e.target.value) })}
                className="w-full mb-4"
              />
              <div className="text-center">
                <span className="text-4xl font-bold text-yellow-400">{userData.missedCallsPerWeek}</span>
                <span className="text-xl ml-2">appels/semaine</span>
              </div>
            </div>
          )}

          {/* Question 3: Average job value */}
          {userData.missedCallsPerWeek > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold mb-4">Valeur moyenne d&apos;un contrat?</h3>
              <div className="grid grid-cols-2 gap-3">
                {[500, 750, 1000, 1500, 2000, 3000].map((value) => (
                  <button
                    key={value}
                    onClick={() => {
                      updateUserData({ 
                        averageJobValue: value,
                        weeklyLoss: userData.missedCallsPerWeek * value * 0.3 // 30% conversion
                      })
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      userData.averageJobValue === value
                        ? &apos;bg-green-600 border-green-400&apos;
                        : &apos;bg-white/10 border-white/20 hover:border-green-400&apos;
                    }`}
                  >
                    {formatCurrency(value)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loss calculator display */}
          {userData.weeklyLoss > 0 && (
            <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">💸 Tu PERDS Actuellement:</h3>
                <div className="text-5xl font-black text-yellow-300 mb-2">
                  {formatCurrency(userData.weeklyLoss)}/sem
                </div>
                <p className="text-lg">Soit {formatCurrency(userData.weeklyLoss * 52)}/année!</p>
              </div>
            </div>
          )}

          {/* Question 4: Urgency */}
          {userData.weeklyLoss > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold mb-4">À quel point c&apos;est urgent de régler ça?</h3>
              <div className="grid gap-3">
                <button
                  onClick={() => updateUserData({ urgency: &apos;urgent&apos; })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    userData.urgency === &apos;urgent&apos;
                      ? &apos;bg-red-600 border-red-400&apos;
                      : &apos;bg-white/10 border-white/20 hover:border-red-400&apos;
                  }`}
                >
                  🚨 URGENT - Je perds trop d&apos;argent
                </button>
                <button
                  onClick={() => updateUserData({ urgency: &apos;soon&apos; })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    userData.urgency === &apos;soon&apos;
                      ? &apos;bg-orange-600 border-orange-400&apos;
                      : &apos;bg-white/10 border-white/20 hover:border-orange-400&apos;
                  }`}
                >
                  ⏰ Bientôt - Dans les prochaines semaines
                </button>
                <button
                  onClick={() => updateUserData({ urgency: &apos;exploring&apos; })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    userData.urgency === &apos;exploring&apos;
                      ? &apos;bg-blue-600 border-blue-400&apos;
                      : &apos;bg-white/10 border-white/20 hover:border-blue-400&apos;
                  }`}
                >
                  🔍 J&apos;explore mes options
                </button>
              </div>
            </div>
          )}

          {/* Question 5: Budget */}
          {userData.urgency && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold mb-4">As-tu le budget pour investir dans une solution?</h3>
              <div className="grid gap-3">
                <button
                  onClick={() => updateUserData({ budget: &apos;ready&apos; })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    userData.budget === &apos;ready&apos;
                      ? &apos;bg-green-600 border-green-400&apos;
                      : &apos;bg-white/10 border-white/20 hover:border-green-400&apos;
                  }`}
                >
                  ✅ Oui, prêt à investir maintenant
                </button>
                <button
                  onClick={() => updateUserData({ budget: &apos;planned&apos; })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    userData.budget === &apos;planned&apos;
                      ? &apos;bg-yellow-600 border-yellow-400&apos;
                      : &apos;bg-white/10 border-white/20 hover:border-yellow-400&apos;
                  }`}
                >
                  📅 Oui, mais dans quelques mois
                </button>
                <button
                  onClick={() => updateUserData({ budget: &apos;tight&apos; })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    userData.budget === &apos;tight&apos;
                      ? &apos;bg-gray-600 border-gray-400&apos;
                      : &apos;bg-white/10 border-white/20 hover:border-gray-400&apos;
                  }`}
                >
                  ❌ Non, budget serré
                </button>
              </div>
            </div>
          )}

          {/* Complete qualification */}
          {userData.budget && (
            <button
              onClick={handleQualificationComplete}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-6 rounded-xl font-bold text-xl hover:shadow-2xl transform hover:scale-105 transition-all flex items-center justify-center"
            >
              Voir Mon Plan d&apos;Action Personnalisé <ChevronRight className="ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  )

  // Stage 4: Results & Demo
  const renderResults = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white p-4">
      <div className="max-w-4xl mx-auto py-12">
        {/* Results Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-red-600 text-white px-6 py-3 rounded-full mb-6">
            <AlertCircle className="w-6 h-6 mr-2" />
            <span className="font-bold text-lg">ALERTE PERTE FINANCIÈRE</span>
          </div>
          
          <h1 className="text-4xl font-bold mb-4">
            {userData.name}, tu perds {formatCurrency(userData.weeklyLoss * 52)}/année!
          </h1>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 max-w-2xl mx-auto">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-red-400">{userData.missedCallsPerWeek}</p>
                <p className="text-sm">Appels manqués/sem</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-400">{formatCurrency(userData.weeklyLoss)}</p>
                <p className="text-sm">Pertes/semaine</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-orange-400">{formatCurrency(userData.weeklyLoss * 52)}</p>
                <p className="text-sm">Pertes/année</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Demo Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">
            🎯 Voici EXACTEMENT Comment Notre IA Va Sauver Tes Appels
          </h2>
          
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 mb-8">
            <h3 className="text-2xl font-bold mb-4 text-center">
              🔥 DÉMO LIVE - Appelle et Teste l&apos;IA MAINTENANT!
            </h3>
            
            <div className="bg-black/30 rounded-2xl p-6 mb-6">
              <div className="text-center mb-4">
                <p className="text-yellow-300 font-bold text-xl mb-2">
                  📞 APPELLE MAINTENANT: (438) 900-4385
                </p>
                <p className="text-sm opacity-80">Ou clique sur le widget pour parler à l&apos;IA</p>
              </div>
              
              {/* AI Widget */}
              <div className="bg-white rounded-xl p-4 text-gray-900 min-h-[400px]">
                <div 
                  dangerouslySetInnerHTML={{
                    __html: &apos;<elevenlabs-convai agent-id="agent_01jw7kxhkjef2tvn7a6jwpt4e9"></elevenlabs-convai>&apos;
                  }}
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-xl p-4">
                <h4 className="font-bold mb-2">✅ Ce que l&apos;IA fait:</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Répond en français québécois</li>
                  <li>• Qualifie les clients</li>
                  <li>• Prend les infos de contact</li>
                  <li>• Envoie un SMS de suivi</li>
                </ul>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <h4 className="font-bold mb-2">🚀 Résultats garantis:</h4>
                <ul className="space-y-2 text-sm">
                  <li>• 0 appel manqué</li>
                  <li>• +30% de conversions</li>
                  <li>• Disponible 24/7</li>
                  <li>• ROI en 3 semaines</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Next steps */}
        <div className="text-center">
          <button
            onClick={nextStage}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-12 py-6 rounded-full font-bold text-xl hover:shadow-2xl transform hover:scale-105 transition-all inline-flex items-center"
          >
            Je Veux Cette IA Maintenant <Rocket className="ml-2" />
          </button>
          
          <p className="mt-4 text-sm opacity-80">
            ⏱️ Installation en 30 jours • 💰 Garanti ou remboursé
          </p>
        </div>
      </div>
    </div>
  )

  // Stage 5: Offer & Pricing
  const renderOffer = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white p-4">
      <div className="max-w-4xl mx-auto py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-full mb-6">
            <Trophy className="w-6 h-6 mr-2" />
            <span className="font-bold">OFFRE EXCLUSIVE - Valeur 15,000$</span>
          </div>
          
          <h1 className="text-4xl font-bold mb-4">
            Ton IA Réceptionniste Complète
          </h1>
          <p className="text-xl text-blue-200">
            Installation clé en main en 30 jours
          </p>
        </div>

        {/* What&apos;s included */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">✅ Tout Ce Qui Est Inclus:</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <Bot className="w-6 h-6 text-green-400 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold">IA Personnalisée</h3>
                  <p className="text-sm opacity-80">Voix québécoise, scripts sur mesure</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone className="w-6 h-6 text-blue-400 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold">Numéro Dédié</h3>
                  <p className="text-sm opacity-80">Ligne téléphonique professionnelle</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MessageSquare className="w-6 h-6 text-purple-400 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold">SMS Automatiques</h3>
                  <p className="text-sm opacity-80">Suivi instantané des leads</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Calendar className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold">Prise de RDV</h3>
                  <p className="text-sm opacity-80">Intégration calendrier automatique</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <BarChart3 className="w-6 h-6 text-orange-400 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold">Dashboard Analytics</h3>
                  <p className="text-sm opacity-80">Stats en temps réel</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Headphones className="w-6 h-6 text-red-400 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold">Support VIP</h3>
                  <p className="text-sm opacity-80">Ligne directe 24/7</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Brain className="w-6 h-6 text-indigo-400 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold">Formation Complète</h3>
                  <p className="text-sm opacity-80">Onboarding personnalisé</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Shield className="w-6 h-6 text-green-400 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold">Garantie ROI</h3>
                  <p className="text-sm opacity-80">Rentable en 3 semaines</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-3xl p-8 mb-8">
          <div className="text-center">
            <p className="text-xl mb-2 line-through opacity-60">Prix régulier: 15,000$</p>
            <p className="text-5xl font-black mb-2">5,000$ + 500$/mois</p>
            <p className="text-lg mb-6">Installation complète + Maintenance</p>
            
            <div className="bg-black/20 rounded-xl p-4 mb-6">
              <p className="font-bold text-xl mb-2">💰 Tu récupères {formatCurrency(userData.weeklyLoss)}/semaine</p>
              <p>ROI en seulement {Math.ceil(5000 / userData.weeklyLoss)} semaines!</p>
            </div>
            
            <button
              onClick={() => setShowContract(true)}
              className="bg-white text-orange-600 px-8 py-4 rounded-full font-bold text-xl hover:shadow-2xl transform hover:scale-105 transition-all inline-flex items-center"
            >
              Réserver Mon Installation <ChevronRight className="ml-2" />
            </button>
          </div>
        </div>

        {/* Urgency */}
        <div className="text-center">
          <div className="inline-flex items-center bg-red-600/20 border border-red-600 rounded-full px-6 py-3">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="font-bold">Seulement 3 installations disponibles ce mois</span>
          </div>
        </div>
      </div>

      {/* Contract Modal */}
      {showContract && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Contrat de Service - IA Réceptionniste</h2>
            
            <div className="bg-gray-800 rounded-xl p-6 mb-6 text-sm space-y-4">
              <p><strong>Client:</strong> {userData.name} - {userData.businessName}</p>
              <p><strong>Service:</strong> Installation et gestion d&apos;une IA réceptionniste</p>
              <p><strong>Investissement:</strong> 5,000$ installation + 500$/mois</p>
              <p><strong>Délai:</strong> Installation complète en 30 jours</p>
              
              <div className="border-t border-gray-700 pt-4">
                <h3 className="font-bold mb-2">Termes et conditions:</h3>
                <ul className="space-y-2">
                  <li>• Paiement initial de 5,000$ à la signature</li>
                  <li>• Frais mensuels de 500$ à partir du 2e mois</li>
                  <li>• Garantie de satisfaction 30 jours</li>
                  <li>• Support technique illimité inclus</li>
                  <li>• Mises à jour automatiques de l&apos;IA</li>
                  <li>• Annulation possible avec préavis de 30 jours</li>
                </ul>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Signature électronique</label>
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500"
                placeholder="Tapez votre nom complet"
              />
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={handleContractSign}
                disabled={!signature}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
              >
                Signer et Continuer
              </button>
              <button
                onClick={() => setShowContract(false)}
                className="flex-1 bg-gray-800 text-white py-3 rounded-xl font-bold hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // Stage 6: Payment
  const renderPayment = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-green-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <CreditCard className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Finaliser Mon Installation</h2>
            <p className="text-green-200">Paiement sécurisé via Stripe</p>
          </div>

          <div className="bg-green-600/20 border border-green-600 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-lg mb-4">Récapitulatif:</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Installation IA complète</span>
                <span className="font-bold">5,000$</span>
              </div>
              <div className="flex justify-between text-sm opacity-80">
                <span>Maintenance mensuelle</span>
                <span>500$/mois (à partir du mois 2)</span>
              </div>
              <div className="border-t border-green-600 pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total aujourd&apos;hui</span>
                  <span>5,000$ CAD</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handlePaymentClick}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all flex items-center justify-center"
          >
            <Lock className="w-5 h-5 mr-2" />
            Payer Maintenant via Stripe
          </button>

          <div className="mt-6 text-center text-sm opacity-80">
            <p className="mb-2">✅ Paiement 100% sécurisé</p>
            <p className="mb-2">✅ Garantie 30 jours satisfait ou remboursé</p>
            <p>✅ Installation commence dans 24h</p>
          </div>
        </div>
      </div>
    </div>
  )

  // Stage 7: VIP Onboarding
  const renderOnboarding = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 text-white p-4">
      <div className="max-w-4xl mx-auto py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-gradient-to-r from-yellow-600 to-yellow-500 text-black px-6 py-3 rounded-full mb-6">
            <Trophy className="w-6 h-6 mr-2" />
            <span className="font-bold">BIENVENUE DANS LE CLUB VIP!</span>
          </div>
          
          <h1 className="text-4xl font-bold mb-4">
            Félicitations {userData.name}! 🎉
          </h1>
          <p className="text-xl text-pink-200">
            Tu fais maintenant partie de l&apos;élite qui ne perd JAMAIS d&apos;appels
          </p>
        </div>

        {/* Video welcome */}
        <div className="bg-black/30 rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">
            📹 Message Personnel de Bienvenue
          </h2>
          <div className="aspect-video bg-gray-800 rounded-xl overflow-hidden">
            <iframe
              src={`https://app.heygen.com/embeds/${CONFIG.HEYGEN_VIDEO_ID}`}
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        </div>

        {/* Next steps */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold mb-6">🚀 Prochaines Étapes (24-48h)</h2>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-green-600 rounded-full p-2 mr-4 flex-shrink-0">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">1. Appel de Bienvenue</h3>
                <p className="opacity-80">Notre équipe VIP te contacte dans les 24h</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-blue-600 rounded-full p-2 mr-4 flex-shrink-0">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">2. Configuration de ton IA</h3>
                <p className="opacity-80">Scripts personnalisés pour ton entreprise</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-purple-600 rounded-full p-2 mr-4 flex-shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">3. Tests et Formation</h3>
                <p className="opacity-80">Tu testes l&apos;IA et on ajuste ensemble</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-yellow-600 rounded-full p-2 mr-4 flex-shrink-0">
                <Rocket className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">4. Lancement Officiel</h3>
                <p className="opacity-80">Ton IA commence à sauver des appels!</p>
              </div>
            </div>
          </div>
        </div>

        {/* VIP benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-center">
            <Headphones className="w-12 h-12 mx-auto mb-3" />
            <h3 className="font-bold mb-2">Support VIP 24/7</h3>
            <p className="text-sm opacity-90">Ligne directe prioritaire</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-center">
            <Gift className="w-12 h-12 mx-auto mb-3" />
            <h3 className="font-bold mb-2">Bonus Exclusifs</h3>
            <p className="text-sm opacity-90">Accès aux nouvelles features</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 text-center">
            <Users className="w-12 h-12 mx-auto mb-3" />
            <h3 className="font-bold mb-2">Communauté VIP</h3>
            <p className="text-sm opacity-90">Réseau d&apos;entrepreneurs élite</p>
          </div>
        </div>

        {/* Action button */}
        <div className="text-center">
          <button
            onClick={() => setShowVIPContent(true)}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all inline-flex items-center"
          >
            Accéder à Mon Espace VIP <Star className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  )

  // Stage 8: VIP Dashboard
  const renderVIPDashboard = () => (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-6xl mx-auto py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold mb-2">Espace VIP - {userData.businessName}</h1>
            <p className="text-gray-400">Bienvenue {userData.name} 👋</p>
          </div>
          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full px-6 py-3">
            <span className="font-bold">STATUS: VIP ACTIF ✅</span>
          </div>
        </div>

        {/* Stats overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-2xl p-6">
            <Phone className="w-8 h-8 text-green-400 mb-3" />
            <p className="text-3xl font-bold">0</p>
            <p className="text-sm opacity-80">Appels manqués</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-6">
            <TrendingUp className="w-8 h-8 text-blue-400 mb-3" />
            <p className="text-3xl font-bold">+{formatCurrency(userData.weeklyLoss)}</p>
            <p className="text-sm opacity-80">Revenue récupéré/sem</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-2xl p-6">
            <Users className="w-8 h-8 text-purple-400 mb-3" />
            <p className="text-3xl font-bold">47</p>
            <p className="text-sm opacity-80">Nouveaux leads ce mois</p>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 rounded-2xl p-6">
            <Star className="w-8 h-8 text-yellow-400 mb-3" />
            <p className="text-3xl font-bold">4.9/5</p>
            <p className="text-sm opacity-80">Satisfaction clients</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-gray-900 rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Actions Rapides</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <button className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 text-left transition-colors">
              <BarChart3 className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="font-bold mb-2">Voir Analytics</h3>
              <p className="text-sm opacity-80">Stats détaillées de tes appels</p>
            </button>
            
            <button className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 text-left transition-colors">
              <Bot className="w-8 h-8 text-purple-400 mb-3" />
              <h3 className="font-bold mb-2">Modifier Scripts IA</h3>
              <p className="text-sm opacity-80">Personnaliser les réponses</p>
            </button>
            
            <button className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 text-left transition-colors">
              <Headphones className="w-8 h-8 text-green-400 mb-3" />
              <h3 className="font-bold mb-2">Support VIP</h3>
              <p className="text-sm opacity-80">Ligne directe 24/7</p>
            </button>
          </div>
        </div>

        {/* Resources */}
        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-3xl p-8">
          <h2 className="text-2xl font-bold mb-6">📚 Ressources VIP</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-xl p-6">
              <Video className="w-8 h-8 text-pink-400 mb-3" />
              <h3 className="font-bold mb-2">Formation Avancée</h3>
              <p className="text-sm opacity-80 mb-4">Maximise ton ROI avec l&apos;IA</p>
              <button className="text-pink-400 font-bold text-sm hover:underline">
                Accéder aux vidéos →
              </button>
            </div>
            
            <div className="bg-white/10 rounded-xl p-6">
              <FileText className="w-8 h-8 text-yellow-400 mb-3" />
              <h3 className="font-bold mb-2">Templates & Scripts</h3>
              <p className="text-sm opacity-80 mb-4">Scripts qui convertissent</p>
              <button className="text-yellow-400 font-bold text-sm hover:underline">
                Télécharger →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Main render logic
  return (
    <div className="font-sans">
      {userData.stage === 1 && renderLanding()}
      {userData.stage === 2 && renderContactInfo()}
      {userData.stage === 3 && renderQualification()}
      {userData.stage === 4 && renderResults()}
      {userData.stage === 5 && renderOffer()}
      {userData.stage === 6 && renderPayment()}
      {userData.stage === 7 && renderOnboarding()}
      {userData.stage === 8 && renderVIPDashboard()}
    </div>
  )
}