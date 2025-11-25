// Strategic Planning Types for Spedire Sicuro Platform
// Mission, Vision, SWOT Analysis, Business Model Canvas, Media Budget

export type SwotCategory = 'strengths' | 'weaknesses' | 'opportunities' | 'threats';

export type CanvasSegment =
  | 'key_partners'
  | 'key_activities'
  | 'key_resources'
  | 'value_propositions'
  | 'customer_relationships'
  | 'channels'
  | 'customer_segments'
  | 'cost_structure'
  | 'revenue_streams';

export interface CompanyStrategy {
  id: string;
  mission: string | null;
  vision: string | null;
  values: string[]; // Array of company values
  elevator_pitch: string | null;
  tagline: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface SwotAnalysisItem {
  id: string;
  category: SwotCategory;
  title: string;
  description: string | null;
  impact_score: number | null; // 1-5
  probability_score: number | null; // 1-5
  priority: number;
  action_items: ActionItem[];
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
  due_date?: string;
}

export interface BusinessCanvasItem {
  id: string;
  segment: CanvasSegment;
  title: string;
  description: string | null;
  details: Record<string, any>;
  priority: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface MediaBudgetExpense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string; // 'advertising', 'social_media', 'content', 'tools', 'other'
}

export interface MediaBudget {
  id: string;
  year: number;
  month: number;
  planned_budget: number;
  actual_spent: number;
  variance: number; // calculated
  variance_percentage: number; // calculated
  expenses: MediaBudgetExpense[];
  notes: string | null;
  alert_threshold: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface BudgetAlert {
  id: string;
  media_budget_id: string;
  alert_type: string;
  alert_message: string;
  severity: 'info' | 'warning' | 'critical';
  is_read: boolean;
  created_at: string;
  read_at: string | null;
  read_by: string | null;
}

// Summary views
export interface SwotSummary {
  category: SwotCategory;
  total_items: number;
  avg_impact: number;
  avg_probability: number;
  last_updated: string;
}

export interface CanvasCompleteness {
  segment: CanvasSegment;
  items_count: number;
  last_updated: string;
}

export interface MediaBudgetYearlySummary {
  year: number;
  total_planned: number;
  total_spent: number;
  total_variance: number;
  avg_variance_percentage: number;
  months_tracked: number;
}

// DTOs for API requests
export interface CreateCompanyStrategyDto {
  mission?: string;
  vision?: string;
  values?: string[];
  elevator_pitch?: string;
  tagline?: string;
}

export interface UpdateCompanyStrategyDto extends Partial<CreateCompanyStrategyDto> {
  id: string;
}

export interface CreateSwotItemDto {
  category: SwotCategory;
  title: string;
  description?: string;
  impact_score?: number;
  probability_score?: number;
  priority?: number;
  action_items?: ActionItem[];
}

export interface UpdateSwotItemDto extends Partial<CreateSwotItemDto> {
  id: string;
}

export interface CreateCanvasItemDto {
  segment: CanvasSegment;
  title: string;
  description?: string;
  details?: Record<string, any>;
  priority?: number;
}

export interface UpdateCanvasItemDto extends Partial<CreateCanvasItemDto> {
  id: string;
}

export interface CreateMediaBudgetDto {
  year: number;
  month: number;
  planned_budget?: number;
  actual_spent?: number;
  expenses?: MediaBudgetExpense[];
  notes?: string;
  alert_threshold?: number;
}

export interface UpdateMediaBudgetDto extends Partial<CreateMediaBudgetDto> {
  id: string;
}

export interface AddExpenseDto {
  media_budget_id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

// Canvas segment labels for UI
export const CANVAS_SEGMENT_LABELS: Record<CanvasSegment, string> = {
  key_partners: 'Partner Chiave',
  key_activities: 'Attività Chiave',
  key_resources: 'Risorse Chiave',
  value_propositions: 'Proposte di Valore',
  customer_relationships: 'Relazioni con i Clienti',
  channels: 'Canali',
  customer_segments: 'Segmenti di Clientela',
  cost_structure: 'Struttura dei Costi',
  revenue_streams: 'Flussi di Ricavi',
};

// SWOT category labels and colors
export const SWOT_CATEGORY_CONFIG: Record<
  SwotCategory,
  { label: string; color: string; bgColor: string; description: string }
> = {
  strengths: {
    label: 'Punti di Forza',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    description: 'Caratteristiche positive interne che danno un vantaggio competitivo',
  },
  weaknesses: {
    label: 'Punti di Debolezza',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    description: 'Caratteristiche negative interne che limitano le performance',
  },
  opportunities: {
    label: 'Opportunità',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    description: 'Fattori esterni positivi che possono essere sfruttati',
  },
  threats: {
    label: 'Minacce',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    description: 'Fattori esterni negativi che possono creare difficoltà',
  },
};

// Media budget expense categories
export const EXPENSE_CATEGORIES = [
  { value: 'advertising', label: 'Pubblicità' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'content', label: 'Contenuti' },
  { value: 'tools', label: 'Strumenti' },
  { value: 'events', label: 'Eventi' },
  { value: 'other', label: 'Altro' },
] as const;
