"use client"

import { useEffect, useState } from "react"
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
} from "recharts"
import { BarChart2, FileText, Tag, Clock, TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { motion } from "framer-motion"

interface PromptStats {
  total: number
  byCategory: Record<string, number>
  recentlyCreated: number
  recentlyUpdated: number
  mostUsed: { name: string; count: number }[]
}

export function DashboardStats() {
  const [stats, setStats] = useState<PromptStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const data = await getPromptStats()
        setStats(data)
        setError(null)
      } catch (error) {
        console.error("Error fetching stats:", error)
        setError("Failed to load statistics. Please try again later.")
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

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!stats) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No statistics available.</p>
      </div>
    )
  }

  // Prepare data for charts
  const categoryData = Object.entries(stats.byCategory).map(([name, value]) => ({
    name,
    value,
  }))

  // Colors for pie chart
  const COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

  // Sample data for line chart
  const usageData = [
    { month: "Jan", usage: 65 },
    { month: "Feb", usage: 78 },
    { month: "Mar", usage: 92 },
    { month: "Apr", usage: 110 },
    { month: "May", usage: 125 },
    { month: "Jun", usage: 147 },
    { month: "Jul", usage: 170 },
  ]

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-all hover:shadow-md border-l-4 border-l-primary">
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

        <Card className="transition-all hover:shadow-md border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Recently Created
            </CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.recentlyCreated}</div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4 text-green-500" />
              Categories
            </CardTitle>
            <CardDescription>Total categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Object.keys(stats.byCategory).length}</div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-500" />
              Most Used
            </CardTitle>
            <CardDescription>Top prompt usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.mostUsed && stats.mostUsed.length > 0 ? stats.mostUsed[0].count : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList className="bg-muted/70 p-1 shadow-sm">
          <TabsTrigger
            value="categories"
            className="gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <BarChart2 className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="distribution" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Distribution
          </TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Usage Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="pt-4 space-y-4">
          <h3 className="text-2xl font-semibold tracking-tight">Prompts by Category</h3>
          <p className="text-sm text-muted-foreground">Distribution of prompts across different categories</p>

          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="h-80">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} layout="vertical" margin={{ left: 20, right: 20 }}>
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-muted-foreground">No category data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="pt-4 space-y-4">
          <h3 className="text-2xl font-semibold tracking-tight">Category Distribution</h3>
          <p className="text-sm text-muted-foreground">Percentage breakdown of prompt categories</p>

          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="pt-4 space-y-4">
          <h3 className="text-2xl font-semibold tracking-tight">Usage Trends</h3>
          <p className="text-sm text-muted-foreground">Monthly prompt usage over time</p>

          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={usageData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="usage" stroke="#4f46e5" strokeWidth={2} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

