import { Chore, ChoreLog, Partner, DailyScore, WeeklyScore, MonthlyScore } from "@/types";
import { startOfWeek, format, addDays, parseISO, isSameDay, isSameWeek, isSameMonth } from "date-fns";

// Initial chores data
const initialChores: Chore[] = [
  { id: "1", name: "Washing dishes", category: "Kitchen", points: 5, isNegative: false },
  { id: "2", name: "Cooking dinner", category: "Kitchen", points: 8, isNegative: false },
  { id: "3", name: "Taking out trash", category: "Cleaning", points: 3, isNegative: false },
  { id: "4", name: "Vacuuming", category: "Cleaning", points: 5, isNegative: false },
  { id: "5", name: "Laundry", category: "Cleaning", points: 6, isNegative: false },
  { id: "6", name: "Grocery shopping", category: "Errands", points: 7, isNegative: false },
  { id: "7", name: "Left dishes in sink", category: "Kitchen", points: 3, isNegative: true },
  { id: "8", name: "Forgot to take out trash", category: "Cleaning", points: 2, isNegative: true },
  { id: "9", name: "Left clothes on floor", category: "Cleaning", points: 2, isNegative: true },
];

// Mock data for demonstration
let chores: Chore[] = [...initialChores];
let choreLogs: ChoreLog[] = [];

// Local storage keys
const CHORES_STORAGE_KEY = "household-chores";
const LOGS_STORAGE_KEY = "household-chore-logs";

// Initialize data from localStorage if available
export const initializeData = () => {
  if (typeof window !== "undefined") {
    const storedChores = localStorage.getItem(CHORES_STORAGE_KEY);
    const storedLogs = localStorage.getItem(LOGS_STORAGE_KEY);
    
    if (storedChores) {
      chores = JSON.parse(storedChores);
    } else {
      localStorage.setItem(CHORES_STORAGE_KEY, JSON.stringify(initialChores));
    }
    
    if (storedLogs) {
      choreLogs = JSON.parse(storedLogs);
    }
  }
};

// Save data to localStorage
const saveChores = () => {
  if (typeof window !== "undefined") {
    localStorage.setItem(CHORES_STORAGE_KEY, JSON.stringify(chores));
  }
};

const saveLogs = () => {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(choreLogs));
  }
};

// Chore management functions
export const getAllChores = (): Chore[] => {
  return chores;
};

export const getChoreById = (id: string): Chore | undefined => {
  return chores.find(chore => chore.id === id);
};

export const addChore = (chore: Omit<Chore, "id">): Chore => {
  const newChore = {
    ...chore,
    id: Date.now().toString(),
  };
  
  chores = [...chores, newChore];
  saveChores();
  return newChore;
};

export const updateChore = (id: string, updates: Partial<Chore>): Chore | null => {
  const index = chores.findIndex(chore => chore.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const updatedChore = { ...chores[index], ...updates };
  chores = [...chores.slice(0, index), updatedChore, ...chores.slice(index + 1)];
  saveChores();
  return updatedChore;
};

export const deleteChore = (id: string): boolean => {
  const initialLength = chores.length;
  chores = chores.filter(chore => chore.id !== id);
  
  if (chores.length !== initialLength) {
    saveChores();
    return true;
  }
  
  return false;
};

// Chore log management functions
export const getAllLogs = (): ChoreLog[] => {
  return choreLogs;
};

export const getLogsByDate = (date: string): ChoreLog[] => {
  return choreLogs.filter(log => {
    return isSameDay(parseISO(log.date), parseISO(date));
  });
};

export const getLogsByPartner = (partner: Partner): ChoreLog[] => {
  return choreLogs.filter(log => log.partner === partner);
};

export const addChoreLog = (log: Omit<ChoreLog, "id">): ChoreLog => {
  const chore = getChoreById(log.choreId);
  if (!chore) {
    throw new Error(`Chore with ID ${log.choreId} not found`);
  }
  
  const newLog = {
    ...log,
    id: Date.now().toString(),
    points: chore.isNegative ? -chore.points : chore.points,
  };
  
  choreLogs = [...choreLogs, newLog];
  saveLogs();
  return newLog;
};

export const deleteChoreLog = (id: string): boolean => {
  const initialLength = choreLogs.length;
  choreLogs = choreLogs.filter(log => log.id !== id);
  
  if (choreLogs.length !== initialLength) {
    saveLogs();
    return true;
  }
  
  return false;
};

// Score calculation functions
export const getDailyScore = (date: string): DailyScore => {
  const logs = getLogsByDate(date);
  
  const partner1Score = logs
    .filter(log => log.partner === "partner1")
    .reduce((sum, log) => sum + log.points, 0);
  
  const partner2Score = logs
    .filter(log => log.partner === "partner2")
    .reduce((sum, log) => sum + log.points, 0);
  
  return {
    date,
    partner1Score,
    partner2Score,
  };
};

export const getWeeklyScores = (numberOfWeeks: number = 4): WeeklyScore[] => {
  const today = new Date();
  const result: WeeklyScore[] = [];
  
  for (let i = 0; i < numberOfWeeks; i++) {
    const startDate = startOfWeek(addDays(today, -7 * i));
    const weekStarting = format(startDate, "yyyy-MM-dd");
    
    const logs = choreLogs.filter(log => 
      isSameWeek(parseISO(log.date), startDate)
    );
    
    const partner1Score = logs
      .filter(log => log.partner === "partner1")
      .reduce((sum, log) => sum + log.points, 0);
    
    const partner2Score = logs
      .filter(log => log.partner === "partner2")
      .reduce((sum, log) => sum + log.points, 0);
    
    result.unshift({
      weekStarting,
      partner1Score,
      partner2Score,
    });
  }
  
  return result;
};

export const getMonthlyScores = (numberOfMonths: number = 6): MonthlyScore[] => {
  const today = new Date();
  const result: MonthlyScore[] = [];
  
  for (let i = 0; i < numberOfMonths; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const month = format(date, "yyyy-MM");
    
    const logs = choreLogs.filter(log => 
      isSameMonth(parseISO(log.date), date)
    );
    
    const partner1Score = logs
      .filter(log => log.partner === "partner1")
      .reduce((sum, log) => sum + log.points, 0);
    
    const partner2Score = logs
      .filter(log => log.partner === "partner2")
      .reduce((sum, log) => sum + log.points, 0);
    
    result.unshift({
      month,
      partner1Score,
      partner2Score,
    });
  }
  
  return result;
};

export const getTotalScores = (): { partner1: number; partner2: number; difference: number } => {
  const partner1Score = choreLogs
    .filter(log => log.partner === "partner1")
    .reduce((sum, log) => sum + log.points, 0);
  
  const partner2Score = choreLogs
    .filter(log => log.partner === "partner2")
    .reduce((sum, log) => sum + log.points, 0);
  
  const difference = partner1Score - partner2Score;
  
  return {
    partner1: partner1Score,
    partner2: partner2Score,
    difference: Math.abs(difference),
  };
}; 