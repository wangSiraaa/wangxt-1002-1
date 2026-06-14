import { useState } from 'react';
import { useQueueStore } from '@/store/queueStore';
import {
  PRIORITY_LABELS,
  RISK_LEVEL_LABELS,
  QUEUE_STATUS_LABELS,
  BUSINESS_SKILLS,
} from '@/types';
import type { PriorityLevel, ReviewResult } from '@/types';
import {
  Shield,
  Gauge,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  FileText,
  Clock,
  ArrowUpCircle,
  History,
  Users,
} from 'lucide-react';

type TabType = 'review' | 'priority' | 'jump' | 'history';

export default function SupervisorPage() {
  const {
    numbers,
    reviewRecords,
    priorityChanges,
    currentUserName,
    getCurrentQueue,
    submitReview,
    approvePriority,
    supervisorJumpQueue,
  } = useQueueStore();

  const [activeTab, setActiveTab] = useState<TabType>('review');
  const [reviewComment, setReviewComment] = useState('');
  const [selectedNumberId, setSelectedNumberId] = useState<string | null>(null);
  const [jumpReason, setJumpReason] = useState('');
  const [showJumpModal, setShowJumpModal] = useState(false);
  const [selectedNumberForJump, setSelectedNumberForJump] = useState<string | null>(null);

  const reviewingNumbers = numbers.filter(n => n.status === 'reviewing' && n.reviewStatus === 'pending');
  const pendingPriorities = priorityChanges.filter(p => !p.approvedById);
  const waitingNumbers = numbers.filter(n => n.status === 'waiting');

  const handleReview = (numberId: string, result: ReviewResult) => {
    if (!reviewComment.trim()) {
      alert('请填写复核意见');
      return;
    }
    submitReview(numberId, result, reviewComment.trim(), currentUserName);
    setReviewComment('');
    setSelectedNumberId(null);
  };

  const handleJump = () => {
    if (selectedNumberForJump && jumpReason.trim()) {
      supervisorJumpQueue(selectedNumberForJump, jumpReason.trim());
      setShowJumpModal(false);
      setJumpReason('');
      setSelectedNumberForJump(null);
    }
  };

  const pendingReviewCount = reviewingNumbers.length;
  const pendingPriorityCount = pendingPriorities.length;

  const tabs: { id: TabType; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'review', label: '复核处理', icon: <Shield className="w-4 h-4" />, count: pendingReviewCount },
    { id: 'priority', label: '优先级审批', icon: <ArrowUpCircle className="w-4 h-4" />, count: pendingPriorityCount },
    { id: 'jump', label: '主管插队', icon: <Users className="w-4 h-4" /> },
    { id: 'history', label: '历史记录', icon: <History className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">现场主管工作台</h1>
            <p className="text-gray-500 text-sm">调整优先级、处理复核退回、审批插队申请</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6 p-4 bg-purple-50 rounded-lg">
          <User className="w-5 h-5 text-purple-600" />
          <span className="font-medium text-purple-800">当前操作员：{currentUserName}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
            <div className="text-sm text-orange-600 mb-1">待复核</div>
            <div className="text-3xl font-bold text-orange-700">{pendingReviewCount}</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-sm text-blue-600 mb-1">待审批优先级</div>
            <div className="text-3xl font-bold text-blue-700">{pendingPriorityCount}</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="text-sm text-green-600 mb-1">等待队列</div>
            <div className="text-3xl font-bold text-green-700">{waitingNumbers.length}</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <div className="text-sm text-purple-600 mb-1">当前处理中</div>
            <div className="text-3xl font-bold text-purple-700">
              {numbers.filter(n => n.status === 'calling' || n.status === 'processing').length}
            </div>
          </div>
        </div>

        <div className="flex gap-2 border-b border-gray-200 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600 font-medium'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'review' && (
          <div className="space-y-4">
            {reviewingNumbers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
                <p>暂无待复核的货物</p>
              </div>
            ) : (
              reviewingNumbers.map(num => {
                const businessInfo = BUSINESS_SKILLS.find(s => s.type === num.businessType);
                return (
                  <div
                    key={num.id}
                    className={`p-6 border rounded-xl transition-all ${
                      selectedNumberId === num.id
                        ? 'bg-orange-50 border-orange-300'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <span className="text-4xl font-bold text-orange-600">{num.number}</span>
                        <div>
                          <div className="font-medium text-lg text-gray-900">{num.brokerName}</div>
                          <div className="text-sm text-gray-500">{num.company}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                              {businessInfo?.name}
                            </span>
                            {num.riskLevel && (
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${RISK_LEVEL_LABELS[num.riskLevel].color}`}>
                                {RISK_LEVEL_LABELS[num.riskLevel].label}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {new Date(num.createdAt).toLocaleString('zh-CN')}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                          num.status === 'reviewing' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {QUEUE_STATUS_LABELS[num.status]}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">货物描述</div>
                        <div className="font-medium text-gray-900">{num.cargoDescription}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 mb-1">货物重量</div>
                        <div className="font-medium text-gray-900">{num.cargoWeight} kg</div>
                      </div>
                    </div>

                    {selectedNumberId === num.id ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FileText className="w-4 h-4 inline mr-1" />
                            复核意见
                          </label>
                          <textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="请填写复核意见..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 resize-none"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleReview(num.id, 'approved')}
                            className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-5 h-5" />
                            审核通过
                          </button>
                          <button
                            onClick={() => handleReview(num.id, 'rejected')}
                            className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-5 h-5" />
                            退回补正
                          </button>
                          <button
                            onClick={() => {
                              setSelectedNumberId(null);
                              setReviewComment('');
                            }}
                            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedNumberId(num.id)}
                        className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
                      >
                        开始复核
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'priority' && (
          <div className="space-y-4">
            {pendingPriorities.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
                <p>暂无待审批的优先级申请</p>
              </div>
            ) : (
              pendingPriorities.map(pc => {
                const num = numbers.find(n => n.id === pc.numberId);
                return (
                  <div key={pc.id} className="p-6 bg-white border border-gray-200 rounded-xl">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-full">
                          <ArrowUpCircle className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            号码 <span className="text-xl font-bold text-purple-600">{pc.number}</span> 优先级调整申请
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            申请人：{pc.approvedByName} | {new Date(pc.approvedAt).toLocaleString('zh-CN')}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-sm text-gray-500 mb-1">原优先级</div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${PRIORITY_LABELS[pc.oldPriority].color}`}>
                          {PRIORITY_LABELS[pc.oldPriority].label}
                        </span>
                      </div>
                      <div className="flex items-center justify-center">
                        <ArrowUpCircle className="w-6 h-6 text-purple-500" />
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500 mb-1">申请优先级</div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${PRIORITY_LABELS[pc.newPriority].color}`}>
                          {PRIORITY_LABELS[pc.newPriority].label}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-sm text-gray-500 mb-1">申请理由</div>
                      <div className="p-3 bg-gray-50 rounded-lg text-gray-700">{pc.reason}</div>
                    </div>

                    <div className="mb-4">
                      <div className="text-sm text-gray-500 mb-1">有效期至</div>
                      <div className="font-medium text-gray-900">
                        {new Date(pc.expiryDate).toLocaleString('zh-CN')}
                      </div>
                    </div>

                    {num && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <div className="text-sm text-blue-700">
                          <span className="font-medium">货物信息：</span>
                          {num.cargoDescription} | {num.brokerName} | {num.company}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => approvePriority(pc.id, true)}
                        className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        批准申请
                      </button>
                      <button
                        onClick={() => approvePriority(pc.id, false)}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        驳回申请
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'jump' && (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-yellow-800">主管插队说明</div>
                <div className="text-sm text-yellow-700">
                  插队将把指定号码提升至最高优先级（优先级5），有效期2小时。请谨慎使用此功能。
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {waitingNumbers.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-gray-500">
                  <p>当前没有等待中的号码</p>
                </div>
              ) : (
                waitingNumbers.map(num => {
                  const businessInfo = BUSINESS_SKILLS.find(s => s.type === num.businessType);
                  return (
                    <div key={num.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-gray-800">{num.number}</span>
                          <div>
                            <div className="font-medium">{num.brokerName}</div>
                            <div className="text-xs text-gray-500">{businessInfo?.name}</div>
                          </div>
                        </div>
                        {num.priority > 0 && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_LABELS[num.priority].color}`}>
                            {PRIORITY_LABELS[num.priority].label}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mb-3">{num.cargoDescription}</div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>等待 {Math.floor((Date.now() - new Date(num.createdAt).getTime()) / 60000)} 分钟</span>
                        <button
                          onClick={() => {
                            setSelectedNumberForJump(num.id);
                            setShowJumpModal(true);
                          }}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
                        >
                          主管插队
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">复核记录</h3>
              <div className="space-y-3">
                {reviewRecords.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">暂无复核记录</p>
                ) : (
                  reviewRecords.slice(-10).reverse().map(record => (
                    <div key={record.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-800">{record.number}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            record.result === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {record.result === 'approved' ? '通过' : '退回'}
                          </span>
                          {record.riskLevel && (
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${RISK_LEVEL_LABELS[record.riskLevel].color}`}>
                              {RISK_LEVEL_LABELS[record.riskLevel].label}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(record.createdAt).toLocaleString('zh-CN')}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{record.brokerName}</span>
                        <span className="mx-2">|</span>
                        复核人：{record.reviewerName}
                      </div>
                      <div className="mt-2 text-sm text-gray-700 p-2 bg-white rounded border border-gray-200">
                        {record.comment}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">优先级变更记录</h3>
              <div className="space-y-3">
                {priorityChanges.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">暂无优先级变更记录</p>
                ) : (
                  priorityChanges.slice(-10).reverse().map(pc => (
                    <div key={pc.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-800">{pc.number}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_LABELS[pc.oldPriority].color}`}>
                            {PRIORITY_LABELS[pc.oldPriority].label}
                          </span>
                          <ArrowUpCircle className="w-4 h-4 text-gray-400" />
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_LABELS[pc.newPriority].color}`}>
                            {PRIORITY_LABELS[pc.newPriority].label}
                          </span>
                          {pc.approvedById ? (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">已批准</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">待审批</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(pc.approvedAt).toLocaleString('zh-CN')}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        申请人：{pc.approvedByName}
                        {pc.approvedById && <span> | 审批人：{pc.approvedByName}</span>}
                      </div>
                      <div className="mt-2 text-sm text-gray-700">
                        理由：{pc.reason}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showJumpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">主管插队</h3>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <div className="text-red-800">
                <AlertTriangle className="w-5 h-5 inline mr-2" />
                此操作将把号码提升至最高优先级
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">插队理由</label>
              <textarea
                value={jumpReason}
                onChange={(e) => setJumpReason(e.target.value)}
                placeholder="请填写插队理由..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleJump}
                disabled={!jumpReason.trim()}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
              >
                确认插队
              </button>
              <button
                onClick={() => {
                  setShowJumpModal(false);
                  setJumpReason('');
                  setSelectedNumberForJump(null);
                }}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
