// Mock data for Langrushi platform
export type Level = 'A1' | 'A2' | 'B1' | 'B2';
export type Category = 'Listening' | 'Writing' | 'Reading' | 'Grammar' | 'Games';
export type ExerciseType = 'Interactive' | 'Passive';
export type AccessFlag = 'FREE_ALL' | 'FREE_REGISTERED' | 'PAID';
export type QuestionType = 'MCQ' | 'FILL_BLANK' | 'TRUE_FALSE';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string;
  hint?: string;
  explanation?: string;
}

export interface Exercise {
  id: string;
  title: string;
  level: Level;
  category: Category;
  subPart: string;
  type: ExerciseType;
  access: AccessFlag;
  // Interactive
  mediaUrl?: string;
  transcript?: string;
  questions?: Question[];
  answerDisplayMode?: 'instant' | 'end' | 'none' | '';
  allowSkip?: boolean;
  // Passive
  prompt?: string;
  guidance?: string[];
  modelAnswer?: string;
  updatedAt?: string;
}


export interface ClassCode {
  id: string;
  code: string;
  level: Level;
  maxUses: number;
  used: number;
  expiry?: string;
  active: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percent' | 'fixed';
  value: number;
  maxUses?: number;
  used: number;
  expiry?: string;
  active: boolean;
}

export const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2'];
export const CATEGORIES: Category[] = ['Listening', 'Writing', 'Reading', 'Grammar', 'Games'];
