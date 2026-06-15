export type BusinessType = 'general' | 'special' | 'dangerous' | 'perishable';

export type RiskLevel = 'low' | 'medium' | 'high';

export type QueueStatus = 'waiting' | 'calling' | 'processing' | 'completed' | 'passed' | 'reviewing' | 'cancelled';

export type WindowStatus = 'open' | 'paused' | 'lunch' | 'closed';

export type PriorityLevel = 0 | 1 | 2 | 3 | 4 | 5;

export type ReviewResult = 'approved' | 'rejected' | 'pending';

export interface CustomsBroker {
  id: string;
  name: string;
  company: string;
  phone: string;
  isBlacklisted: boolean;
  blacklistReason?: string;
}

export interface BusinessSkill {
  type: BusinessType;
  name: string;
}

export interface ServiceWindow {
  id: string;
  name: string;
  number: number;
  skills: BusinessType[];
  status: WindowStatus;
  currentNumberId?: string;
  processedCount: number;
  operator?: string;
}

export interface QueueNumber {
  id: string;
  number: string;
  businessType: BusinessType;
  brokerId: string;
  brokerName: string;
  company: string;
  createdAt: Date;
  enqueueTime: Date;
  queueSequence: number;
  calledAt?: Date;
  completedAt?: Date;
  status: QueueStatus;
  windowId?: string;
  priority: PriorityLevel;
  priorityExpiry?: Date;
  priorityApproved: boolean;
  priorityApprovedBy?: string;
  priorityApprovedAt?: Date;
  isSpecialCargo: boolean;
  riskLevel?: RiskLevel;
  reviewStatus?: ReviewResult;
  reviewComment?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  passCount: number;
  lastPassedAt?: Date;
  documentsComplete: boolean;
  missingDocuments?: string[];
  cargoDescription: string;
  cargoWeight: number;
}

export interface ReviewRecord {
  id: string;
  numberId: string;
  number: string;
  brokerName: string;
  businessType: BusinessType;
  riskLevel: RiskLevel;
  reviewerId: string;
  reviewerName: string;
  result: ReviewResult;
  comment: string;
  createdAt: Date;
}

export interface PriorityChange {
  id: string;
  numberId: string;
  number: string;
  oldPriority: PriorityLevel;
  newPriority: PriorityLevel;
  reason: string;
  approvedById: string;
  approvedByName: string;
  approvedAt: Date;
  expiryDate: Date;
}

export interface WindowPause {
  id: string;
  windowId: string;
  windowName: string;
  reason: string;
  pausedAt: Date;
  resumedAt?: Date;
  pausedBy: string;
}

export interface PassRecord {
  id: string;
  numberId: string;
  number: string;
  windowId: string;
  windowName: string;
  passedAt: Date;
  reason: string;
  newPosition: number;
}

export interface Alert {
  id: string;
  type: 'congestion' | 'blacklist' | 'incomplete' | 'high_risk' | 'window_down';
  level: 'info' | 'warning' | 'danger';
  message: string;
  relatedId?: string;
  createdAt: Date;
  dismissed: boolean;
}

export const BUSINESS_SKILLS: BusinessSkill[] = [
  { type: 'general', name: '普通货物' },
  { type: 'special', name: '特殊货物' },
  { type: 'dangerous', name: '危险品' },
  { type: 'perishable', name: '鲜活易腐' },
];

export const WINDOW_STATUSES: { value: WindowStatus; label: string; color: string }[] = [
  { value: 'open', label: '开放', color: 'bg-green-500' },
  { value: 'paused', label: '暂停', color: 'bg-yellow-500' },
  { value: 'lunch', label: '午休', color: 'bg-orange-500' },
  { value: 'closed', label: '关闭', color: 'bg-gray-500' },
];

export const QUEUE_STATUS_LABELS: Record<QueueStatus, string> = {
  waiting: '等待叫号',
  calling: '正在叫号',
  processing: '正在办理',
  completed: '已完成',
  passed: '已过号',
  reviewing: '复核中',
  cancelled: '已取消',
};

export const RISK_LEVEL_LABELS: Record<RiskLevel, { label: string; color: string }> = {
  low: { label: '低风险', color: 'text-green-600 bg-green-100' },
  medium: { label: '中风险', color: 'text-yellow-600 bg-yellow-100' },
  high: { label: '高风险', color: 'text-red-600 bg-red-100' },
};

export const PRIORITY_LABELS: Record<PriorityLevel, { label: string; color: string }> = {
  0: { label: '普通', color: 'bg-gray-100 text-gray-700' },
  1: { label: '优先', color: 'bg-blue-100 text-blue-700' },
  2: { label: '紧急', color: 'bg-yellow-100 text-yellow-700' },
  3: { label: '特急', color: 'bg-orange-100 text-orange-700' },
  4: { label: '绿色通道', color: 'bg-purple-100 text-purple-700' },
  5: { label: '主管插队', color: 'bg-red-100 text-red-700' },
};
