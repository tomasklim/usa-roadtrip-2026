import { validField } from '../../shared/trip-schema.mjs';
export interface Stay { place: string; note: string; type: 'undecided' | 'bed' | 'car' }
export type Stays = Record<string, Stay>;
export const EMPTY_STAY: Stay = { place: '', note: '', type: 'undecided' };
export interface Expense { amount: number | null; currency: 'EUR' | 'USD' | 'CZK'; status: 'estimate' | 'paid'; note: string }
export type Expenses = Record<string, Expense>;
export const EMPTY_EXPENSE: Expense = { amount: null, currency: 'USD', status: 'estimate', note: '' };
export const normalizeStays = (v: unknown): Stays => Object.fromEntries(Object.entries(v && typeof v === 'object' ? v : {}).filter(([id, x]) => x !== null && validField(`stay:${id}`, x)));
export const normalizeExpenses = (v: unknown): Expenses => Object.fromEntries(Object.entries(v && typeof v === 'object' ? v : {}).filter(([id, x]) => x !== null && validField(`expense:${id}`, x)));
