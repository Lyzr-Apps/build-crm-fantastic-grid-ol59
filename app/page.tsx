'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { callAIAgent, AIAgentResponse } from '@/lib/aiAgent'
import { copyToClipboard } from '@/lib/clipboard'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
// Tabs available if needed: import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import {
  RiDashboardLine,
  RiUserLine,
  RiCalendarCheckLine,
  RiBuildingLine,
  RiSettings4Line,
  RiSearchLine,
  RiNotification3Line,
  RiUserSmileLine,
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiPhoneLine,
  RiMailLine,
  RiWhatsappLine,
  RiCalendarLine,
  RiTimeLine,
  RiAddLine,
  RiArrowLeftLine,
  RiStarLine,
  RiFireLine,
  RiTempColdLine,
  RiSunLine,
  RiCheckLine,
  RiMenuLine,
  RiFileCopyLine,
  RiMapPinLine,
  RiMoneyDollarCircleLine,
  RiTeamLine,
  RiBarChartLine,
  RiLightbulbLine,
  RiAlertLine,
  RiTrophyLine,
  RiLineChartLine,
  RiLoader4Line,
  RiChat3Line,
  RiEditLine,
  RiArrowRightSLine,
  RiHome4Line,
  RiGroupLine,
  RiRefreshLine,
  RiCheckboxCircleLine,
  RiSparklingLine,
  RiMagicLine,
  RiListCheck2,
  RiFileTextLine,
  RiHashtag,
  RiPriceTag3Line,
  RiLayoutColumnLine
} from 'react-icons/ri'

// ===== AGENT IDS =====
const LEAD_INTELLIGENCE_AGENT = '699f3d06f2130afa9fdb129a'
const FOLLOW_UP_COACH_AGENT = '699f3d06baa7d9b4a230ccd9'
const PIPELINE_INSIGHTS_AGENT = '699f3d07baa7d9b4a230ccdb'

// ===== TYPES =====
interface Lead {
  id: number
  name: string
  phone: string
  email: string
  source: string
  project: string
  stage: string
  score: string
  budget: string
  locality: string
  assignedTo: string
  lastActivity: string
}

interface Project {
  id: number
  name: string
  location: string
  rera: string
  totalUnits: number
  availableUnits: number
  priceRange: string
  type: string
}

interface FollowUp {
  id: number
  leadId: number
  leadName: string
  project: string
  type: string
  dueDate: string
  status: string
  lastInteraction: string
  priority: string
}

interface LeadIntelligenceResult {
  qualification_score?: string
  score_reasoning?: string
  market_context?: string
  builder_reputation?: string
  recommended_actions?: string[]
  locality_insights?: string
  budget_analysis?: string
}

interface FollowUpCoachResult {
  message_draft?: string
  message_tone?: string
  optimal_timing?: string
  talking_points?: string[]
  engagement_strategy?: string
  urgency_level?: string
}

interface PipelineInsightsResult {
  executive_summary?: string
  conversion_analysis?: string
  risk_flags?: string[]
  performance_highlights?: string[]
  actionable_recommendations?: string[]
  stale_lead_analysis?: string
  revenue_forecast?: string
}

type ScreenType = 'dashboard' | 'leads' | 'follow-ups' | 'projects' | 'settings'

// ===== SAMPLE DATA =====
const SAMPLE_LEADS: Lead[] = [
  { id: 1, name: "Rajesh Sharma", phone: "+91 98765 43210", email: "rajesh.s@gmail.com", source: "Walk-in", project: "Sunrise Heights", stage: "Site Visit", score: "Warm", budget: "1-2 Cr", locality: "Whitefield, Bangalore", assignedTo: "Amit Kumar", lastActivity: "2 days ago" },
  { id: 2, name: "Priya Patel", phone: "+91 87654 32109", email: "priya.p@yahoo.com", source: "Broker", project: "Palm Residences", stage: "Negotiation", score: "Hot", budget: "2-5 Cr", locality: "Bandra, Mumbai", assignedTo: "Neha Gupta", lastActivity: "Today" },
  { id: 3, name: "Vikram Singh", phone: "+91 76543 21098", email: "vikram.s@outlook.com", source: "Online", project: "Green Valley", stage: "New Lead", score: "Cold", budget: "50L-1 Cr", locality: "Noida Sector 150", assignedTo: "Rahul Verma", lastActivity: "5 days ago" },
  { id: 4, name: "Anita Desai", phone: "+91 99887 76655", email: "anita.d@gmail.com", source: "Referral", project: "Sunrise Heights", stage: "Contacted", score: "Warm", budget: "1-2 Cr", locality: "Koramangala, Bangalore", assignedTo: "Amit Kumar", lastActivity: "1 day ago" },
  { id: 5, name: "Suresh Reddy", phone: "+91 88776 65544", email: "suresh.r@hotmail.com", source: "Walk-in", project: "Sky Towers", stage: "Booking", score: "Hot", budget: "2-5 Cr", locality: "Jubilee Hills, Hyderabad", assignedTo: "Priyanka Das", lastActivity: "Today" },
  { id: 6, name: "Meena Iyer", phone: "+91 77665 54433", email: "meena.i@gmail.com", source: "Online", project: "Palm Residences", stage: "New Lead", score: "Cold", budget: "Under 50L", locality: "Andheri, Mumbai", assignedTo: "Neha Gupta", lastActivity: "3 days ago" },
  { id: 7, name: "Karan Malhotra", phone: "+91 66554 43322", email: "karan.m@gmail.com", source: "Cold Call", project: "Green Valley", stage: "Site Visit", score: "Warm", budget: "1-2 Cr", locality: "Greater Noida West", assignedTo: "Rahul Verma", lastActivity: "1 day ago" },
  { id: 8, name: "Deepa Nair", phone: "+91 55443 32211", email: "deepa.n@yahoo.com", source: "Broker", project: "Sunrise Heights", stage: "Closed", score: "Hot", budget: "1-2 Cr", locality: "HSR Layout, Bangalore", assignedTo: "Amit Kumar", lastActivity: "Today" },
]

const SAMPLE_PROJECTS: Project[] = [
  { id: 1, name: "Sunrise Heights", location: "Whitefield, Bangalore", rera: "RERA/KAR/2024/001234", totalUnits: 120, availableUnits: 45, priceRange: "85L - 1.8 Cr", type: "Apartment" },
  { id: 2, name: "Palm Residences", location: "Bandra West, Mumbai", rera: "RERA/MAH/2024/005678", totalUnits: 80, availableUnits: 22, priceRange: "2.5 Cr - 5.2 Cr", type: "Luxury Villa" },
  { id: 3, name: "Green Valley", location: "Sector 150, Noida", rera: "RERA/UP/2024/009012", totalUnits: 200, availableUnits: 98, priceRange: "45L - 1.1 Cr", type: "Apartment" },
  { id: 4, name: "Sky Towers", location: "Jubilee Hills, Hyderabad", rera: "RERA/TEL/2024/003456", totalUnits: 60, availableUnits: 15, priceRange: "1.8 Cr - 3.5 Cr", type: "Premium Apartment" },
]

const SAMPLE_FOLLOWUPS: FollowUp[] = [
  { id: 1, leadId: 1, leadName: "Rajesh Sharma", project: "Sunrise Heights", type: "Phone Call", dueDate: "today", status: "pending", lastInteraction: "Site visit completed, interested in 3BHK Tower B", priority: "high" },
  { id: 2, leadId: 4, leadName: "Anita Desai", project: "Sunrise Heights", type: "Email", dueDate: "today", status: "pending", lastInteraction: "Initial enquiry via referral, asked for brochure", priority: "medium" },
  { id: 3, leadId: 7, leadName: "Karan Malhotra", project: "Green Valley", type: "WhatsApp", dueDate: "today", status: "pending", lastInteraction: "Site visit scheduled but didn't show up", priority: "high" },
  { id: 4, leadId: 2, leadName: "Priya Patel", project: "Palm Residences", type: "Meeting", dueDate: "tomorrow", status: "pending", lastInteraction: "Price negotiation in progress, requesting 5% discount", priority: "high" },
  { id: 5, leadId: 3, leadName: "Vikram Singh", project: "Green Valley", type: "Phone Call", dueDate: "overdue", status: "pending", lastInteraction: "Filled online form, no response to calls", priority: "low" },
  { id: 6, leadId: 6, leadName: "Meena Iyer", project: "Palm Residences", type: "Email", dueDate: "overdue", status: "pending", lastInteraction: "Budget concern raised, exploring loan options", priority: "medium" },
]

const STAGES = ['New Lead', 'Contacted', 'Site Visit', 'Negotiation', 'Booking', 'Closed']
const SOURCES = ['Walk-in', 'Broker', 'Online', 'Referral', 'Cold Call']
const BUDGETS = ['Under 50L', '50L-1 Cr', '1-2 Cr', '2-5 Cr', '5 Cr+']

// ===== HELPERS =====
function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-3 mb-1">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-base mt-3 mb-1">{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-lg mt-4 mb-2">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-sm">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal text-sm">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm">{formatInline(line)}</p>
      })}
    </div>
  )
}

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
  )
}

function getScoreBadge(score: string) {
  const s = (score ?? '').toLowerCase()
  if (s.includes('hot')) return <Badge className="bg-green-600 text-white hover:bg-green-700"><RiFireLine className="mr-1 h-3 w-3" />Hot</Badge>
  if (s.includes('warm')) return <Badge className="bg-amber-500 text-white hover:bg-amber-600"><RiSunLine className="mr-1 h-3 w-3" />Warm</Badge>
  return <Badge className="bg-blue-500 text-white hover:bg-blue-600"><RiTempColdLine className="mr-1 h-3 w-3" />Cold</Badge>
}

function getStageBadge(stage: string) {
  const colors: Record<string, string> = {
    'New Lead': 'bg-blue-100 text-blue-700 border-blue-200',
    'Contacted': 'bg-purple-100 text-purple-700 border-purple-200',
    'Site Visit': 'bg-amber-100 text-amber-700 border-amber-200',
    'Negotiation': 'bg-orange-100 text-orange-700 border-orange-200',
    'Booking': 'bg-green-100 text-green-700 border-green-200',
    'Closed': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  }
  return <Badge variant="outline" className={cn('text-xs', colors[stage] ?? 'bg-muted text-muted-foreground')}>{stage}</Badge>
}

function getUrgencyBadge(level: string) {
  const l = (level ?? '').toLowerCase()
  if (l.includes('high')) return <Badge className="bg-red-100 text-red-700 border-red-200" variant="outline">High Urgency</Badge>
  if (l.includes('medium')) return <Badge className="bg-amber-100 text-amber-700 border-amber-200" variant="outline">Medium Urgency</Badge>
  return <Badge className="bg-green-100 text-green-700 border-green-200" variant="outline">Low Urgency</Badge>
}

function getPriorityColor(priority: string) {
  if (priority === 'high') return 'border-l-red-500'
  if (priority === 'medium') return 'border-l-amber-500'
  return 'border-l-gray-400'
}

function getTypeIcon(type: string) {
  if (type === 'Phone Call') return <RiPhoneLine className="h-4 w-4" />
  if (type === 'Email') return <RiMailLine className="h-4 w-4" />
  if (type === 'WhatsApp') return <RiWhatsappLine className="h-4 w-4" />
  if (type === 'Meeting') return <RiCalendarLine className="h-4 w-4" />
  return <RiChat3Line className="h-4 w-4" />
}

// ===== ERROR BOUNDARY =====
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button onClick={() => this.setState({ hasError: false, error: '' })} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">Try again</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ===== DASHBOARD SCREEN =====
function DashboardScreen({
  leads,
  onGenerateInsights,
  insightsLoading,
  insightsData,
  insightsOpen,
  setInsightsOpen,
  activeAgentId,
}: {
  leads: Lead[]
  onGenerateInsights: () => void
  insightsLoading: boolean
  insightsData: PipelineInsightsResult | null
  insightsOpen: boolean
  setInsightsOpen: (v: boolean) => void
  activeAgentId: string | null
}) {
  const stageCount = useMemo(() => {
    const counts: Record<string, number> = {}
    STAGES.forEach(s => { counts[s] = 0 })
    leads.forEach(l => { counts[l.stage] = (counts[l.stage] ?? 0) + 1 })
    return counts
  }, [leads])

  const maxStageCount = useMemo(() => Math.max(...Object.values(stageCount), 1), [stageCount])

  const stats = [
    { label: 'Total Leads', value: '142', icon: RiUserLine, trend: '+12%', up: true },
    { label: "Today's Follow-Ups", value: '8', icon: RiCalendarCheckLine, trend: '+3', up: true },
    { label: "Monthly Conversions", value: '12', icon: RiCheckboxCircleLine, trend: '+18%', up: true },
    { label: 'Revenue Pipeline', value: 'Rs 24.5 Cr', icon: RiMoneyDollarCircleLine, trend: '+8%', up: true },
    { label: 'New Leads This Week', value: '18', icon: RiGroupLine, trend: '-5%', up: false },
    { label: 'Site Visits Scheduled', value: '5', icon: RiMapPinLine, trend: '+2', up: true },
  ]

  const activities = [
    { text: 'Priya Patel moved to Negotiation stage', time: '10 min ago', icon: RiArrowRightSLine },
    { text: 'Amit Kumar logged a call with Rajesh Sharma', time: '25 min ago', icon: RiPhoneLine },
    { text: 'New lead Meena Iyer from Online campaign', time: '1 hour ago', icon: RiAddLine },
    { text: 'Suresh Reddy - Booking confirmed for Sky Towers', time: '2 hours ago', icon: RiCheckLine },
    { text: 'Site visit scheduled for Karan Malhotra', time: '3 hours ago', icon: RiCalendarLine },
    { text: 'Deepa Nair - Deal closed at Rs 1.4 Cr', time: '5 hours ago', icon: RiTrophyLine },
  ]

  const teamMembers = [
    { name: 'Amit Kumar', leads: 38, conversions: 5, rate: '13.2%' },
    { name: 'Neha Gupta', leads: 32, conversions: 4, rate: '12.5%' },
    { name: 'Priyanka Das', leads: 28, conversions: 2, rate: '7.1%' },
    { name: 'Rahul Verma', leads: 25, conversions: 1, rate: '4.0%' },
  ]

  const stageColors = ['bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-orange-500', 'bg-green-500', 'bg-emerald-600']

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-serif text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Welcome back. Here is your pipeline overview.</p>
        </div>
        <Button onClick={onGenerateInsights} disabled={insightsLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {insightsLoading ? <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" /> : <RiSparklingLine className="mr-2 h-4 w-4" />}
          Generate Insights
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="h-5 w-5 text-primary" />
                <span className={cn('text-xs flex items-center', stat.up ? 'text-green-600' : 'text-red-500')}>
                  {stat.up ? <RiArrowUpSLine className="h-3 w-3" /> : <RiArrowDownSLine className="h-3 w-3" />}
                  {stat.trend}
                </span>
              </div>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Funnel */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-serif flex items-center gap-2">
              <RiBarChartLine className="h-5 w-5 text-primary" />
              Pipeline Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {STAGES.map((stage, i) => {
                const count = stageCount[stage] ?? 0
                const pct = (count / maxStageCount) * 100
                return (
                  <div key={stage} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-24 text-right">{stage}</span>
                    <div className="flex-1 bg-muted rounded-full h-7 relative overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2', stageColors[i])} style={{ width: `${Math.max(pct, 8)}%` }}>
                        <span className="text-xs font-bold text-white">{count}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-serif flex items-center gap-2">
              <RiTimeLine className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {activities.map((act, i) => (
                  <div key={i} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                    <div className="p-1.5 rounded-full bg-primary/10 text-primary mt-0.5">
                      <act.icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug">{act.text}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Team Leaderboard */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-serif flex items-center gap-2">
            <RiTrophyLine className="h-5 w-5 text-primary" />
            Team Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Rank</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Team Member</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">Active Leads</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">Conversions</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">Conversion Rate</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                    <td className="py-2.5 px-3">
                      <span className={cn('inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold', i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground')}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-foreground">{member.name}</td>
                    <td className="py-2.5 px-3 text-center text-foreground">{member.leads}</td>
                    <td className="py-2.5 px-3 text-center text-foreground">{member.conversions}</td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge variant="outline" className="text-xs">{member.rate}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Insights Sheet */}
      <Sheet open={insightsOpen} onOpenChange={setInsightsOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-card">
          <SheetHeader>
            <SheetTitle className="font-serif flex items-center gap-2">
              <RiLightbulbLine className="h-5 w-5 text-primary" />
              Pipeline Insights
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            {insightsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : insightsData ? (
              <>
                {/* Executive Summary */}
                {insightsData.executive_summary && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <RiFileTextLine className="h-4 w-4 text-primary" />Executive Summary
                    </h3>
                    <div className="bg-muted/50 p-3 rounded-lg">{renderMarkdown(insightsData.executive_summary)}</div>
                  </div>
                )}

                {/* Conversion Analysis */}
                {insightsData.conversion_analysis && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <RiLineChartLine className="h-4 w-4 text-primary" />Conversion Analysis
                    </h3>
                    <div className="bg-muted/50 p-3 rounded-lg">{renderMarkdown(insightsData.conversion_analysis)}</div>
                  </div>
                )}

                {/* Risk Flags */}
                {Array.isArray(insightsData?.risk_flags) && insightsData.risk_flags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <RiAlertLine className="h-4 w-4 text-red-500" />Risk Flags
                    </h3>
                    <ul className="space-y-2">
                      {insightsData.risk_flags.map((flag, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm bg-red-50 p-2 rounded-lg border border-red-100">
                          <RiAlertLine className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                          <span>{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Performance Highlights */}
                {Array.isArray(insightsData?.performance_highlights) && insightsData.performance_highlights.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <RiTrophyLine className="h-4 w-4 text-amber-500" />Performance Highlights
                    </h3>
                    <ul className="space-y-2">
                      {insightsData.performance_highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm bg-green-50 p-2 rounded-lg border border-green-100">
                          <RiStarLine className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actionable Recommendations */}
                {Array.isArray(insightsData?.actionable_recommendations) && insightsData.actionable_recommendations.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <RiLightbulbLine className="h-4 w-4 text-amber-500" />Recommendations
                    </h3>
                    <ul className="space-y-2">
                      {insightsData.actionable_recommendations.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm bg-amber-50 p-2 rounded-lg border border-amber-100">
                          <RiCheckLine className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Stale Lead Analysis */}
                {insightsData.stale_lead_analysis && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <RiTimeLine className="h-4 w-4 text-primary" />Stale Lead Analysis
                    </h3>
                    <div className="bg-muted/50 p-3 rounded-lg">{renderMarkdown(insightsData.stale_lead_analysis)}</div>
                  </div>
                )}

                {/* Revenue Forecast */}
                {insightsData.revenue_forecast && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <RiMoneyDollarCircleLine className="h-4 w-4 text-green-600" />Revenue Forecast
                    </h3>
                    <div className="bg-muted/50 p-3 rounded-lg">{renderMarkdown(insightsData.revenue_forecast)}</div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10">Click "Generate Insights" to analyze your pipeline.</p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

// ===== LEAD DETAIL SCREEN =====
function LeadDetailScreen({
  lead,
  onBack,
  enrichLoading,
  enrichData,
  onEnrich,
  activeAgentId,
}: {
  lead: Lead
  onBack: () => void
  enrichLoading: boolean
  enrichData: LeadIntelligenceResult | null
  onEnrich: (lead: Lead) => void
  activeAgentId: string | null
}) {
  const [newNote, setNewNote] = useState('')
  const [notes, setNotes] = useState([
    { text: 'Initial enquiry about 3BHK units in Tower B', date: '2 days ago', by: lead.assignedTo },
    { text: 'Site visit completed. Client liked the amenities, concerned about parking.', date: '1 day ago', by: lead.assignedTo },
    { text: 'Sent pricing details and payment plan via email', date: 'Today', by: lead.assignedTo },
  ])

  const timeline = [
    { action: 'Lead Created', detail: `Source: ${lead.source}`, date: '5 days ago', icon: RiAddLine },
    { action: 'Contacted via Phone', detail: 'Discussed property options', date: '4 days ago', icon: RiPhoneLine },
    { action: 'Brochure Sent', detail: `${lead.project} brochure emailed`, date: '3 days ago', icon: RiMailLine },
    { action: 'Site Visit Scheduled', detail: `Visit to ${lead.project}`, date: '2 days ago', icon: RiCalendarLine },
    { action: 'Site Visit Completed', detail: 'Interested in 3BHK Tower B', date: '1 day ago', icon: RiCheckLine },
    { action: 'Follow-up Pending', detail: 'Share payment plan options', date: 'Today', icon: RiTimeLine },
  ]

  const handleAddNote = useCallback(() => {
    if (newNote.trim()) {
      setNotes(prev => [...prev, { text: newNote.trim(), date: 'Just now', by: lead.assignedTo }])
      setNewNote('')
    }
  }, [newNote, lead.assignedTo])

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
        <RiArrowLeftLine className="mr-2 h-4 w-4" />Back to Leads
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column - 60% */}
        <div className="lg:col-span-3 space-y-6">
          {/* Lead Info */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-serif">{lead.name}</CardTitle>
                  <CardDescription className="mt-1">{lead.project} | {lead.locality}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getScoreBadge(lead.score)}
                  {getStageBadge(lead.stage)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <RiPhoneLine className="h-4 w-4 text-muted-foreground" />
                  <span>{lead.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <RiMailLine className="h-4 w-4 text-muted-foreground" />
                  <span>{lead.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <RiPriceTag3Line className="h-4 w-4 text-muted-foreground" />
                  <span>Budget: {lead.budget}</span>
                </div>
                <div className="flex items-center gap-2">
                  <RiMapPinLine className="h-4 w-4 text-muted-foreground" />
                  <span>{lead.locality}</span>
                </div>
                <div className="flex items-center gap-2">
                  <RiUserLine className="h-4 w-4 text-muted-foreground" />
                  <span>Source: {lead.source}</span>
                </div>
                <div className="flex items-center gap-2">
                  <RiTeamLine className="h-4 w-4 text-muted-foreground" />
                  <span>Assigned: {lead.assignedTo}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interaction Timeline */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <RiTimeLine className="h-5 w-5 text-primary" />Interaction Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 relative">
                    {i < timeline.length - 1 && (
                      <div className="absolute left-[15px] top-8 w-0.5 h-full bg-border" />
                    )}
                    <div className="p-2 rounded-full bg-primary/10 text-primary z-10 shrink-0">
                      <item.icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium text-foreground">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.detail}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <RiEditLine className="h-5 w-5 text-primary" />Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notes.map((note, i) => (
                <div key={i} className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-foreground">{note.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">{note.by} - {note.date}</p>
                </div>
              ))}
              <div className="flex gap-2 mt-3">
                <Textarea
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="resize-none bg-background"
                  rows={2}
                />
                <Button onClick={handleAddNote} disabled={!newNote.trim()} className="shrink-0 bg-primary text-primary-foreground">
                  <RiAddLine className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - 40% */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enrich & Qualify CTA */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <RiMagicLine className="h-5 w-5 text-primary" />AI Lead Intelligence
              </CardTitle>
              <CardDescription>Get AI-powered lead qualification and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => onEnrich(lead)}
                disabled={enrichLoading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {enrichLoading ? (
                  <><RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />Analyzing...</>
                ) : (
                  <><RiSparklingLine className="mr-2 h-4 w-4" />Enrich & Qualify</>
                )}
              </Button>

              {enrichLoading && (
                <div className="mt-4 space-y-3">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              )}

              {!enrichLoading && enrichData && (
                <div className="mt-4 space-y-4">
                  {/* Score */}
                  {enrichData.qualification_score && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium text-muted-foreground">Score:</span>
                      {getScoreBadge(enrichData.qualification_score)}
                    </div>
                  )}

                  {/* Score Reasoning */}
                  {enrichData.score_reasoning && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Score Reasoning</h4>
                      <div className="p-3 bg-muted/50 rounded-lg">{renderMarkdown(enrichData.score_reasoning)}</div>
                    </div>
                  )}

                  {/* Market Context */}
                  {enrichData.market_context && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Market Context</h4>
                      <div className="p-3 bg-muted/50 rounded-lg">{renderMarkdown(enrichData.market_context)}</div>
                    </div>
                  )}

                  {/* Builder Reputation */}
                  {enrichData.builder_reputation && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Builder Reputation</h4>
                      <div className="p-3 bg-muted/50 rounded-lg">{renderMarkdown(enrichData.builder_reputation)}</div>
                    </div>
                  )}

                  {/* Recommended Actions */}
                  {Array.isArray(enrichData?.recommended_actions) && enrichData.recommended_actions.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Recommended Actions</h4>
                      <ul className="space-y-1.5">
                        {enrichData.recommended_actions.map((action, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm p-2 bg-green-50 rounded border border-green-100">
                            <RiCheckLine className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Locality Insights */}
                  {enrichData.locality_insights && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Locality Insights</h4>
                      <div className="p-3 bg-muted/50 rounded-lg">{renderMarkdown(enrichData.locality_insights)}</div>
                    </div>
                  )}

                  {/* Budget Analysis */}
                  {enrichData.budget_analysis && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Budget Analysis</h4>
                      <div className="p-3 bg-muted/50 rounded-lg">{renderMarkdown(enrichData.budget_analysis)}</div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-sm">
                <RiPhoneLine className="mr-2 h-4 w-4" />Log Call
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm">
                <RiCalendarLine className="mr-2 h-4 w-4" />Schedule Visit
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm">
                <RiEditLine className="mr-2 h-4 w-4" />Add Note
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm">
                <RiMailLine className="mr-2 h-4 w-4" />Send Email
              </Button>
            </CardContent>
          </Card>

          {/* Property Interest */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Property Interest</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Project</span><span className="font-medium">{lead.project}</span></div>
              <Separator />
              <div className="flex justify-between"><span className="text-muted-foreground">Budget</span><span className="font-medium">{lead.budget}</span></div>
              <Separator />
              <div className="flex justify-between"><span className="text-muted-foreground">Preferred Area</span><span className="font-medium">{lead.locality}</span></div>
              <Separator />
              <div className="flex justify-between"><span className="text-muted-foreground">Configuration</span><span className="font-medium">3 BHK</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ===== LEADS SCREEN =====
function LeadsScreen({
  leads,
  onSelectLead,
  onAddLead,
  addLeadOpen,
  setAddLeadOpen,
}: {
  leads: Lead[]
  onSelectLead: (lead: Lead) => void
  onAddLead: (lead: Omit<Lead, 'id' | 'lastActivity' | 'score' | 'assignedTo'>) => void
  addLeadOpen: boolean
  setAddLeadOpen: (v: boolean) => void
}) {
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table')
  const [filterProject, setFilterProject] = useState('all')
  const [filterStage, setFilterStage] = useState('all')
  const [filterSource, setFilterSource] = useState('all')
  const [newLead, setNewLead] = useState({
    name: '', phone: '', email: '', source: 'Walk-in', project: 'Sunrise Heights', budget: '1-2 Cr', locality: '', stage: 'New Lead',
  })

  const projects = useMemo(() => [...new Set(leads.map(l => l.project))], [leads])

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      if (filterProject !== 'all' && l.project !== filterProject) return false
      if (filterStage !== 'all' && l.stage !== filterStage) return false
      if (filterSource !== 'all' && l.source !== filterSource) return false
      return true
    })
  }, [leads, filterProject, filterStage, filterSource])

  const handleSubmitNewLead = useCallback(() => {
    if (!newLead.name.trim() || !newLead.phone.trim()) return
    onAddLead({
      name: newLead.name,
      phone: newLead.phone.startsWith('+91') ? newLead.phone : `+91 ${newLead.phone}`,
      email: newLead.email,
      source: newLead.source,
      project: newLead.project,
      stage: newLead.stage,
      budget: newLead.budget,
      locality: newLead.locality,
    })
    setNewLead({ name: '', phone: '', email: '', source: 'Walk-in', project: 'Sunrise Heights', budget: '1-2 Cr', locality: '', stage: 'New Lead' })
    setAddLeadOpen(false)
  }, [newLead, onAddLead, setAddLeadOpen])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-serif text-foreground">Leads</h2>
          <p className="text-sm text-muted-foreground">{filteredLeads.length} leads found</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-lg p-0.5">
            <Button variant={viewMode === 'table' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('table')} className={viewMode === 'table' ? 'bg-primary text-primary-foreground' : ''}>
              <RiListCheck2 className="h-4 w-4 mr-1" />Table
            </Button>
            <Button variant={viewMode === 'kanban' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('kanban')} className={viewMode === 'kanban' ? 'bg-primary text-primary-foreground' : ''}>
              <RiLayoutColumnLine className="h-4 w-4 mr-1" />Kanban
            </Button>
          </div>
          <Button onClick={() => setAddLeadOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <RiAddLine className="mr-1 h-4 w-4" />Add Lead
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={filterProject} onValueChange={setFilterProject}>
          <SelectTrigger className="w-44 bg-background"><SelectValue placeholder="All Projects" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStage} onValueChange={setFilterStage}>
          <SelectTrigger className="w-40 bg-background"><SelectValue placeholder="All Stages" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterSource} onValueChange={setFilterSource}>
          <SelectTrigger className="w-40 bg-background"><SelectValue placeholder="All Sources" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Phone</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Project</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Stage</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Source</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Score</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Last Activity</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Assigned To</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map(lead => (
                    <tr
                      key={lead.id}
                      className="border-b border-border hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => onSelectLead(lead)}
                    >
                      <td className="py-3 px-4 font-medium text-foreground">{lead.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{lead.phone}</td>
                      <td className="py-3 px-4 text-foreground">{lead.project}</td>
                      <td className="py-3 px-4">{getStageBadge(lead.stage)}</td>
                      <td className="py-3 px-4 text-muted-foreground">{lead.source}</td>
                      <td className="py-3 px-4">{getScoreBadge(lead.score)}</td>
                      <td className="py-3 px-4 text-muted-foreground">{lead.lastActivity}</td>
                      <td className="py-3 px-4 text-muted-foreground">{lead.assignedTo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map(stage => {
            const stageLeads = filteredLeads.filter(l => l.stage === stage)
            return (
              <div key={stage} className="min-w-[260px] flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground">{stage}</h3>
                  <Badge variant="secondary" className="text-xs">{stageLeads.length}</Badge>
                </div>
                <div className="space-y-2">
                  {stageLeads.map(lead => (
                    <Card
                      key={lead.id}
                      className="bg-card border-border cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onSelectLead(lead)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground">{lead.name}</span>
                          {getScoreBadge(lead.score)}
                        </div>
                        <p className="text-xs text-muted-foreground">{lead.project}</p>
                        <p className="text-xs text-muted-foreground">{lead.locality}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">{lead.budget}</span>
                          <span className="text-xs text-muted-foreground">{lead.lastActivity}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="text-center py-6 text-xs text-muted-foreground border-2 border-dashed border-border rounded-lg">No leads</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Lead Dialog */}
      <Dialog open={addLeadOpen} onOpenChange={setAddLeadOpen}>
        <DialogContent className="bg-card max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Add New Lead</DialogTitle>
            <DialogDescription>Enter the lead details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label htmlFor="lead-name">Name *</Label>
              <Input id="lead-name" placeholder="Full name" value={newLead.name} onChange={(e) => setNewLead(prev => ({ ...prev, name: e.target.value }))} className="bg-background" />
            </div>
            <div>
              <Label htmlFor="lead-phone">Phone *</Label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 bg-muted rounded-md text-sm text-muted-foreground">+91</span>
                <Input id="lead-phone" placeholder="98765 43210" value={newLead.phone} onChange={(e) => setNewLead(prev => ({ ...prev, phone: e.target.value }))} className="bg-background" />
              </div>
            </div>
            <div>
              <Label htmlFor="lead-email">Email</Label>
              <Input id="lead-email" type="email" placeholder="email@example.com" value={newLead.email} onChange={(e) => setNewLead(prev => ({ ...prev, email: e.target.value }))} className="bg-background" />
            </div>
            <div>
              <Label>Source</Label>
              <Select value={newLead.source} onValueChange={(v) => setNewLead(prev => ({ ...prev, source: v }))}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Project Interest</Label>
              <Select value={newLead.project} onValueChange={(v) => setNewLead(prev => ({ ...prev, project: v }))}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SAMPLE_PROJECTS.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Budget Range</Label>
              <Select value={newLead.budget} onValueChange={(v) => setNewLead(prev => ({ ...prev, budget: v }))}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BUDGETS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="lead-locality">Locality Preference</Label>
              <Input id="lead-locality" placeholder="e.g., Whitefield, Bangalore" value={newLead.locality} onChange={(e) => setNewLead(prev => ({ ...prev, locality: e.target.value }))} className="bg-background" />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setAddLeadOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitNewLead} disabled={!newLead.name.trim() || !newLead.phone.trim()} className="bg-primary text-primary-foreground">Add Lead</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ===== FOLLOW-UPS SCREEN =====
function FollowUpsScreen({
  followUps,
  setFollowUps,
  onSuggestFollowUp,
  followUpCoachLoading,
  followUpCoachData,
  activeFollowUpId,
  activeAgentId,
}: {
  followUps: FollowUp[]
  setFollowUps: React.Dispatch<React.SetStateAction<FollowUp[]>>
  onSuggestFollowUp: (followUp: FollowUp) => void
  followUpCoachLoading: boolean
  followUpCoachData: FollowUpCoachResult | null
  activeFollowUpId: number | null
  activeAgentId: string | null
}) {
  const [dateFilter, setDateFilter] = useState<'today' | 'tomorrow' | 'week'>('today')
  const [copiedDraft, setCopiedDraft] = useState(false)

  const overdue = useMemo(() => followUps.filter(f => f.dueDate === 'overdue' && f.status === 'pending'), [followUps])
  const today = useMemo(() => followUps.filter(f => f.dueDate === 'today' && f.status === 'pending'), [followUps])
  const tomorrow = useMemo(() => followUps.filter(f => f.dueDate === 'tomorrow' && f.status === 'pending'), [followUps])
  const completed = useMemo(() => followUps.filter(f => f.status === 'done'), [followUps])

  const handleMarkDone = useCallback((id: number) => {
    setFollowUps(prev => prev.map(f => f.id === id ? { ...f, status: 'done' } : f))
  }, [setFollowUps])

  const handleReschedule = useCallback((id: number) => {
    setFollowUps(prev => prev.map(f => f.id === id ? { ...f, dueDate: 'tomorrow' } : f))
  }, [setFollowUps])

  const handleCopyDraft = useCallback(async (text: string) => {
    await copyToClipboard(text)
    setCopiedDraft(true)
    setTimeout(() => setCopiedDraft(false), 2000)
  }, [])

  const displayedGroups = useMemo(() => {
    const groups: { label: string; items: FollowUp[]; color: string }[] = []
    if (overdue.length > 0) groups.push({ label: 'Overdue', items: overdue, color: 'text-red-600' })
    if (dateFilter === 'today' || dateFilter === 'week') {
      if (today.length > 0) groups.push({ label: 'Due Today', items: today, color: 'text-amber-600' })
    }
    if (dateFilter === 'tomorrow' || dateFilter === 'week') {
      if (tomorrow.length > 0) groups.push({ label: 'Tomorrow', items: tomorrow, color: 'text-muted-foreground' })
    }
    return groups
  }, [dateFilter, overdue, today, tomorrow])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-serif text-foreground">Follow-Ups</h2>
          <p className="text-sm text-muted-foreground">Manage your pending follow-up tasks</p>
        </div>
      </div>

      {/* Date Filter */}
      <div className="flex gap-2">
        {(['today', 'tomorrow', 'week'] as const).map(f => (
          <Button key={f} variant={dateFilter === f ? 'default' : 'outline'} size="sm" onClick={() => setDateFilter(f)} className={dateFilter === f ? 'bg-primary text-primary-foreground' : ''}>
            {f === 'today' ? 'Today' : f === 'tomorrow' ? 'Tomorrow' : 'This Week'}
          </Button>
        ))}
      </div>

      {/* Follow-up Groups */}
      <div className="space-y-6">
        {displayedGroups.map(group => (
          <div key={group.label}>
            <h3 className={cn('text-sm font-semibold mb-3 flex items-center gap-2', group.color)}>
              {group.label === 'Overdue' && <RiAlertLine className="h-4 w-4" />}
              {group.label === 'Due Today' && <RiCalendarCheckLine className="h-4 w-4" />}
              {group.label === 'Tomorrow' && <RiCalendarLine className="h-4 w-4" />}
              {group.label} ({group.items.length})
            </h3>
            <div className="space-y-3">
              {group.items.map(fu => (
                <Card key={fu.id} className={cn('bg-card border-border border-l-4', getPriorityColor(fu.priority))}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getTypeIcon(fu.type)}
                          <span className="font-medium text-foreground">{fu.leadName}</span>
                          <Badge variant="outline" className="text-xs">{fu.type}</Badge>
                          <Badge variant="secondary" className="text-xs">{fu.project}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{fu.lastInteraction}</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleMarkDone(fu.id)}>
                            <RiCheckLine className="mr-1 h-3 w-3" />Done
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleReschedule(fu.id)}>
                            <RiRefreshLine className="mr-1 h-3 w-3" />Reschedule
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => onSuggestFollowUp(fu)}
                            disabled={followUpCoachLoading && activeFollowUpId === fu.id}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            {followUpCoachLoading && activeFollowUpId === fu.id ? (
                              <><RiLoader4Line className="mr-1 h-3 w-3 animate-spin" />Generating...</>
                            ) : (
                              <><RiMagicLine className="mr-1 h-3 w-3" />Suggest Follow-Up</>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Loading state for this follow-up */}
                    {followUpCoachLoading && activeFollowUpId === fu.id && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-3">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    )}

                    {/* Coach output for this follow-up */}
                    {!followUpCoachLoading && activeFollowUpId === fu.id && followUpCoachData && (
                      <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <RiSparklingLine className="h-4 w-4 text-primary" />
                          <span className="text-sm font-semibold text-foreground">AI Follow-Up Suggestion</span>
                        </div>

                        {/* Urgency + Tone */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {followUpCoachData.urgency_level && getUrgencyBadge(followUpCoachData.urgency_level)}
                          {followUpCoachData.message_tone && (
                            <Badge variant="outline" className="text-xs">
                              {followUpCoachData.message_tone === 'SMS' && <RiChat3Line className="mr-1 h-3 w-3" />}
                              {followUpCoachData.message_tone === 'Email' && <RiMailLine className="mr-1 h-3 w-3" />}
                              {followUpCoachData.message_tone === 'WhatsApp' && <RiWhatsappLine className="mr-1 h-3 w-3" />}
                              {followUpCoachData.message_tone}
                            </Badge>
                          )}
                          {followUpCoachData.optimal_timing && (
                            <Badge variant="outline" className="text-xs">
                              <RiTimeLine className="mr-1 h-3 w-3" />{followUpCoachData.optimal_timing}
                            </Badge>
                          )}
                        </div>

                        {/* Message Draft */}
                        {followUpCoachData.message_draft && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Message Draft</h4>
                              <Button size="sm" variant="ghost" onClick={() => handleCopyDraft(followUpCoachData.message_draft ?? '')} className="h-7 text-xs">
                                {copiedDraft ? <><RiCheckLine className="mr-1 h-3 w-3" />Copied</> : <><RiFileCopyLine className="mr-1 h-3 w-3" />Copy</>}
                              </Button>
                            </div>
                            <div className="p-3 bg-background rounded-lg border border-border text-sm whitespace-pre-wrap">{followUpCoachData.message_draft}</div>
                          </div>
                        )}

                        {/* Talking Points */}
                        {Array.isArray(followUpCoachData?.talking_points) && followUpCoachData.talking_points.length > 0 && (
                          <div>
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Talking Points</h4>
                            <ul className="space-y-1.5">
                              {followUpCoachData.talking_points.map((tp, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <RiCheckLine className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                  <span>{tp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Engagement Strategy */}
                        {followUpCoachData.engagement_strategy && (
                          <div>
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Engagement Strategy</h4>
                            <div className="p-3 bg-muted/50 rounded-lg">{renderMarkdown(followUpCoachData.engagement_strategy)}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {displayedGroups.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <RiCalendarCheckLine className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No follow-ups for the selected period.</p>
          </div>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-green-600 mb-3 flex items-center gap-2">
              <RiCheckboxCircleLine className="h-4 w-4" />Completed ({completed.length})
            </h3>
            <div className="space-y-2">
              {completed.map(fu => (
                <Card key={fu.id} className="bg-muted/30 border-border opacity-60">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <RiCheckboxCircleLine className="h-4 w-4 text-green-600" />
                      <span className="text-sm line-through text-muted-foreground">{fu.leadName} - {fu.type}</span>
                      <Badge variant="secondary" className="text-xs">{fu.project}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ===== PROJECTS SCREEN =====
function ProjectsScreen({
  projects,
  leads,
}: {
  projects: Project[]
  leads: Lead[]
}) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  if (selectedProject) {
    const linkedLeads = leads.filter(l => l.project === selectedProject.name)
    const soldUnits = selectedProject.totalUnits - selectedProject.availableUnits

    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setSelectedProject(null)} className="text-muted-foreground hover:text-foreground">
          <RiArrowLeftLine className="mr-2 h-4 w-4" />Back to Projects
        </Button>

        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-serif">{selectedProject.name}</CardTitle>
                <CardDescription>{selectedProject.location}</CardDescription>
              </div>
              <Badge variant="outline">{selectedProject.type}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground text-xs">RERA No.</p>
                <p className="font-medium text-foreground mt-1">{selectedProject.rera}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground text-xs">Total Units</p>
                <p className="font-medium text-foreground mt-1">{selectedProject.totalUnits}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground text-xs">Available</p>
                <p className="font-medium text-foreground mt-1">{selectedProject.availableUnits}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground text-xs">Price Range</p>
                <p className="font-medium text-foreground mt-1">{selectedProject.priceRange}</p>
              </div>
            </div>

            {/* Unit Inventory */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">Unit Inventory</h3>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex-1">
                  <Progress value={(soldUnits / selectedProject.totalUnits) * 100} className="h-3" />
                </div>
                <span className="text-sm text-muted-foreground">{soldUnits}/{selectedProject.totalUnits} sold</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Unit Type</th>
                      <th className="text-center py-2 px-3 text-muted-foreground font-medium">Total</th>
                      <th className="text-center py-2 px-3 text-muted-foreground font-medium">Available</th>
                      <th className="text-center py-2 px-3 text-muted-foreground font-medium">Booked</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['1 BHK', '2 BHK', '3 BHK', '4 BHK'].map((unit, i) => {
                      const total = Math.floor(selectedProject.totalUnits / 4) + (i < selectedProject.totalUnits % 4 ? 1 : 0)
                      const avail = Math.floor(selectedProject.availableUnits / 4) + (i < selectedProject.availableUnits % 4 ? 1 : 0)
                      return (
                        <tr key={unit} className="border-b border-border last:border-0">
                          <td className="py-2 px-3 font-medium">{unit}</td>
                          <td className="py-2 px-3 text-center">{total}</td>
                          <td className="py-2 px-3 text-center text-green-600">{avail}</td>
                          <td className="py-2 px-3 text-center text-amber-600">{total - avail}</td>
                          <td className="py-2 px-3 text-muted-foreground">{selectedProject.priceRange}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Linked Leads */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">Linked Leads ({linkedLeads.length})</h3>
              {linkedLeads.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Name</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Stage</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Score</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Budget</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Assigned</th>
                      </tr>
                    </thead>
                    <tbody>
                      {linkedLeads.map(lead => (
                        <tr key={lead.id} className="border-b border-border last:border-0">
                          <td className="py-2 px-3 font-medium">{lead.name}</td>
                          <td className="py-2 px-3">{getStageBadge(lead.stage)}</td>
                          <td className="py-2 px-3">{getScoreBadge(lead.score)}</td>
                          <td className="py-2 px-3 text-muted-foreground">{lead.budget}</td>
                          <td className="py-2 px-3 text-muted-foreground">{lead.assignedTo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No leads linked to this project.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-serif text-foreground">Projects</h2>
        <p className="text-sm text-muted-foreground">{projects.length} active projects</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(project => {
          const soldPct = ((project.totalUnits - project.availableUnits) / project.totalUnits) * 100
          const projectLeads = leads.filter(l => l.project === project.name)
          return (
            <Card
              key={project.id}
              className="bg-card border-border cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedProject(project)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-serif">{project.name}</CardTitle>
                  <Badge variant="outline" className="text-xs">{project.type}</Badge>
                </div>
                <CardDescription className="flex items-center gap-1">
                  <RiMapPinLine className="h-3 w-3" />{project.location}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <RiHashtag className="h-3 w-3" />{project.rera}
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Units: {project.totalUnits} total</span>
                    <span className="text-green-600 font-medium">{project.availableUnits} available</span>
                  </div>
                  <Progress value={soldPct} className="h-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{project.priceRange}</span>
                    <Badge variant="secondary" className="text-xs">{projectLeads.length} leads</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// ===== SETTINGS SCREEN =====
function SettingsScreen() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-serif text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your CRM preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-serif">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input defaultValue="Arjun Mehta" className="bg-background" />
            </div>
            <div>
              <Label>Email</Label>
              <Input defaultValue="arjun@buildercrm.in" className="bg-background" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input defaultValue="+91 99001 12233" className="bg-background" />
            </div>
            <Button className="bg-primary text-primary-foreground">Save Changes</Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-serif">Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Email Notifications</Label>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label>SMS Alerts</Label>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label>Follow-up Reminders</Label>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label>New Lead Alerts</Label>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-serif">Team Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {['Amit Kumar', 'Neha Gupta', 'Priyanka Das', 'Rahul Verma'].map(name => (
              <div key={name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">{name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <span className="text-sm font-medium">{name}</span>
                </div>
                <Badge variant="outline" className="text-xs">Active</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Agent Status Panel */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-serif flex items-center gap-2">
              <RiSparklingLine className="h-5 w-5 text-primary" />AI Agents
            </CardTitle>
            <CardDescription>AI agents powering this CRM</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm font-medium">Lead Intelligence Agent</p>
                <p className="text-xs text-muted-foreground">Qualifies & enriches leads with market data</p>
              </div>
              <Badge className="bg-green-100 text-green-700">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm font-medium">Follow-Up Coach Agent</p>
                <p className="text-xs text-muted-foreground">Generates personalized follow-up messages</p>
              </div>
              <Badge className="bg-green-100 text-green-700">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm font-medium">Pipeline Insights Agent</p>
                <p className="text-xs text-muted-foreground">Analyzes pipeline data with recommendations</p>
              </div>
              <Badge className="bg-green-100 text-green-700">Active</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ===== MAIN PAGE =====
export default function Page() {
  // --- Navigation ---
  const [screen, setScreen] = useState<ScreenType>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // --- Data ---
  const [leads, setLeads] = useState<Lead[]>(SAMPLE_LEADS)
  const [followUps, setFollowUps] = useState<FollowUp[]>(SAMPLE_FOLLOWUPS)
  const [projects] = useState<Project[]>(SAMPLE_PROJECTS)

  // --- Lead Detail ---
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [addLeadOpen, setAddLeadOpen] = useState(false)

  // --- Agent States ---
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)

  // Pipeline Insights
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [insightsData, setInsightsData] = useState<PipelineInsightsResult | null>(null)
  const [insightsOpen, setInsightsOpen] = useState(false)

  // Lead Intelligence
  const [enrichLoading, setEnrichLoading] = useState(false)
  const [enrichData, setEnrichData] = useState<LeadIntelligenceResult | null>(null)

  // Follow-Up Coach
  const [followUpCoachLoading, setFollowUpCoachLoading] = useState(false)
  const [followUpCoachData, setFollowUpCoachData] = useState<FollowUpCoachResult | null>(null)
  const [activeFollowUpId, setActiveFollowUpId] = useState<number | null>(null)

  // --- Sample Data Toggle ---
  const [sampleDataOn, setSampleDataOn] = useState(true)

  // --- Handlers ---
  const handleGenerateInsights = useCallback(async () => {
    setInsightsLoading(true)
    setInsightsOpen(true)
    setActiveAgentId(PIPELINE_INSIGHTS_AGENT)
    setInsightsData(null)
    try {
      const stageBreakdown = STAGES.map(s => `${s}: ${leads.filter(l => l.stage === s).length}`).join(', ')
      const message = `Analyze the pipeline data: Total leads: ${leads.length}. Stage breakdown: ${stageBreakdown}. Team: 4 members. Conversion rate: ~8.5%. Average deal size: Rs 1.5 Cr. Stale leads (>7 days no activity): ${leads.filter(l => l.lastActivity.includes('days')).length}. Please provide executive summary, conversion analysis, risk flags, performance highlights, actionable recommendations, stale lead analysis, and revenue forecast.`
      const result: AIAgentResponse = await callAIAgent(message, PIPELINE_INSIGHTS_AGENT)
      if (result.success && result?.response?.result) {
        const data = result.response.result
        setInsightsData({
          executive_summary: data?.executive_summary ?? '',
          conversion_analysis: data?.conversion_analysis ?? '',
          risk_flags: Array.isArray(data?.risk_flags) ? data.risk_flags : [],
          performance_highlights: Array.isArray(data?.performance_highlights) ? data.performance_highlights : [],
          actionable_recommendations: Array.isArray(data?.actionable_recommendations) ? data.actionable_recommendations : [],
          stale_lead_analysis: data?.stale_lead_analysis ?? '',
          revenue_forecast: data?.revenue_forecast ?? '',
        })
      }
    } catch (err) {
      // Error handled silently
    } finally {
      setInsightsLoading(false)
      setActiveAgentId(null)
    }
  }, [leads])

  const handleEnrichLead = useCallback(async (lead: Lead) => {
    setEnrichLoading(true)
    setActiveAgentId(LEAD_INTELLIGENCE_AGENT)
    setEnrichData(null)
    try {
      const message = `Analyze and qualify this lead: Name: ${lead.name}, Phone: ${lead.phone}, Email: ${lead.email}, Source: ${lead.source}, Project Interest: ${lead.project}, Budget: ${lead.budget}, Locality: ${lead.locality}, Current Stage: ${lead.stage}. Please provide qualification score (Hot/Warm/Cold), score reasoning, market context, builder reputation, recommended actions, locality insights, and budget analysis.`
      const result: AIAgentResponse = await callAIAgent(message, LEAD_INTELLIGENCE_AGENT)
      if (result.success && result?.response?.result) {
        const data = result.response.result
        setEnrichData({
          qualification_score: data?.qualification_score ?? '',
          score_reasoning: data?.score_reasoning ?? '',
          market_context: data?.market_context ?? '',
          builder_reputation: data?.builder_reputation ?? '',
          recommended_actions: Array.isArray(data?.recommended_actions) ? data.recommended_actions : [],
          locality_insights: data?.locality_insights ?? '',
          budget_analysis: data?.budget_analysis ?? '',
        })
      }
    } catch (err) {
      // Error handled silently
    } finally {
      setEnrichLoading(false)
      setActiveAgentId(null)
    }
  }, [])

  const handleSuggestFollowUp = useCallback(async (followUp: FollowUp) => {
    setFollowUpCoachLoading(true)
    setActiveFollowUpId(followUp.id)
    setActiveAgentId(FOLLOW_UP_COACH_AGENT)
    setFollowUpCoachData(null)
    try {
      const message = `Generate a follow-up suggestion for: Lead: ${followUp.leadName}, Project: ${followUp.project}, Last Interaction: ${followUp.lastInteraction}, Follow-up Type: ${followUp.type}, Priority: ${followUp.priority}, Due: ${followUp.dueDate}. Please provide message draft, message tone (SMS/Email/WhatsApp), optimal timing, talking points, engagement strategy, and urgency level.`
      const result: AIAgentResponse = await callAIAgent(message, FOLLOW_UP_COACH_AGENT)
      if (result.success && result?.response?.result) {
        const data = result.response.result
        setFollowUpCoachData({
          message_draft: data?.message_draft ?? '',
          message_tone: data?.message_tone ?? '',
          optimal_timing: data?.optimal_timing ?? '',
          talking_points: Array.isArray(data?.talking_points) ? data.talking_points : [],
          engagement_strategy: data?.engagement_strategy ?? '',
          urgency_level: data?.urgency_level ?? '',
        })
      }
    } catch (err) {
      // Error handled silently
    } finally {
      setFollowUpCoachLoading(false)
      setActiveAgentId(null)
    }
  }, [])

  const handleSelectLead = useCallback((lead: Lead) => {
    setSelectedLead(lead)
    setEnrichData(null)
  }, [])

  const handleBackFromDetail = useCallback(() => {
    setSelectedLead(null)
    setEnrichData(null)
  }, [])

  const handleAddLead = useCallback((data: Omit<Lead, 'id' | 'lastActivity' | 'score' | 'assignedTo'>) => {
    const assignees = ['Amit Kumar', 'Neha Gupta', 'Priyanka Das', 'Rahul Verma']
    const newLead: Lead = {
      ...data,
      id: leads.length + 1,
      lastActivity: 'Just now',
      score: 'Cold',
      assignedTo: assignees[leads.length % assignees.length] ?? 'Amit Kumar',
    }
    setLeads(prev => [...prev, newLead])
  }, [leads.length])

  const handleSampleDataToggle = useCallback((on: boolean) => {
    setSampleDataOn(on)
    if (on) {
      setLeads(SAMPLE_LEADS)
      setFollowUps(SAMPLE_FOLLOWUPS)
    } else {
      setLeads([])
      setFollowUps([])
    }
    setSelectedLead(null)
    setEnrichData(null)
    setInsightsData(null)
    setFollowUpCoachData(null)
  }, [])

  // Navigation items
  const navItems = [
    { id: 'dashboard' as ScreenType, label: 'Dashboard', icon: RiDashboardLine },
    { id: 'leads' as ScreenType, label: 'Leads', icon: RiUserLine },
    { id: 'follow-ups' as ScreenType, label: 'Follow-Ups', icon: RiCalendarCheckLine },
    { id: 'projects' as ScreenType, label: 'Projects', icon: RiBuildingLine },
    { id: 'settings' as ScreenType, label: 'Settings', icon: RiSettings4Line },
  ]

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground font-serif flex">
        {/* Sidebar */}
        <aside className={cn('bg-card border-r border-border flex flex-col transition-all duration-300 shrink-0', sidebarOpen ? 'w-56' : 'w-16')}>
          {/* Logo */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <RiHome4Line className="h-4 w-4 text-primary-foreground" />
              </div>
              {sidebarOpen && <span className="text-lg font-bold font-serif text-foreground tracking-tight">BuilderCRM</span>}
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setScreen(item.id); setSelectedLead(null); setEnrichData(null) }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                  screen === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* Agent Status in Sidebar */}
          {sidebarOpen && (
            <div className="p-3 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">AI Agents</p>
              <div className="space-y-1.5">
                {[
                  { name: 'Lead Intel', id: LEAD_INTELLIGENCE_AGENT },
                  { name: 'Follow-Up', id: FOLLOW_UP_COACH_AGENT },
                  { name: 'Pipeline', id: PIPELINE_INSIGHTS_AGENT },
                ].map(agent => (
                  <div key={agent.id} className="flex items-center gap-2 text-xs">
                    <div className={cn('w-2 h-2 rounded-full', activeAgentId === agent.id ? 'bg-amber-400 animate-pulse' : 'bg-green-500')} />
                    <span className="text-muted-foreground">{agent.name}</span>
                    {activeAgentId === agent.id && <span className="text-amber-600 text-[10px]">Running</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(prev => !prev)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                <RiMenuLine className="h-5 w-5" />
              </button>
              <div className="relative">
                <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads, projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64 bg-background h-9 text-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Sample Data Toggle */}
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground cursor-pointer" htmlFor="sample-toggle">Sample Data</Label>
                <Switch id="sample-toggle" checked={sampleDataOn} onCheckedChange={handleSampleDataToggle} />
              </div>
              <Separator orientation="vertical" className="h-6" />
              <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground relative">
                <RiNotification3Line className="h-5 w-5" />
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">AM</span>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto p-6">
            {screen === 'dashboard' && (
              <DashboardScreen
                leads={leads}
                onGenerateInsights={handleGenerateInsights}
                insightsLoading={insightsLoading}
                insightsData={insightsData}
                insightsOpen={insightsOpen}
                setInsightsOpen={setInsightsOpen}
                activeAgentId={activeAgentId}
              />
            )}

            {screen === 'leads' && !selectedLead && (
              <LeadsScreen
                leads={leads}
                onSelectLead={handleSelectLead}
                onAddLead={handleAddLead}
                addLeadOpen={addLeadOpen}
                setAddLeadOpen={setAddLeadOpen}
              />
            )}

            {screen === 'leads' && selectedLead && (
              <LeadDetailScreen
                lead={selectedLead}
                onBack={handleBackFromDetail}
                enrichLoading={enrichLoading}
                enrichData={enrichData}
                onEnrich={handleEnrichLead}
                activeAgentId={activeAgentId}
              />
            )}

            {screen === 'follow-ups' && (
              <FollowUpsScreen
                followUps={followUps}
                setFollowUps={setFollowUps}
                onSuggestFollowUp={handleSuggestFollowUp}
                followUpCoachLoading={followUpCoachLoading}
                followUpCoachData={followUpCoachData}
                activeFollowUpId={activeFollowUpId}
                activeAgentId={activeAgentId}
              />
            )}

            {screen === 'projects' && (
              <ProjectsScreen projects={projects} leads={leads} />
            )}

            {screen === 'settings' && (
              <SettingsScreen />
            )}

            {/* Empty state when sample data is off and no leads */}
            {!sampleDataOn && leads.length === 0 && screen !== 'settings' && screen !== 'projects' && (
              <div className="text-center py-16">
                <RiUserSmileLine className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No data yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Turn on Sample Data to explore the CRM, or add your first lead to get started.</p>
                {screen === 'leads' && (
                  <Button onClick={() => setAddLeadOpen(true)} className="bg-primary text-primary-foreground">
                    <RiAddLine className="mr-2 h-4 w-4" />Add Your First Lead
                  </Button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}
