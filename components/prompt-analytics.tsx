"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { TrendingUp, BarChart2, PieChartIcon, LineChartIcon } from "lucide-react"
import { getPromptAnalytics } from "@/app/actions"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PromptAnalyticsProps {
  promptId: number
}

interface AnalyticsData {
  usageOverTime: {
    date: string
    count: number
  }[]
  responseTimeAvg: number
  usageCount: number
  completionRate: number
  usageByTime: {
    hour: number
    count: number
  }[]
  usageByDay: {
    day: string
    count: number
  }[]
  variableUsage: {
    variable: string
    count: number
    percentage: number
  }[]
}

export function PromptAnalytics({ promptId }: PromptAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d")

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--primary))",
  ]

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true)
      try {
        const result = await getPromptAnalytics(promptId, timeRange)
        if (result.success) {
          setAnalytics(result.data)
        } else {
          setError(result.error || "Failed to load analytics")
        }
      } catch (error) {
        console.error("Error loading analytics:", error)
        setError("Failed to load analytics")
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalytics()
  }, [promptId, timeRange])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prompt Analytics</CardTitle>
          <CardDescription>Error loading analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prompt Analytics</CardTitle>
          <CardDescription>No analytics data available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This prompt doesn't have any usage data yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Prompt Analytics
          </CardTitle>
          <CardDescription>Usage statistics and performance metrics</CardDescription>
        </div>

        <Select value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.usageCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Total times this prompt has been used</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.responseTimeAvg}ms</div>
              <p className="text-xs text-muted-foreground mt-1">Average AI response generation time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.completionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">Percentage of successful completions</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="usage">
          <TabsList>
            <TabsTrigger value="usage" className="gap-1">
              <LineChartIcon className="h-4 w-4" />
              Usage Trends
            </TabsTrigger>
            <TabsTrigger value="time" className="gap-1">
              <BarChart2 className="h-4 w-4" />
              Time Analysis
            </TabsTrigger>
            <TabsTrigger value="variables" className="gap-1">
              <PieChartIcon className="h-4 w-4" />
              Variables
            </TabsTrigger>
          </TabsList>

          <TabsContent value="usage" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Usage Over Time</CardTitle>
                <CardDescription>Number of times this prompt has been used over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.usageOverTime} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                        name="Usage Count"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="time" className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Usage by Hour of Day</CardTitle>
                <CardDescription>When this prompt is most frequently used</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.usageByTime} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" name="Usage Count" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Usage by Day of Week</CardTitle>
                <CardDescription>Which days this prompt is used most</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.usageByDay} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--chart-2))" name="Usage Count" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="variables" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Variable Usage</CardTitle>
                <CardDescription>How frequently each variable is used</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.variableUsage}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="hsl(var(--primary))"
                          dataKey="count"
                          nameKey="variable"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {analytics.variableUsage.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Variable Details</h4>
                    <div className="space-y-2">
                      {analytics.variableUsage.map((variable, index) => (
                        <div
                          key={variable.variable}
                          className="flex justify-between items-center p-2 bg-muted/50 rounded-md"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="font-medium">{variable.variable}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{variable.count} uses</Badge>
                            <Badge>{variable.percentage}%</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

