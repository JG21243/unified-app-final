"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getPromptStats } from "@/app/actions"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Loader2 } from "lucide-react"

interface PromptStats {
  total: number
  byCategory: Record<string, number>
  recentlyCreated: number
  recentlyUpdated: number
}

export function Dashboard() {
  const [stats, setStats] = useState<PromptStats | null>(null)
  const [loading, setLoading] = useState(true)

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
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

  const summaryData = [
    { name: "Total Prompts", value: stats.total },
    { name: "Recently Created", value: stats.recentlyCreated },
    { name: "Recently Updated", value: stats.recentlyUpdated },
  ]

  // Colors for pie chart
  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--primary))",
  ]

  // Enhance dashboard responsiveness
  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Total Prompts</CardTitle>
            <CardDescription>All prompts in the database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Recently Created</CardTitle>
            <CardDescription>Prompts created in the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats.recentlyCreated}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Categories</CardTitle>
            <CardDescription>Total number of categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{Object.keys(stats.byCategory).length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Prompts by Category</CardTitle>
              <CardDescription>Distribution of prompts across categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[50vh] sm:h-80">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} layout="vertical" margin={{ left: 20, right: 20 }}>
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--primary))" />
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

        <TabsContent value="summary" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Prompt Summary</CardTitle>
              <CardDescription>Overview of prompt statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[50vh] sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

