export type ActionType = 
  | 'create_expense' 
  | 'create_reminder' 
  | 'create_event' 
  | 'create_task' 
  | 'query_schedule'
  | 'LOG_ENERGY'
  | 'TRACK_HARDWARE'
  | 'EVENT'
  | 'TASK'
  | 'unknown';

export interface ActionPayload {
  type: ActionType;
  payload: any;
  needs_input?: boolean;
  missing_fields?: string[];
  reply?: string;
}

export interface ActionResult {
  success: boolean;
  data?: any;
  userMessage: string;
  needs_input?: boolean;
}
