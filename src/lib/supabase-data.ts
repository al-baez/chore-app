import { supabase } from "./supabase";
import { Chore, ChoreLog, Partner, DailyScore, WeeklyScore, MonthlyScore } from "@/types";
import { startOfWeek, startOfMonth, format, addDays, parseISO, isSameDay, isSameWeek, isSameMonth } from "date-fns";

// Database types that match Supabase schema
interface DbChore {
  id: string;
  name: string;
  category: string;
  points: number;
  is_negative: boolean;
  created_at?: string;
  updated_at?: string;
}

interface DbChoreLog {
  id: string;
  chore_id: string;
  partner: Partner;
  date: string;
  points: number;
  created_at?: string;
}

// Transform database types to app types
const transformChore = (dbChore: DbChore): Chore => ({
  id: dbChore.id,
  name: dbChore.name,
  category: dbChore.category,
  points: dbChore.points,
  isNegative: dbChore.is_negative,
});

const transformChoreLog = (dbLog: DbChoreLog): ChoreLog => ({
  id: dbLog.id,
  choreId: dbLog.chore_id,
  partner: dbLog.partner,
  date: dbLog.date,
  points: dbLog.points,
});

// Chore management functions
export const getAllChores = async (): Promise<Chore[]> => {
  const { data, error } = await supabase
    .from('chores')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching chores:', error);
    return [];
  }
  
  return data.map(transformChore);
};

export const getChoreById = async (id: string): Promise<Chore | null> => {
  const { data, error } = await supabase
    .from('chores')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching chore:', error);
    return null;
  }
  
  return transformChore(data);
};

export const addChore = async (chore: Omit<Chore, "id">): Promise<Chore | null> => {
  const { data, error } = await supabase
    .from('chores')
    .insert({
      name: chore.name,
      category: chore.category,
      points: chore.points,
      is_negative: chore.isNegative,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding chore:', error);
    return null;
  }
  
  return transformChore(data);
};

export const updateChore = async (id: string, updates: Partial<Chore>): Promise<Chore | null> => {
  const dbUpdates: Partial<DbChore> = {};
  
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.points !== undefined) dbUpdates.points = updates.points;
  if (updates.isNegative !== undefined) dbUpdates.is_negative = updates.isNegative;
  
  const { data, error } = await supabase
    .from('chores')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating chore:', error);
    return null;
  }
  
  return transformChore(data);
};

export const deleteChore = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('chores')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting chore:', error);
    return false;
  }
  
  return true;
};

// Chore log management functions
export const getAllLogs = async (): Promise<ChoreLog[]> => {
  const { data, error } = await supabase
    .from('chore_logs')
    .select('*')
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Error fetching logs:', error);
    return [];
  }
  
  return data.map(transformChoreLog);
};

export const getLogsByDate = async (date: string): Promise<ChoreLog[]> => {
  const { data, error } = await supabase
    .from('chore_logs')
    .select('*')
    .eq('date', date)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching logs by date:', error);
    return [];
  }
  
  return data.map(transformChoreLog);
};

export const getLogsByPartner = async (partner: Partner): Promise<ChoreLog[]> => {
  const { data, error } = await supabase
    .from('chore_logs')
    .select('*')
    .eq('partner', partner)
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Error fetching logs by partner:', error);
    return [];
  }
  
  return data.map(transformChoreLog);
};

export const addChoreLog = async (log: Omit<ChoreLog, "id">): Promise<ChoreLog | null> => {
  // First get the chore to calculate points
  const chore = await getChoreById(log.choreId);
  if (!chore) {
    console.error(`Chore with ID ${log.choreId} not found`);
    return null;
  }
  
  const points = chore.isNegative ? -chore.points : chore.points;
  
  const { data, error } = await supabase
    .from('chore_logs')
    .insert({
      chore_id: log.choreId,
      partner: log.partner,
      date: log.date,
      points: points,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding chore log:', error);
    return null;
  }
  
  return transformChoreLog(data);
};

export const deleteChoreLog = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('chore_logs')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting chore log:', error);
    return false;
  }
  
  return true;
};

// Score calculation functions
export const getDailyScore = async (date: string): Promise<DailyScore> => {
  const logs = await getLogsByDate(date);
  
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

export const getWeeklyScores = async (numberOfWeeks: number = 4): Promise<WeeklyScore[]> => {
  const logs = await getAllLogs();
  const today = new Date();
  const result: WeeklyScore[] = [];
  
  for (let i = 0; i < numberOfWeeks; i++) {
    const startDate = startOfWeek(addDays(today, -7 * i));
    const weekStarting = format(startDate, "yyyy-MM-dd");
    
    const weekLogs = logs.filter(log => 
      isSameWeek(parseISO(log.date), startDate)
    );
    
    const partner1Score = weekLogs
      .filter(log => log.partner === "partner1")
      .reduce((sum, log) => sum + log.points, 0);
    
    const partner2Score = weekLogs
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

export const getMonthlyScores = async (numberOfMonths: number = 6): Promise<MonthlyScore[]> => {
  const logs = await getAllLogs();
  const today = new Date();
  const result: MonthlyScore[] = [];
  
  for (let i = 0; i < numberOfMonths; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const month = format(date, "yyyy-MM");
    
    const monthLogs = logs.filter(log => 
      isSameMonth(parseISO(log.date), date)
    );
    
    const partner1Score = monthLogs
      .filter(log => log.partner === "partner1")
      .reduce((sum, log) => sum + log.points, 0);
    
    const partner2Score = monthLogs
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

export const getTotalScores = async (): Promise<{ partner1: number; partner2: number; difference: number }> => {
  const logs = await getAllLogs();
  
  const partner1Score = logs
    .filter(log => log.partner === "partner1")
    .reduce((sum, log) => sum + log.points, 0);
  
  const partner2Score = logs
    .filter(log => log.partner === "partner2")
    .reduce((sum, log) => sum + log.points, 0);
  
  const difference = partner1Score - partner2Score;
  
  return {
    partner1: partner1Score,
    partner2: partner2Score,
    difference: Math.abs(difference),
  };
};

// Initialize function (no longer needed for Supabase, but keeping for compatibility)
export const initializeData = async (): Promise<void> => {
  // This function is kept for compatibility but does nothing
  // since Supabase handles initialization via SQL schema
  return Promise.resolve();
}; 