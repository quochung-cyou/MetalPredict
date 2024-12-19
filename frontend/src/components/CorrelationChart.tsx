"use client"

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell, Legend, BarChart, Bar, Rectangle } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchScatterData, fetchHistogramData, fetchHeatmapData } from '@/lib/api'
import { format } from 'date-fns'
import * as d3 from 'd3'
import './AdvancedCommodityAnalysis.css'

const COLORS = {
  gold: '#FFD700',
  silver: '#C0C0C0',
  positive: '#4CAF50',
  negative: '#F44336'
}

const AnimatedChart = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5 }}
  >
    {children}
  </motion.div>
)

const LoadingSkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="h-[600px] w-full" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
    </div>
  </div>
)

const ErrorAlert = ({ message }: { message: string }) => (
  <Alert variant="destructive">
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
)

export default function AdvancedCommodityAnalysis() {
  const [activeTab, setActiveTab] = useState('scatter')

  const { data: scatterData, isLoading: isLoadingScatter, error: scatterError } = useQuery({
    queryKey: ['scatter'],
    queryFn: fetchScatterData
  })

  const { data: histogramData, isLoading: isLoadingHistogram, error: histogramError } = useQuery({
    queryKey: ['histogram'],
    queryFn: fetchHistogramData
  })

  const { data: heatmapData, isLoading: isLoadingHeatmap, error: heatmapError } = useQuery({
    queryKey: ['heatmap'],
    queryFn: fetchHeatmapData
  })

  const formatScatterData = useMemo(() => {
    if (!scatterData) return { gold: [], silver: [] }
    return {
      gold: scatterData.gold.map((item: any) => ({
        date: new Date(item.Date).getTime(),
        price: item.Price
      })),
      silver: scatterData.silver.map((item: any) => ({
        date: new Date(item.Date).getTime(),
        price: item.Price
      }))
    }
  }, [scatterData])

  const formatHistogramData = useMemo(() => {
    if (!histogramData) return []
    const goldReturns = histogramData.gold_returns
    const silverReturns = histogramData.silver_returns
    const allReturns = [...goldReturns, ...silverReturns]
    const bins = d3.histogram().thresholds(20)(allReturns)
    
    return bins.map((bin) => ({
      x0: bin.x0,
      x1: bin.x1,
      goldCount: goldReturns.filter(r => r >= bin.x0 && r < bin.x1).length,
      silverCount: silverReturns.filter(r => r >= bin.x0 && r < bin.x1).length
    }))
  }, [histogramData])

  const formatHeatmapData = useMemo(() => {
    if (!heatmapData) return { data: [], columns: [] }
    const columns = Object.keys(heatmapData[Object.keys(heatmapData)[0]])
    const data = Object.entries(heatmapData).map(([row, values]: [string, any]) => ({
      metric: row,
      ...values
    }))
    return { data, columns }
  }, [heatmapData])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-300 rounded shadow">
          <p className="font-bold">{label}</p>
          <p className="text-sm">Price: ${payload[0].value.toFixed(2)}</p>
        </div>
      )
    }
    return null
  }

  const CustomHistogramTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-2 border border-gray-300 rounded shadow">
          <p className="font-bold">Return Range: {data.x0.toFixed(2)}% to {data.x1.toFixed(2)}%</p>
          <p className="text-sm">Gold Count: {data.goldCount}</p>
          <p className="text-sm">Silver Count: {data.silverCount}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle>Advanced Commodity Analysis Dashboard</CardTitle>
        <CardDescription>Comprehensive analysis of Gold and Silver market trends</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scatter">Price Trends</TabsTrigger>
            <TabsTrigger value="histogram">Return Distribution</TabsTrigger>
            <TabsTrigger value="heatmap">Correlation Heatmap</TabsTrigger>
          </TabsList>
          <AnimatePresence mode="wait">
            <TabsContent value="scatter" key="scatter">
              {isLoadingScatter ? (
                <LoadingSkeleton />
              ) : scatterError ? (
                <ErrorAlert message="Failed to load price trend data" />
              ) : (
                <AnimatedChart>
                  <div className="h-[600px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <XAxis
                          dataKey="date"
                          name="Date"
                          tickFormatter={(unixTime) => format(new Date(unixTime), 'MMM yyyy')}
                          type="number"
                          domain={['dataMin', 'dataMax']}
                        />
                        <YAxis yAxisId="gold" dataKey="price" name="Gold Price" unit="$" stroke={COLORS.gold} />
                        <YAxis yAxisId="silver" dataKey="price" name="Silver Price" unit="$" orientation="right" stroke={COLORS.silver} />
                        <ZAxis range={[50, 200]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Scatter yAxisId="gold" name="Gold" data={formatScatterData.gold} fill={COLORS.gold}>
                          {formatScatterData.gold.map((entry: any, index: number) => (
                            <Cell key={`cell-gold-${index}`} fill={COLORS.gold} />
                          ))}
                        </Scatter>
                        <Scatter yAxisId="silver" name="Silver" data={formatScatterData.silver} fill={COLORS.silver}>
                          {formatScatterData.silver.map((entry: any, index: number) => (
                            <Cell key={`cell-silver-${index}`} fill={COLORS.silver} />
                          ))}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </AnimatedChart>
              )}
            </TabsContent>
            <TabsContent value="histogram" key="histogram">
              {isLoadingHistogram ? (
                <LoadingSkeleton />
              ) : histogramError ? (
                <ErrorAlert message="Failed to load return distribution data" />
              ) : (
                <AnimatedChart>
                  <div className="h-[600px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={formatHistogramData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <XAxis 
                          dataKey="x0" 
                          tickFormatter={(value) => `${value.toFixed(1)}%`}
                          label={{ value: 'Returns (%)', position: 'insideBottom', offset: -10 }}
                        />
                        <YAxis label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }} />
                        <Tooltip content={<CustomHistogramTooltip />} />
                        <Legend />
                        <Bar dataKey="goldCount" name="Gold Returns" fill={COLORS.gold} opacity={0.8} />
                        <Bar dataKey="silverCount" name="Silver Returns" fill={COLORS.silver} opacity={0.8} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </AnimatedChart>
              )}
            </TabsContent>
            <TabsContent value="heatmap" key="heatmap">
              {isLoadingHeatmap ? (
                <LoadingSkeleton />
              ) : heatmapError ? (
                <ErrorAlert message="Failed to load correlation heatmap data" />
              ) : (
                <AnimatedChart>
                  <HeatmapChart data={formatHeatmapData.data} columns={formatHeatmapData.columns} />
                </AnimatedChart>
              )}
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </CardContent>
    </Card>
  )
}

interface HeatmapChartProps {
  data: any[];
  columns: string[];
}

function HeatmapChart({ data, columns }: HeatmapChartProps) {
  const getColor = (value: number) => {
    const hue = ((1 - Math.abs(value)) * 120).toString(10);
    return `hsl(${hue}, 100%, 50%)`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2 border">Metric</th>
            {columns.map((col) => (
              <th key={col} className="p-2 border">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td className="p-2 border font-bold">{row.metric}</td>
              {columns.map((col) => (
                <td
                  key={col}
                  className="p-2 border text-center"
                  style={{ backgroundColor: getColor(row[col]), color: Math.abs(row[col]) > 0.5 ? 'white' : 'black' }}
                >
                  {row[col].toFixed(2)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
