export type Partner = "partner1" | "partner2";

export interface Chore {
  id: string;
  name: string;
  category: string;
  points: number;
  isNegative: boolean;
}

export interface ChoreLog {
  id: string;
  choreId: string;
  partner: Partner;
  date: string;
  points: number;
}

export interface DailyScore {
  date: string;
  partner1Score: number;
  partner2Score: number;
}

export interface WeeklyScore {
  weekStarting: string;
  partner1Score: number;
  partner2Score: number;
}

export interface MonthlyScore {
  month: string;
  partner1Score: number;
  partner2Score: number;
} 