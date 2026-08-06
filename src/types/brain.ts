export type ParsedActionType = 'EXPENSE' | 'TASK' | 'REMINDER';

export interface ParsedAction {
  type: ParsedActionType;
  title: string;
  amount?: number;
  date?: string;
  category?: string;
  rawText: string;
}

export interface RawEvent {
  id?: string;
  raw_text: string;
  parsed_data: any;
  status: 'processed' | 'failed' | 'pending';
  created_at?: string;
}
