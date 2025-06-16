"use client"

import { useState } from "react";
import { 
  BarChart as ChartIcon, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WeeklyScore, MonthlyScore } from "@/types";
import { format, parseISO, subMonths, subWeeks } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CalendarDays, Calendar } from "lucide-react";

interface ScoreChartsProps {
  weeklyScores: WeeklyScore[];
  monthlyScores: MonthlyScore[];
}

export default function ScoreCharts({ weeklyScores, monthlyScores }: ScoreChartsProps) {
  const [weekRange, setWeekRange] = useState("4"); // Default to 4 weeks
  const [monthRange, setMonthRange] = useState("6"); // Default to 6 months
  
  // Filter scores based on selected range
  const filteredWeeklyScores = weeklyScores
    .slice(-parseInt(weekRange))
    .map(item => ({
      ...item,
      week: format(parseISO(item.weekStarting), "MMM d"),
      weekFull: format(parseISO(item.weekStarting), "MMMM d, yyyy"),
      difference: Math.abs(item.partner1Score - item.partner2Score),
      leader: item.partner1Score > item.partner2Score ? "Partner 1" : 
              item.partner1Score < item.partner2Score ? "Partner 2" : "Tie"
    }));

  const filteredMonthlyScores = monthlyScores
    .slice(-parseInt(monthRange))
    .map(item => ({
      ...item,
      monthLabel: format(parseISO(item.month + "-01"), "MMM yyyy"),
      monthFull: format(parseISO(item.month + "-01"), "MMMM yyyy"),
      difference: Math.abs(item.partner1Score - item.partner2Score),
      leader: item.partner1Score > item.partner2Score ? "Partner 1" : 
              item.partner1Score < item.partner2Score ? "Partner 2" : "Tie"
    }));

  const dateRanges = {
    weekly: {
      start: weeklyScores.length > 0 ? 
        format(parseISO(weeklyScores[0].weekStarting), "MMM d, yyyy") : 
        format(subWeeks(new Date(), parseInt(weekRange)), "MMM d, yyyy"),
      end: format(new Date(), "MMM d, yyyy")
    },
    monthly: {
      start: monthlyScores.length > 0 ? 
        format(parseISO(monthlyScores[0].month + "-01"), "MMM yyyy") : 
        format(subMonths(new Date(), parseInt(monthRange)), "MMM yyyy"),
      end: format(new Date(), "MMM yyyy")
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary">
        <CardHeader className="pb-0">
          <CardTitle className="text-2xl">Score History</CardTitle>
          <CardDescription className="text-base">
            Compare partner performance over time
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <Tabs defaultValue="weekly" className="space-y-4">
            <div className="border-b mb-6">
              <TabsList className="w-full h-14 grid grid-cols-2 bg-transparent">
                <TabsTrigger 
                  value="weekly" 
                  className="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-14 text-lg flex gap-2 items-center justify-center"
                >
                  <Calendar className="h-5 w-5" />
                  Weekly View
                </TabsTrigger>
                <TabsTrigger 
                  value="monthly" 
                  className="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-14 text-lg flex gap-2 items-center justify-center"
                >
                  <CalendarDays className="h-5 w-5" />
                  Monthly View
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="weekly" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Weekly Performance</h3>
                <div className="flex items-center gap-2">
                  <Label htmlFor="week-range">Display:</Label>
                  <Select value={weekRange} onValueChange={setWeekRange}>
                    <SelectTrigger id="week-range" className="w-[120px]">
                      <SelectValue placeholder="Select weeks" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 Weeks</SelectItem>
                      <SelectItem value="8">8 Weeks</SelectItem>
                      <SelectItem value="12">12 Weeks</SelectItem>
                      <SelectItem value="26">26 Weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Card className="bg-muted/20 p-3">
                <CardDescription className="text-center pb-2">
                  Data from {dateRanges.weekly.start} to {dateRanges.weekly.end}
                </CardDescription>
              </Card>
              
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ChartIcon
                    data={filteredWeeklyScores}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [value, name === "partner1Score" ? "Partner 1" : "Partner 2"]}
                      labelFormatter={(label, items) => {
                        const item = filteredWeeklyScores.find(s => s.week === label);
                        return item ? `Week of ${item.weekFull}` : label;
                      }}
                    />
                    <Legend formatter={(value) => value === "partner1Score" ? "Partner 1" : "Partner 2"} />
                    <Bar 
                      name="partner1Score" 
                      dataKey="partner1Score" 
                      fill="#8884d8" 
                    />
                    <Bar 
                      name="partner2Score" 
                      dataKey="partner2Score" 
                      fill="#82ca9d" 
                    />
                  </ChartIcon>
                </ResponsiveContainer>
              </div>
              
              <h4 className="text-xl font-semibold mt-8 mb-4">Weekly Details</h4>
              <div className="space-y-2">
                {filteredWeeklyScores.length > 0 ? (
                  filteredWeeklyScores.map((score, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between">
                        <div>
                          <h5 className="font-medium">Week of {score.weekFull}</h5>
                          <p className="text-sm text-muted-foreground">
                            {score.leader === "Tie" ? "Tied scores" : `${score.leader} is ahead by ${score.difference} points`}
                          </p>
                        </div>
                        <div className="flex gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Partner 1</p>
                            <p className="text-lg font-bold">{score.partner1Score}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Partner 2</p>
                            <p className="text-lg font-bold">{score.partner2Score}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-center py-4 text-muted-foreground">No weekly data available</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="monthly" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Monthly Performance</h3>
                <div className="flex items-center gap-2">
                  <Label htmlFor="month-range">Display:</Label>
                  <Select value={monthRange} onValueChange={setMonthRange}>
                    <SelectTrigger id="month-range" className="w-[120px]">
                      <SelectValue placeholder="Select months" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Months</SelectItem>
                      <SelectItem value="6">6 Months</SelectItem>
                      <SelectItem value="12">12 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Card className="bg-muted/20 p-3">
                <CardDescription className="text-center pb-2">
                  Data from {dateRanges.monthly.start} to {dateRanges.monthly.end}
                </CardDescription>
              </Card>
              
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ChartIcon
                    data={filteredMonthlyScores}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="monthLabel" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [value, name === "partner1Score" ? "Partner 1" : "Partner 2"]}
                      labelFormatter={(label, items) => {
                        const item = filteredMonthlyScores.find(s => s.monthLabel === label);
                        return item ? item.monthFull : label;
                      }}
                    />
                    <Legend formatter={(value) => value === "partner1Score" ? "Partner 1" : "Partner 2"} />
                    <Bar 
                      name="partner1Score" 
                      dataKey="partner1Score" 
                      fill="#8884d8" 
                    />
                    <Bar 
                      name="partner2Score" 
                      dataKey="partner2Score" 
                      fill="#82ca9d" 
                    />
                  </ChartIcon>
                </ResponsiveContainer>
              </div>
              
              <h4 className="text-xl font-semibold mt-8 mb-4">Monthly Details</h4>
              <div className="space-y-2">
                {filteredMonthlyScores.length > 0 ? (
                  filteredMonthlyScores.map((score, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between">
                        <div>
                          <h5 className="font-medium">{score.monthFull}</h5>
                          <p className="text-sm text-muted-foreground">
                            {score.leader === "Tie" ? "Tied scores" : `${score.leader} is ahead by ${score.difference} points`}
                          </p>
                        </div>
                        <div className="flex gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Partner 1</p>
                            <p className="text-lg font-bold">{score.partner1Score}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Partner 2</p>
                            <p className="text-lg font-bold">{score.partner2Score}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-center py-4 text-muted-foreground">No monthly data available</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 