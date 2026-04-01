// 共通型定義

export type ReservationStatus = 'confirmed' | 'completed' | 'cancelled' | 'no_show'
export type TicketStatus = 'active' | 'expired' | 'used_up'
export type StaffRole = 'owner' | 'admin' | 'staff'
export type PricingRuleType = 'day_of_week' | 'time_slot' | 'day_and_time'
export type CarteFieldType = 'text' | 'number' | 'select' | 'multi_select' | 'image' | 'date'
export type ReservationSource = 'web' | 'manual' | 'line'
export type TenantPlan = 'free' | 'standard' | 'pro' | 'enterprise'
