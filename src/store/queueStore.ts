import { create } from 'zustand';
import {
  QueueNumber,
  ServiceWindow,
  CustomsBroker,
  ReviewRecord,
  PriorityChange,
  WindowPause,
  PassRecord,
  Alert,
  BusinessType,
  WindowStatus,
  PriorityLevel,
  RiskLevel,
  ReviewResult,
  QueueStatus,
} from '@/types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const initialBrokers: CustomsBroker[] = [
  { id: 'b1', name: '张三', company: '诚信报关行', phone: '13800138001', isBlacklisted: false },
  { id: 'b2', name: '李四', company: '快捷报关有限公司', phone: '13800138002', isBlacklisted: false },
  { id: 'b3', name: '王五', company: '顺通报关', phone: '13800138003', isBlacklisted: true, blacklistReason: '多次提供虚假资料' },
  { id: 'b4', name: '赵六', company: '安达报关行', phone: '13800138004', isBlacklisted: false },
];

const initialWindows: ServiceWindow[] = [
  { id: 'w1', name: '1号窗口', number: 1, skills: ['general', 'special'], status: 'open', processedCount: 15, operator: '李主任' },
  { id: 'w2', name: '2号窗口', number: 2, skills: ['general', 'perishable'], status: 'open', processedCount: 12, operator: '王科员' },
  { id: 'w3', name: '3号窗口', number: 3, skills: ['general', 'dangerous', 'special'], status: 'open', processedCount: 8, operator: '张科员' },
  { id: 'w4', name: '4号窗口', number: 4, skills: ['general'], status: 'paused', processedCount: 10, operator: '刘科员' },
];

const now = new Date();
const initialNumbers: QueueNumber[] = [
  {
    id: 'n1',
    number: 'A001',
    businessType: 'general',
    brokerId: 'b1',
    brokerName: '张三',
    company: '诚信报关行',
    createdAt: new Date(now.getTime() - 30 * 60000),
    enqueueTime: new Date(now.getTime() - 30 * 60000),
    queueSequence: 1,
    status: 'completed',
    windowId: 'w1',
    calledAt: new Date(now.getTime() - 25 * 60000),
    completedAt: new Date(now.getTime() - 20 * 60000),
    priority: 0,
    priorityApproved: true,
    isSpecialCargo: false,
    passCount: 0,
    documentsComplete: true,
    cargoDescription: '电子产品配件',
    cargoWeight: 500,
  },
  {
    id: 'n2',
    number: 'A002',
    businessType: 'special',
    brokerId: 'b2',
    brokerName: '李四',
    company: '快捷报关有限公司',
    createdAt: new Date(now.getTime() - 20 * 60000),
    enqueueTime: new Date(now.getTime() - 20 * 60000),
    queueSequence: 2,
    status: 'processing',
    windowId: 'w1',
    calledAt: new Date(now.getTime() - 10 * 60000),
    priority: 2,
    priorityApproved: true,
    priorityApprovedBy: '主管-陈',
    priorityApprovedAt: new Date(now.getTime() - 18 * 60000),
    priorityExpiry: new Date(now.getTime() + 60 * 60000),
    isSpecialCargo: true,
    riskLevel: 'medium',
    reviewStatus: 'approved',
    passCount: 0,
    documentsComplete: true,
    cargoDescription: '精密医疗设备',
    cargoWeight: 200,
  },
  {
    id: 'n3',
    number: 'B001',
    businessType: 'perishable',
    brokerId: 'b4',
    brokerName: '赵六',
    company: '安达报关行',
    createdAt: new Date(now.getTime() - 15 * 60000),
    enqueueTime: new Date(now.getTime() - 15 * 60000),
    queueSequence: 3,
    status: 'calling',
    windowId: 'w2',
    calledAt: new Date(now.getTime() - 2 * 60000),
    priority: 3,
    priorityApproved: true,
    priorityApprovedBy: '主管-陈',
    priorityApprovedAt: new Date(now.getTime() - 14 * 60000),
    priorityExpiry: new Date(now.getTime() + 30 * 60000),
    isSpecialCargo: false,
    passCount: 0,
    documentsComplete: true,
    cargoDescription: '新鲜海鲜',
    cargoWeight: 1000,
  },
  {
    id: 'n4',
    number: 'A003',
    businessType: 'general',
    brokerId: 'b1',
    brokerName: '张三',
    company: '诚信报关行',
    createdAt: new Date(now.getTime() - 10 * 60000),
    enqueueTime: new Date(now.getTime() - 10 * 60000),
    queueSequence: 4,
    status: 'waiting',
    priority: 0,
    priorityApproved: false,
    isSpecialCargo: false,
    passCount: 0,
    documentsComplete: true,
    cargoDescription: '服装面料',
    cargoWeight: 800,
  },
  {
    id: 'n5',
    number: 'C001',
    businessType: 'dangerous',
    brokerId: 'b2',
    brokerName: '李四',
    company: '快捷报关有限公司',
    createdAt: new Date(now.getTime() - 8 * 60000),
    enqueueTime: new Date(now.getTime() - 8 * 60000),
    queueSequence: 5,
    status: 'reviewing',
    priority: 1,
    priorityApproved: true,
    isSpecialCargo: true,
    riskLevel: 'high',
    reviewStatus: 'pending',
    passCount: 0,
    documentsComplete: true,
    cargoDescription: '化工原料',
    cargoWeight: 3000,
  },
  {
    id: 'n6',
    number: 'A004',
    businessType: 'general',
    brokerId: 'b4',
    brokerName: '赵六',
    company: '安达报关行',
    createdAt: new Date(now.getTime() - 5 * 60000),
    enqueueTime: new Date(now.getTime() - 5 * 60000),
    queueSequence: 6,
    status: 'waiting',
    priority: 0,
    priorityApproved: false,
    isSpecialCargo: false,
    passCount: 1,
    lastPassedAt: new Date(now.getTime() - 4 * 60000),
    documentsComplete: false,
    missingDocuments: ['商业发票', '装箱单'],
    cargoDescription: '日用百货',
    cargoWeight: 200,
  },
  {
    id: 'n7',
    number: 'B002',
    businessType: 'special',
    brokerId: 'b1',
    brokerName: '张三',
    company: '诚信报关行',
    createdAt: new Date(now.getTime() - 3 * 60000),
    enqueueTime: new Date(now.getTime() - 3 * 60000),
    queueSequence: 7,
    status: 'waiting',
    priority: 0,
    priorityApproved: false,
    isSpecialCargo: true,
    riskLevel: 'low',
    passCount: 0,
    documentsComplete: true,
    cargoDescription: '文物展品',
    cargoWeight: 150,
  },
];

const initialReviewRecords: ReviewRecord[] = [
  {
    id: 'r1',
    numberId: 'n2',
    number: 'A002',
    brokerName: '李四',
    businessType: 'special',
    riskLevel: 'medium',
    reviewerId: 's1',
    reviewerName: '主管-陈',
    result: 'approved',
    comment: '资料齐全，风险可控，准予放行',
    createdAt: new Date(now.getTime() - 12 * 60000),
  },
];

const initialPriorityChanges: PriorityChange[] = [
  {
    id: 'pc1',
    numberId: 'n2',
    number: 'A002',
    oldPriority: 0,
    newPriority: 2,
    reason: '医疗设备紧急清关',
    approvedById: 's1',
    approvedByName: '主管-陈',
    approvedAt: new Date(now.getTime() - 18 * 60000),
    expiryDate: new Date(now.getTime() + 60 * 60000),
  },
  {
    id: 'pc2',
    numberId: 'n3',
    number: 'B001',
    oldPriority: 0,
    newPriority: 3,
    reason: '鲜活易腐商品需优先处理',
    approvedById: 's1',
    approvedByName: '主管-陈',
    approvedAt: new Date(now.getTime() - 14 * 60000),
    expiryDate: new Date(now.getTime() + 30 * 60000),
  },
];

const initialPauseRecords: WindowPause[] = [
  {
    id: 'p1',
    windowId: 'w4',
    windowName: '4号窗口',
    reason: '设备维护',
    pausedAt: new Date(now.getTime() - 45 * 60000),
    pausedBy: '系统管理员',
  },
];

const initialPassRecords: PassRecord[] = [];

const initialAlerts: Alert[] = [
  {
    id: 'a1',
    type: 'blacklist',
    level: 'danger',
    message: '黑名单报关员【王五】正在尝试取号',
    relatedId: 'b3',
    createdAt: new Date(now.getTime() - 5 * 60000),
    dismissed: false,
  },
  {
    id: 'a2',
    type: 'incomplete',
    level: 'warning',
    message: '号码【A004】资料不齐，缺少商业发票、装箱单',
    relatedId: 'n6',
    createdAt: new Date(now.getTime() - 4 * 60000),
    dismissed: false,
  },
  {
    id: 'a3',
    type: 'high_risk',
    level: 'danger',
    message: '高风险货物【C001】化工原料待人工复核',
    relatedId: 'n5',
    createdAt: new Date(now.getTime() - 7 * 60000),
    dismissed: false,
  },
];

interface QueueState {
  numbers: QueueNumber[];
  windows: ServiceWindow[];
  brokers: CustomsBroker[];
  reviewRecords: ReviewRecord[];
  priorityChanges: PriorityChange[];
  pauseRecords: WindowPause[];
  passRecords: PassRecord[];
  alerts: Alert[];
  currentUserId: string;
  currentUserName: string;
  currentRole: 'broker' | 'window' | 'supervisor' | 'dispatcher';
  numberCounter: Record<BusinessType, number>;
  nextQueueSequence: number;
  getCurrentQueue: (businessType?: BusinessType) => QueueNumber[];
  getWaitingQueue: (windowId: string) => QueueNumber[];
  getNextNumber: (windowId: string) => QueueNumber | null;
  callNextNumber: (windowId: string) => QueueNumber | null;
  startProcessing: (numberId: string) => void;
  completeNumber: (numberId: string) => void;
  pauseWindow: (windowId: string, reason: string, status?: WindowStatus) => void;
  resumeWindow: (windowId: string) => void;
  passNumber: (numberId: string, windowId: string, reason: string) => void;
  submitReview: (numberId: string, result: ReviewResult, comment: string, reviewerName: string) => void;
  requestPriority: (numberId: string, newPriority: PriorityLevel, reason: string, expiryHours: number) => boolean;
  approvePriority: (priorityChangeId: string, approve: boolean) => void;
  supervisorJumpQueue: (numberId: string, reason: string) => void;
  createQueueNumber: (
    brokerId: string,
    businessType: BusinessType,
    cargoDescription: string,
    cargoWeight: number,
    documents: { complete: boolean; missing?: string[] },
    isSpecialCargo: boolean,
    riskLevel?: RiskLevel
  ) => QueueNumber | null;
  dismissAlert: (alertId: string) => void;
  checkCongestion: () => void;
}

const queueSort = (a: QueueNumber, b: QueueNumber) => {
  if (b.priority !== a.priority) return b.priority - a.priority;
  const aPassed = !!a.lastPassedAt;
  const bPassed = !!b.lastPassedAt;
  if (aPassed !== bPassed) return aPassed ? 1 : -1;
  if (aPassed && bPassed) {
    return (a.lastPassedAt?.getTime() || 0) - (b.lastPassedAt?.getTime() || 0);
  }
  return a.queueSequence - b.queueSequence;
};

export const useQueueStore = create<QueueState>((set, get) => ({
  numbers: initialNumbers,
  windows: initialWindows,
  brokers: initialBrokers,
  reviewRecords: initialReviewRecords,
  priorityChanges: initialPriorityChanges,
  pauseRecords: initialPauseRecords,
  passRecords: initialPassRecords,
  alerts: initialAlerts,
  currentUserId: 's1',
  currentUserName: '主管-陈',
  currentRole: 'supervisor',
  numberCounter: { general: 4, special: 2, dangerous: 1, perishable: 2 },
  nextQueueSequence: 8,

  getCurrentQueue: (businessType) => {
    const { numbers } = get();
    let filtered = numbers.filter(n => ['waiting', 'calling', 'processing', 'reviewing'].includes(n.status));
    if (businessType) {
      filtered = filtered.filter(n => n.businessType === businessType);
    }
    return filtered.sort(queueSort);
  },

  getWaitingQueue: (windowId) => {
    const { windows, numbers } = get();
    const window = windows.find(w => w.id === windowId);
    if (!window) return [];
    return numbers
      .filter(n => n.status === 'waiting' && window.skills.includes(n.businessType))
      .sort(queueSort);
  },

  getNextNumber: (windowId) => {
    const waitingQueue = get().getWaitingQueue(windowId);
    return waitingQueue[0] || null;
  },

  callNextNumber: (windowId) => {
    const { windows, numbers } = get();
    const window = windows.find(w => w.id === windowId);
    if (!window || window.status !== 'open') return null;
    const nextNumber = get().getNextNumber(windowId);
    if (!nextNumber) return null;
    const updatedNumbers = numbers.map(n => {
      if (n.id === nextNumber.id) {
        return { ...n, status: 'calling' as QueueStatus, windowId, calledAt: new Date() };
      }
      return n;
    });
    const updatedWindows = windows.map(w =>
      w.id === windowId ? { ...w, currentNumberId: nextNumber.id } : w
    );
    set({ numbers: updatedNumbers, windows: updatedWindows });
    return { ...nextNumber, status: 'calling', windowId, calledAt: new Date() } as QueueNumber;
  },

  startProcessing: (numberId) => {
    const { numbers } = get();
    const updatedNumbers = numbers.map(n =>
      n.id === numberId ? { ...n, status: 'processing' as QueueStatus } : n
    );
    set({ numbers: updatedNumbers });
  },

  completeNumber: (numberId) => {
    const { numbers, windows } = get();
    const number = numbers.find(n => n.id === numberId);
    if (!number) return;
    const updatedNumbers = numbers.map(n =>
      n.id === numberId ? { ...n, status: 'completed' as QueueStatus, completedAt: new Date() } : n
    );
    const updatedWindows = windows.map(w =>
      w.currentNumberId === numberId
        ? { ...w, currentNumberId: undefined, processedCount: w.processedCount + 1 }
        : w
    );
    set({ numbers: updatedNumbers, windows: updatedWindows });
    get().checkCongestion();
  },

  pauseWindow: (windowId, reason, status = 'paused') => {
    const { windows, pauseRecords, currentUserName } = get();
    const window = windows.find(w => w.id === windowId);
    if (!window) return;
    const updatedWindows = windows.map(w =>
      w.id === windowId ? { ...w, status } : w
    );
    const newPause: WindowPause = {
      id: generateId(),
      windowId,
      windowName: window.name,
      reason,
      pausedAt: new Date(),
      pausedBy: currentUserName,
    };
    set({
      windows: updatedWindows,
      pauseRecords: [...pauseRecords, newPause],
    });
    get().checkCongestion();
  },

  resumeWindow: (windowId) => {
    const { windows, pauseRecords } = get();
    const updatedWindows = windows.map(w =>
      w.id === windowId ? { ...w, status: 'open' as WindowStatus } : w
    );
    const updatedPauses = pauseRecords.map(p =>
      p.windowId === windowId && !p.resumedAt ? { ...p, resumedAt: new Date() } : p
    );
    set({ windows: updatedWindows, pauseRecords: updatedPauses });
    get().checkCongestion();
  },

  passNumber: (numberId, windowId, reason) => {
    const { numbers, windows, passRecords, nextQueueSequence } = get();
    const number = numbers.find(n => n.id === numberId);
    const window = windows.find(w => w.id === windowId);
    if (!number || !window) return;
    const newSeq = nextQueueSequence;
    const updatedNumbers = numbers.map(n =>
      n.id === numberId
        ? {
            ...n,
            status: 'waiting' as QueueStatus,
            passCount: n.passCount + 1,
            lastPassedAt: new Date(),
            windowId: undefined,
            calledAt: undefined,
            enqueueTime: new Date(),
            queueSequence: newSeq,
          }
        : n
    );
    const updatedWindows = windows.map(w =>
      w.id === windowId ? { ...w, currentNumberId: undefined } : w
    );
    const windowSkills = window.skills;
    const sameSkillWaiting = updatedNumbers.filter(
      n => n.status === 'waiting' && n.id !== numberId && windowSkills.includes(n.businessType)
    );
    const newPosition = sameSkillWaiting.length + 1;
    const newPass: PassRecord = {
      id: generateId(),
      numberId,
      number: number.number,
      windowId,
      windowName: window.name,
      passedAt: new Date(),
      reason,
      newPosition,
    };
    set({
      numbers: updatedNumbers,
      windows: updatedWindows,
      passRecords: [...passRecords, newPass],
      nextQueueSequence: newSeq + 1,
    });
  },

  submitReview: (numberId, result, comment, reviewerName) => {
    const { numbers, reviewRecords, nextQueueSequence } = get();
    const number = numbers.find(n => n.id === numberId);
    if (!number || !number.riskLevel) return;
    const newSeq = nextQueueSequence;
    const updatedNumbers = numbers.map(n =>
      n.id === numberId
        ? {
            ...n,
            reviewStatus: result,
            reviewComment: comment,
            reviewedBy: reviewerName,
            reviewedAt: new Date(),
            status: result === 'approved' ? ('waiting' as QueueStatus) : ('cancelled' as QueueStatus),
            ...(result === 'approved' ? { enqueueTime: new Date(), queueSequence: newSeq } : {}),
          }
        : n
    );
    const newReview: ReviewRecord = {
      id: generateId(),
      numberId,
      number: number.number,
      brokerName: number.brokerName,
      businessType: number.businessType,
      riskLevel: number.riskLevel,
      reviewerId: get().currentUserId,
      reviewerName,
      result,
      comment,
      createdAt: new Date(),
    };
    set({
      numbers: updatedNumbers,
      reviewRecords: [...reviewRecords, newReview],
      ...(result === 'approved' ? { nextQueueSequence: newSeq + 1 } : {}),
    });
  },

  requestPriority: (numberId, newPriority, reason, expiryHours) => {
    const { numbers, priorityChanges, currentUserName } = get();
    const number = numbers.find(n => n.id === numberId);
    if (!number || number.priority >= newPriority) return false;
    const newChange: PriorityChange = {
      id: generateId(),
      numberId,
      number: number.number,
      oldPriority: number.priority,
      newPriority,
      reason,
      approvedById: '',
      approvedByName: currentUserName,
      approvedAt: new Date(),
      expiryDate: new Date(Date.now() + expiryHours * 60 * 60 * 1000),
    };
    const updatedNumbers = numbers.map(n =>
      n.id === numberId ? { ...n, priority: newPriority, priorityApproved: false } : n
    );
    set({
      numbers: updatedNumbers,
      priorityChanges: [...priorityChanges, newChange],
    });
    return true;
  },

  approvePriority: (priorityChangeId, approve) => {
    const { priorityChanges, numbers, currentUserName, currentUserId } = get();
    const change = priorityChanges.find(p => p.id === priorityChangeId);
    if (!change) return;
    const updatedChanges = priorityChanges.map(p =>
      p.id === priorityChangeId
        ? { ...p, approvedById: currentUserId, approvedByName: currentUserName, approvedAt: new Date() }
        : p
    );
    if (approve) {
      const updatedNumbers = numbers.map(n =>
        n.id === change.numberId
          ? {
              ...n,
              priority: change.newPriority,
              priorityApproved: true,
              priorityApprovedBy: currentUserName,
              priorityApprovedAt: new Date(),
              priorityExpiry: change.expiryDate,
            }
          : n
      );
      set({ numbers: updatedNumbers, priorityChanges: updatedChanges });
    } else {
      const updatedNumbers = numbers.map(n =>
        n.id === change.numberId
          ? { ...n, priority: change.oldPriority, priorityApproved: false }
          : n
      );
      set({ numbers: updatedNumbers, priorityChanges: updatedChanges });
    }
  },

  supervisorJumpQueue: (numberId, reason) => {
    const { numbers, priorityChanges, currentUserName, currentUserId, nextQueueSequence } = get();
    const number = numbers.find(n => n.id === numberId);
    if (!number) return;
    const newSeq = nextQueueSequence;
    const updatedNumbers = numbers.map(n =>
      n.id === numberId
        ? {
            ...n,
            priority: 5 as PriorityLevel,
            priorityApproved: true,
            priorityApprovedBy: currentUserName,
            priorityApprovedAt: new Date(),
            priorityExpiry: new Date(Date.now() + 2 * 60 * 60 * 1000),
            queueSequence: newSeq,
          }
      : n
    );
    const newChange: PriorityChange = {
      id: generateId(),
      numberId,
      number: number.number,
      oldPriority: number.priority,
      newPriority: 5,
      reason,
      approvedById: currentUserId,
      approvedByName: currentUserName,
      approvedAt: new Date(),
      expiryDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
    };
    set({
      numbers: updatedNumbers,
      priorityChanges: [...priorityChanges, newChange],
      nextQueueSequence: newSeq + 1,
    });
  },

  createQueueNumber: (brokerId, businessType, cargoDescription, cargoWeight, documents, isSpecialCargo, riskLevel) => {
    const { brokers, numbers, numberCounter, alerts, nextQueueSequence } = get();
    const broker = brokers.find(b => b.id === brokerId);
    if (!broker) return null;
    if (broker.isBlacklisted) {
      const newAlert: Alert = {
        id: generateId(),
        type: 'blacklist',
        level: 'danger',
        message: `黑名单报关员【${broker.name}】正在尝试取号`,
        relatedId: brokerId,
        createdAt: new Date(),
        dismissed: false,
      };
      set({ alerts: [...alerts, newAlert] });
      return null;
    }
    const prefix = businessType === 'general' ? 'A' : businessType === 'special' ? 'B' : businessType === 'dangerous' ? 'C' : 'D';
    const count = numberCounter[businessType] + 1;
    const newSeq = nextQueueSequence;
    const newNumber: QueueNumber = {
      id: generateId(),
      number: `${prefix}${String(count).padStart(3, '0')}`,
      businessType,
      brokerId,
      brokerName: broker.name,
      company: broker.company,
      createdAt: new Date(),
      enqueueTime: new Date(),
      queueSequence: newSeq,
      status: isSpecialCargo && riskLevel && ['medium', 'high'].includes(riskLevel) ? 'reviewing' : 'waiting',
      priority: 0,
      priorityApproved: false,
      isSpecialCargo,
      riskLevel: isSpecialCargo ? riskLevel : undefined,
      reviewStatus: isSpecialCargo && riskLevel && ['medium', 'high'].includes(riskLevel) ? 'pending' : undefined,
      passCount: 0,
      documentsComplete: documents.complete,
      missingDocuments: documents.missing,
      cargoDescription,
      cargoWeight,
    };
    if (!documents.complete && documents.missing && documents.missing.length > 0) {
      const newAlert: Alert = {
        id: generateId(),
        type: 'incomplete',
        level: 'warning',
        message: `号码【${newNumber.number}】资料不齐，缺少${documents.missing.join('、')}`,
        relatedId: newNumber.id,
        createdAt: new Date(),
        dismissed: false,
      };
      set({ alerts: [...alerts, newAlert] });
    }
    if (isSpecialCargo && riskLevel === 'high') {
      const newAlert: Alert = {
        id: generateId(),
        type: 'high_risk',
        level: 'danger',
        message: `高风险货物【${newNumber.number}】${cargoDescription}待人工复核`,
        relatedId: newNumber.id,
        createdAt: new Date(),
        dismissed: false,
      };
      set({ alerts: [...get().alerts, newAlert] });
    }
    set({
      numbers: [...numbers, newNumber],
      numberCounter: { ...numberCounter, [businessType]: count },
      nextQueueSequence: newSeq + 1,
    });
    get().checkCongestion();
    return newNumber;
  },

  dismissAlert: (alertId) => {
    const { alerts } = get();
    set({
      alerts: alerts.map(a => (a.id === alertId ? { ...a, dismissed: true } : a)),
    });
  },

  checkCongestion: () => {
    const { numbers, windows, alerts } = get();
    const waitingCount = numbers.filter(n => n.status === 'waiting').length;
    const openWindows = windows.filter(w => w.status === 'open').length;
    const congestionThreshold = openWindows * 5;
    const existingCongestionAlert = alerts.find(a => a.type === 'congestion' && !a.dismissed);
    if (waitingCount > congestionThreshold && !existingCongestionAlert) {
      const newAlert: Alert = {
        id: generateId(),
        type: 'congestion',
        level: 'warning',
        message: `当前排队人数过多（${waitingCount}人等待），请增加开放窗口`,
        createdAt: new Date(),
        dismissed: false,
      };
      set({ alerts: [...alerts, newAlert] });
    }
    const existingWindowAlert = alerts.find(a => a.type === 'window_down' && !a.dismissed);
    const pausedWindows = windows.filter(w => w.status === 'paused' || w.status === 'lunch');
    if (pausedWindows.length > 0 && !existingWindowAlert) {
      const newAlert: Alert = {
        id: generateId(),
        type: 'window_down',
        level: 'info',
        message: `当前有${pausedWindows.length}个窗口暂停服务`,
        createdAt: new Date(),
        dismissed: false,
      };
      set({ alerts: [...get().alerts, newAlert] });
    }
  },
}));
