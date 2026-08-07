export type ActionType = 
  | 'create_expense' 
  | 'create_reminder' 
  | 'create_event' 
  | 'create_task' 
  | 'query_schedule'
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
