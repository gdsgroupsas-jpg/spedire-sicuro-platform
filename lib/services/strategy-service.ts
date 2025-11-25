// Strategy Service - Database operations for strategic planning
import { createClient } from '@/lib/supabase/server';
import type {
  CompanyStrategy,
  SwotAnalysisItem,
  BusinessCanvasItem,
  MediaBudget,
  BudgetAlert,
  CreateCompanyStrategyDto,
  UpdateCompanyStrategyDto,
  CreateSwotItemDto,
  UpdateSwotItemDto,
  CreateCanvasItemDto,
  UpdateCanvasItemDto,
  CreateMediaBudgetDto,
  UpdateMediaBudgetDto,
  SwotCategory,
  CanvasSegment,
} from '@/lib/types/strategy';

// ============================================
// COMPANY STRATEGY (Mission/Vision)
// ============================================

export async function getCompanyStrategy(): Promise<CompanyStrategy | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('company_strategy')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching company strategy:', error);
    throw new Error('Failed to fetch company strategy');
  }

  return data || null;
}

export async function createCompanyStrategy(
  dto: CreateCompanyStrategyDto,
  userId: string
): Promise<CompanyStrategy> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('company_strategy')
    .insert({
      ...dto,
      created_by: userId,
      updated_by: userId,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating company strategy:', error);
    throw new Error('Failed to create company strategy');
  }

  return data;
}

export async function updateCompanyStrategy(
  id: string,
  dto: Partial<CreateCompanyStrategyDto>,
  userId: string
): Promise<CompanyStrategy> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('company_strategy')
    .update({
      ...dto,
      updated_by: userId,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating company strategy:', error);
    throw new Error('Failed to update company strategy');
  }

  return data;
}

// ============================================
// SWOT ANALYSIS
// ============================================

export async function getSwotItems(category?: SwotCategory): Promise<SwotAnalysisItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from('swot_analysis')
    .select('*')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching SWOT items:', error);
    throw new Error('Failed to fetch SWOT items');
  }

  return data || [];
}

export async function getSwotItemById(id: string): Promise<SwotAnalysisItem | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('swot_analysis')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching SWOT item:', error);
    throw new Error('Failed to fetch SWOT item');
  }

  return data || null;
}

export async function createSwotItem(
  dto: CreateSwotItemDto,
  userId: string
): Promise<SwotAnalysisItem> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('swot_analysis')
    .insert({
      ...dto,
      created_by: userId,
      updated_by: userId,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating SWOT item:', error);
    throw new Error('Failed to create SWOT item');
  }

  return data;
}

export async function updateSwotItem(
  id: string,
  dto: Partial<CreateSwotItemDto>,
  userId: string
): Promise<SwotAnalysisItem> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('swot_analysis')
    .update({
      ...dto,
      updated_by: userId,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating SWOT item:', error);
    throw new Error('Failed to update SWOT item');
  }

  return data;
}

export async function deleteSwotItem(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('swot_analysis')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting SWOT item:', error);
    throw new Error('Failed to delete SWOT item');
  }
}

// ============================================
// BUSINESS CANVAS
// ============================================

export async function getCanvasItems(segment?: CanvasSegment): Promise<BusinessCanvasItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from('business_canvas')
    .select('*')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false });

  if (segment) {
    query = query.eq('segment', segment);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching canvas items:', error);
    throw new Error('Failed to fetch canvas items');
  }

  return data || [];
}

export async function getCanvasItemById(id: string): Promise<BusinessCanvasItem | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('business_canvas')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching canvas item:', error);
    throw new Error('Failed to fetch canvas item');
  }

  return data || null;
}

export async function createCanvasItem(
  dto: CreateCanvasItemDto,
  userId: string
): Promise<BusinessCanvasItem> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('business_canvas')
    .insert({
      ...dto,
      created_by: userId,
      updated_by: userId,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating canvas item:', error);
    throw new Error('Failed to create canvas item');
  }

  return data;
}

export async function updateCanvasItem(
  id: string,
  dto: Partial<CreateCanvasItemDto>,
  userId: string
): Promise<BusinessCanvasItem> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('business_canvas')
    .update({
      ...dto,
      updated_by: userId,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating canvas item:', error);
    throw new Error('Failed to update canvas item');
  }

  return data;
}

export async function deleteCanvasItem(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('business_canvas')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting canvas item:', error);
    throw new Error('Failed to delete canvas item');
  }
}

// ============================================
// MEDIA BUDGET
// ============================================

export async function getMediaBudgets(year?: number, month?: number): Promise<MediaBudget[]> {
  const supabase = await createClient();

  let query = supabase
    .from('media_budget')
    .select('*')
    .order('year', { ascending: false })
    .order('month', { ascending: false });

  if (year) {
    query = query.eq('year', year);
  }

  if (month) {
    query = query.eq('month', month);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching media budgets:', error);
    throw new Error('Failed to fetch media budgets');
  }

  return data || [];
}

export async function getMediaBudgetById(id: string): Promise<MediaBudget | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('media_budget')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching media budget:', error);
    throw new Error('Failed to fetch media budget');
  }

  return data || null;
}

export async function getCurrentMonthBudget(): Promise<MediaBudget | null> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('media_budget')
    .select('*')
    .eq('year', year)
    .eq('month', month)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching current month budget:', error);
    throw new Error('Failed to fetch current month budget');
  }

  return data || null;
}

export async function createMediaBudget(
  dto: CreateMediaBudgetDto,
  userId: string
): Promise<MediaBudget> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('media_budget')
    .insert({
      ...dto,
      created_by: userId,
      updated_by: userId,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating media budget:', error);
    throw new Error('Failed to create media budget');
  }

  return data;
}

export async function updateMediaBudget(
  id: string,
  dto: Partial<CreateMediaBudgetDto>,
  userId: string
): Promise<MediaBudget> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('media_budget')
    .update({
      ...dto,
      updated_by: userId,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating media budget:', error);
    throw new Error('Failed to update media budget');
  }

  return data;
}

export async function deleteMediaBudget(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('media_budget')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting media budget:', error);
    throw new Error('Failed to delete media budget');
  }
}

// ============================================
// BUDGET ALERTS
// ============================================

export async function getUnreadAlerts(): Promise<BudgetAlert[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('budget_alerts')
    .select('*')
    .eq('is_read', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching unread alerts:', error);
    throw new Error('Failed to fetch unread alerts');
  }

  return data || [];
}

export async function markAlertAsRead(id: string, userId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('budget_alerts')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
      read_by: userId,
    })
    .eq('id', id);

  if (error) {
    console.error('Error marking alert as read:', error);
    throw new Error('Failed to mark alert as read');
  }
}

export async function markAllAlertsAsRead(userId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('budget_alerts')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
      read_by: userId,
    })
    .eq('is_read', false);

  if (error) {
    console.error('Error marking all alerts as read:', error);
    throw new Error('Failed to mark all alerts as read');
  }
}
