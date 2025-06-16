"use client"

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, addDays, subDays, parseISO } from "date-fns";
import { Chore, Partner, WeeklyScore, MonthlyScore } from "@/types";

// Automatically detect which data service to use
const useSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Dynamic imports based on environment
const dataService = useSupabase 
  ? import("@/lib/supabase-data")
  : import("@/lib/data");

import ChoreChecklist from "../components/chore-checklist";
import ScoreCard from "../components/score-card";
import ScoreCharts from "../components/score-charts";
import ChoreManager from "../components/chore-manager";
import { Button } from "@/components/ui/button";
import { Calendar, BarChart, Settings } from "lucide-react";

export default function Dashboard() {
  const [chores, setChores] = useState<Chore[]>([]);
  const [today] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedDate, setSelectedDate] = useState(today);
  const [activeTab, setActiveTab] = useState("daily");
  const [scores, setScores] = useState({ partner1: 0, partner2: 0, difference: 0 });
  const [weeklyScores, setWeeklyScores] = useState<WeeklyScore[]>([]);
  const [monthlyScores, setMonthlyScores] = useState<MonthlyScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const service = await dataService;
        await service.initializeData();
        await updateScores();
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeApp();
  }, []);
  
  const updateScores = async () => {
    try {
      const service = await dataService;
      const [choresList, totalScores, weeklyData, monthlyData] = await Promise.all([
        service.getAllChores(),
        service.getTotalScores(),
        service.getWeeklyScores(),
        service.getMonthlyScores()
      ]);
      
      setChores(choresList);
      setScores(totalScores);
      setWeeklyScores(weeklyData);
      setMonthlyScores(monthlyData);
    } catch (error) {
      console.error('Error updating scores:', error);
    }
  };
  
  const handleChoreCompleted = async (choreId: string, partner: Partner) => {
    try {
      const service = await dataService;
      await service.addChoreLog({
        choreId,
        partner,
        date: selectedDate,
        points: 0, // Points will be calculated in the data service
      });
      await updateScores();
    } catch (error) {
      console.error('Error completing chore:', error);
    }
  };
  
  const changeDate = (direction: "prev" | "next" | "today") => {
    if (direction === "prev") {
      setSelectedDate(format(subDays(parseISO(selectedDate), 1), "yyyy-MM-dd"));
    } else if (direction === "next") {
      setSelectedDate(format(addDays(parseISO(selectedDate), 1), "yyyy-MM-dd"));
    } else {
      setSelectedDate(today);
    }
  };
  
  // Format the selected date for display
  const displayDate = format(parseISO(selectedDate), "EEEE, MMMM d, yyyy");
  const isToday = selectedDate === today;
  
  if (isLoading) {
    return (
      <main className="container mx-auto p-4 md:p-8 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your chore data...</p>
            {useSupabase && <p className="text-sm text-muted-foreground mt-2">Connected to Supabase 🚀</p>}
          </div>
        </div>
      </main>
    );
  }
  
  return (
    <main className="container mx-auto p-4 md:p-8 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Household Chore Scoring System</h1>
        <p className="text-muted-foreground">
          Track and compare household chores between partners
          {useSupabase && <span className="ml-2 text-green-600">• Live Database Connected</span>}
        </p>
      </header>
      
      <div className="grid gap-6 md:grid-cols-6 mb-8">
        <ScoreCard title="Partner 1 Score" score={scores.partner1} className="md:col-span-2" />
        <ScoreCard title="Partner 2 Score" score={scores.partner2} className="md:col-span-2" />
        <ScoreCard 
          title="Score Difference" 
          score={scores.difference} 
          description={scores.partner1 > scores.partner2 ? "Partner 1 is ahead" : "Partner 2 is ahead"}
          className="md:col-span-2" 
        />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="border-b">
          <div className="container mx-auto">
            <TabsList className="grid w-full grid-cols-3 h-16 bg-transparent">
              <TabsTrigger value="daily" className="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-16 text-base flex gap-2">
                <Calendar className="h-5 w-5" />
                Daily Chores
              </TabsTrigger>
              <TabsTrigger value="statistics" className="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-16 text-base flex gap-2">
                <BarChart className="h-5 w-5" />
                Weekly & Monthly Stats
              </TabsTrigger>
              <TabsTrigger value="manage" className="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-16 text-base flex gap-2">
                <Settings className="h-5 w-5" />
                Manage Chores
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
        
        <TabsContent value="daily" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">{displayDate}</h3>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => changeDate("prev")}
              >
                Previous Day
              </Button>
              {!isToday && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => changeDate("today")}
                >
                  Today
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => changeDate("next")}
                disabled={isToday}
              >
                Next Day
              </Button>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <ChoreChecklist 
              title="Partner 1" 
              partner="partner1" 
              chores={chores} 
              onChoreCompleted={handleChoreCompleted} 
              date={selectedDate}
            />
            <ChoreChecklist 
              title="Partner 2" 
              partner="partner2" 
              chores={chores} 
              onChoreCompleted={handleChoreCompleted}
              date={selectedDate}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="statistics" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Weekly & Monthly Statistics</h2>
            <p className="text-muted-foreground">View performance trends over time</p>
          </div>
          <ScoreCharts 
            weeklyScores={weeklyScores} 
            monthlyScores={monthlyScores}
          />
        </TabsContent>
        
        <TabsContent value="manage" className="space-y-4">
          <ChoreManager onChoresUpdated={() => {
            updateScores();
          }} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
