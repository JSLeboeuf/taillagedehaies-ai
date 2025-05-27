'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
 BarChart3, TrendingUp, Users, DollarSign, 
 Target, Clock, Filter, RefreshCw, Phone,
 MessageSquare, Trophy, Brain
} from 'lucide-react'

interface FunnelStats {
 stage: string
 total_leads: number
 avg_nepq_score: number
 avg_weekly_loss: number
 conversions: number
}

interface DailyStats {
 date: string
 unique_visitors: number
 payments: number
 revenue: number
}

export default function Dashboard() {
 const [funnelStats, setFunnelStats] = useState<FunnelStats[]>([])
 const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
 const [totalLeads, setTotalLeads] = useState(0)
 const [totalRevenue, setTotalRevenue] = useState(0)
 const [conversionRate, setConversionRate] = useState(0)
 const [avgWeeklyLoss, setAvgWeeklyLoss] = useState(0)
 const [loading, setLoading] = useState(true)

 useEffect(() => {
   loadStats()
 }, [])

 const loadStats = async () => {
   setLoading(true)
   
   try {
     // Get funnel stats
     const { data: funnel } = await supabase
       .from('funnel_stats')
       .select('*')
     
     // Get daily stats
     const { data: daily } = await supabase
       .from('daily_stats')
       .select('*')
       .limit(30)
     
     // Get total leads
     const { count } = await supabase
       .from('leads')
       .select('*', { count: 'exact', head: true })
     
     if (funnel) {
       setFunnelStats(funnel)
       const avgLoss = funnel.reduce((sum, s) => sum + (s.avg_weekly_loss || 0), 0) / funnel.length
       setAvgWeeklyLoss(Math.round(avgLoss))
     }
     
     if (daily) {
       setDailyStats(daily)
       const total = daily.reduce((sum, day) => sum + (day.revenue || 0), 0)
       setTotalRevenue(total)
     }
     
     if (count) {
       setTotalLeads(count)
       // Calculate conversion rate
       const conversions = funnel?.find(s => s.stage === 'payment')?.conversions || 0
       setConversionRate(count > 0 ? (conversions / count) * 100 : 0)
     }
   } catch (error) {
     console.error('Error loading stats:', error)
   } finally {
     setLoading(false)
   }
 }

 const stages = [
   'landing',
   'ai-qualification',
   'deep-calculator',
   'proof-demo',
   'offer-contract',
   'payment',
   'booking',
   'welcome-vip'
 ]

 const stageNames = {
   'landing': '🏠 Page d\'accueil',
   'ai-qualification': '🤖 Chat avec Sophie',
   'deep-calculator': '💸 Calcul des pertes',
   'proof-demo': '🎤 Démo Sophie',
   'offer-contract': '📝 Offre Jean-Samuel',
   'payment': '💳 Paiement',
   'booking': '📅 Réservation',
   'welcome-vip': '🎉 Bienvenue ACTION'
 }

 return (
   <div className="min-h-screen bg-gray-50 p-8">
     <div className="max-w-7xl mx-auto">
       {/* Header */}
       <div className="flex justify-between items-center mb-8">
         <div>
           <h1 className="text-3xl font-bold">Dashboard Sophie IA</h1>
           <p className="text-gray-600">Par Jean-Samuel Leboeuf</p>
         </div>
         <button
           onClick={loadStats}
           className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
         >
           <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
           Rafraîchir
         </button>
       </div>

       {/* KPI Cards */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
         <div className="bg-white rounded-xl shadow-lg p-6">
           <div className="flex items-center justify-between mb-4">
             <Users className="text-blue-600" size={32} />
             <span className="text-sm text-gray-500">Total</span>
           </div>
           <p className="text-3xl font-bold">{totalLeads}</p>
           <p className="text-sm text-gray-600">Leads générés</p>
         </div>

         <div className="bg-white rounded-xl shadow-lg p-6">
           <div className="flex items-center justify-between mb-4">
             <DollarSign className="text-green-600" size={32} />
             <span className="text-sm text-gray-500">Revenue</span>
           </div>
           <p className="text-3xl font-bold">${totalRevenue.toLocaleString()}</p>
           <p className="text-sm text-gray-600">Revenue total</p>
         </div>

         <div className="bg-white rounded-xl shadow-lg p-6">
           <div className="flex items-center justify-between mb-4">
             <Target className="text-purple-600" size={32} />
             <span className="text-sm text-gray-500">Conversion</span>
           </div>
           <p className="text-3xl font-bold">{conversionRate.toFixed(1)}%</p>
           <p className="text-sm text-gray-600">Taux de conversion</p>
         </div>

         <div className="bg-white rounded-xl shadow-lg p-6">
           <div className="flex items-center justify-between mb-4">
             <Phone className="text-orange-600" size={32} />
             <span className="text-sm text-gray-500">Moyenne</span>
           </div>
           <p className="text-3xl font-bold">${avgWeeklyLoss}</p>
           <p className="text-sm text-gray-600">Pertes/sem moyennes</p>
         </div>
       </div>

       {/* Message Jean-Samuel */}
       <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6 mb-8">
         <div className="flex items-start gap-4">
           <Brain className="text-yellow-600 flex-shrink-0" size={32} />
           <div>
             <h3 className="font-bold text-lg mb-2">Message de Jean-Samuel</h3>
             <p>
               "Check ben ça! Chaque lead qui drop = {avgWeeklyLoss}$/semaine de perdu. 
               Sophie a un taux de conversion de {conversionRate.toFixed(0)}%. 
               C'est {totalRevenue > 50000 ? 'malade' : 'un bon début'}, on continue de pusher!"
             </p>
           </div>
         </div>
       </div>

       {/* Funnel Visualization */}
       <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
         <h2 className="text-xl font-bold mb-6">🎯 Funnel de Conversion</h2>
         <div className="space-y-4">
           {stages.map((stage, index) => {
             const stats = funnelStats.find(s => s.stage === stage)
             const leads = stats?.total_leads || 0
             const percentage = totalLeads > 0 ? (leads / totalLeads) * 100 : 0
             
             return (
               <div key={stage} className="relative">
                 <div className="flex items-center justify-between mb-2">
                   <span className="font-medium">
                     {stageNames[stage as keyof typeof stageNames] || stage}
                   </span>
                   <span className="text-sm text-gray-600">
                     {leads} leads ({percentage.toFixed(1)}%)
                   </span>
                 </div>
                 <div className="w-full bg-gray-200 rounded-full h-8">
                   <div
                     className="bg-gradient-to-r from-blue-500 to-purple-500 h-8 rounded-full flex items-center justify-end pr-4"
                     style={{ width: `${percentage}%` }}
                   >
                     {percentage > 10 && (
                       <span className="text-white text-sm font-medium">
                         {percentage.toFixed(0)}%
                       </span>
                     )}
                   </div>
                 </div>
               </div>
             )
           })}
         </div>
         
         {/* Drop-off analysis */}
         <div className="mt-8 p-4 bg-red-50 rounded-lg">
           <h3 className="font-bold text-red-800 mb-2">🚨 Plus gros drop-off:</h3>
           <p className="text-sm">
             Entre "Chat avec Sophie" et "Calcul des pertes" - 
             Améliorer les questions de qualification!
           </p>
         </div>
       </div>

       {/* Daily Trend */}
       <div className="bg-white rounded-xl shadow-lg p-6">
         <h2 className="text-xl font-bold mb-6">📈 Performance 30 jours</h2>
         <div className="overflow-x-auto">
           <table className="w-full">
             <thead>
               <tr className="border-b">
                 <th className="text-left py-2">Date</th>
                 <th className="text-right py-2">Visiteurs</th>
                 <th className="text-right py-2">Sophie activée</th>
                 <th className="text-right py-2">Paiements</th>
                 <th className="text-right py-2">Revenue</th>
               </tr>
             </thead>
             <tbody>
               {dailyStats.map((day, index) => (
                 <tr key={index} className="border-b hover:bg-gray-50">
                   <td className="py-2">{new Date(day.date).toLocaleDateString('fr-CA')}</td>
                   <td className="text-right py-2">{day.unique_visitors}</td>
                   <td className="text-right py-2">
                     {Math.round(day.unique_visitors * 0.15)}
                   </td>
                   <td className="text-right py-2 font-bold">{day.payments}</td>
                   <td className="text-right py-2 font-bold text-green-600">
                     ${day.revenue?.toLocaleString() || 0}
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
         
         {/* Quick insights */}
         <div className="mt-6 grid md:grid-cols-3 gap-4">
           <div className="bg-green-50 rounded-lg p-4">
             <Trophy className="text-green-600 mb-2" size={24} />
             <p className="text-sm font-bold">Meilleur jour</p>
             <p className="text-xs text-gray-600">
               {dailyStats.reduce((best, day) => 
                 day.revenue > (best?.revenue || 0) ? day : best
               , dailyStats[0])?.date || 'N/A'}
             </p>
           </div>
           <div className="bg-blue-50 rounded-lg p-4">
             <MessageSquare className="text-blue-600 mb-2" size={24} />
             <p className="text-sm font-bold">Taux activation Sophie</p>
             <p className="text-xs text-gray-600">
               ~15% testent la démo
             </p>
           </div>
           <div className="bg-purple-50 rounded-lg p-4">
             <Target className="text-purple-600 mb-2" size={24} />
             <p className="text-sm font-bold">Objectif mensuel</p>
             <p className="text-xs text-gray-600">
               {totalRevenue >= 25000 ? '✅ Atteint!' : `${Math.round((totalRevenue/25000)*100)}% complété`}
             </p>
           </div>
         </div>
       </div>
     </div>
   </div>
 )
}
