"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getPromptStats } from "@/app/actions"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from "recharts"
import { Loader2, Calendar, TrendingUp, Users, FileText, Tag, Clock, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Section } from "./layout/section"
import { SlideUp, FadeIn } from "./ui/motion"

interface PromptStats {
  total: number
  byCategory: Record<string, number>
  recentlyCreated: number
  recentlyUpdated: number
}

// Mock data for enhanced analytics - in a real app, this would come from an API
const USAGE_DATA = [
  { month: "Jan", usage: 65, completion: 52 },
  { month: "Feb", usage: 78, completion: 67 },
  { month: "Mar", usage: 92, completion: 79 },
  { month: "Apr", usage: 110, completion: 98 },
  { month: "May", usage: 125, completion: 115 },
  { month: "Jun", usage: 147, completion: 132 },
  { month: "Jul", usage: 170, completion: 150 },
]

const PROMPT_ACTIVITY = [
  { date: "2023-07-01", created: 5, edited: 2 },
  { date: "2023-07-02", created: 3, edited: 4 },
  { date: "2023-07-03", created: 7, edited: 1 },
  { date: "2023-07-04", created: 2, edited: 6 },
  { date: "2023-07-05", created: 8, edited: 3 },
  { date: "2023-07-06", created: 4, edited: 5 },
  { date: "2023-07-07", created: 6, edited: 2 },
]

const PROMPT_EFFECTIVENESS = [
  { category: "Contract Review", effectiveness: 92 },
  { category: "Legal Research", effectiveness: 85 },
  { category: "Client Advice", effectiveness: 78 },
  { category: "Litigation", effectiveness: 88 },
  { category: "Compliance", effectiveness: 95 },
]

export function EnhancedDashboard() {
  const [stats, setStats] = useState<PromptStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("7d")
  const [chartType, setChartType] = useState("bar")

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getPromptStats()
        setStats(data)
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Failed to load statistics.</p>
      </div>
    )
  }

  // Prepare data for charts
  const categoryData = Object.entries(stats.byCategory).map(([name, value]) => ({
    name,
    value,
  }))

  // Colors for charts
  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--primary))",
  ]

  return (
    <div className="space-y-8">
      <SlideUp>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          <Card className="transition-all hover:shadow-md hover:border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Total Prompts
              </CardTitle>
              <CardDescription>All prompts in the database</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-md hover:border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Recently Created
              </CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.recentlyCreated}</div>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-md hover:border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Categories
              </CardTitle>
              <CardDescription>Total categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{Object.keys(stats.byCategory).length}</div>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-md hover:border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Avg. Variables
              </CardTitle>
              <CardDescription>Per prompt</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">2.4</div>
            </CardContent>
          </Card>
        </div>
      </SlideUp>

      <FadeIn>
        <Section
          title="Prompt Analytics"
          description="Insights about your prompt library and usage"
          contentClassName="space-y-6"
        >
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Tabs defaultValue="categories" className="w-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <TabsList>
                  <TabsTrigger value="categories">Categories</TabsTrigger>
                  <TabsTrigger value="usage">Usage</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <div className="flex flex-wrap items-center gap-2">
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-full sm:w-[120px] h-8">
                      <Calendar className="h-3.5 w-3.5 mr-2" />
                      <SelectValue placeholder="Time Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                      <SelectItem value="1y">Last year</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={chartType} onValueChange={setChartType}>
                    <SelectTrigger className="w-full sm:w-[120px] h-8">
                      <Filter className="h-3.5 w-3.5 mr-2" />
                      <SelectValue placeholder="Chart Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="pie">Pie Chart</SelectItem>
                      <SelectItem value="line">Line Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <TabsContent value="categories">
                <Card>
                  <CardHeader>
                    <CardTitle>Prompts by Category</CardTitle>
                    <CardDescription>Distribution of prompts across categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      {categoryData.length > 0 ? (
                        chartType === "bar" ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData} layout="vertical" margin={{ left: 20, right: 20 }}>
                              <XAxis type="number" />
                              <YAxis type="category" dataKey="name" width={100} />
                              <Tooltip />
                              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : chartType === "pie" ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="hsl(var(--primary))"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                {categoryData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={categoryData} margin={{ left: 20, right: 20 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        )
                      ) : (
                        <div className="flex justify-center items-center h-full">
                          <p className="text-muted-foreground">No category data available</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="usage">
                <Card>
                  <CardHeader>
                    <CardTitle>Prompt Usage Over Time</CardTitle>
                    <CardDescription>How often prompts are being used</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={USAGE_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="month" />
                          <YAxis />
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <Tooltip />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="usage"
                            stroke="hsl(var(--primary))"
                            fillOpacity={1}
                            fill="url(#colorUsage)"
                          />
                          <Area
                            type="monotone"
                            dataKey="completion"
                            stroke="hsl(var(--chart-2))"
                            fillOpacity={1}
                            fill="url(#colorCompletion)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle>Prompt Activity</CardTitle>
                    <CardDescription>Creation and editing activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={PROMPT_ACTIVITY} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="created" fill="hsl(var(--primary))" name="Created" />
                          <Bar dataKey="edited" fill="hsl(var(--chart-4))" name="Edited" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Prompt Effectiveness</CardTitle>
                <CardDescription>Based on user feedback and completion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={PROMPT_EFFECTIVENESS} layout="vertical" margin={{ left: 20, right: 20 }}>
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis type="category" dataKey="category" width={100} />
                      <Tooltip formatter={(value) => [`${value}%`, "Effectiveness"]} />
                      <Bar
                        dataKey="effectiveness"
                        fill="hsl(var(--primary))"
                        radius={[0, 4, 4, 0]}
                        label={{ position: "right", formatter: (value) => `${value}%` }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prompt Insights</CardTitle>
                <CardDescription>Key metrics and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Top Performing Category
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Compliance</span> - 95% effectiveness rate
                    </p>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      User Engagement
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">32% increase</span> in prompt usage this month
                    </p>
                  </div>

                  <div className="bg-primary/5 border border-primary/10 p-4 rounded-lg">
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2 text-primary">
                      <Loader2 className="h-4 w-4" />
                      Recommendation
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Consider adding more prompts in the{" "}
                      <span className="font-medium text-foreground">Client Advice</span> category to improve coverage.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>
      </FadeIn>
    </div>
  )
}

