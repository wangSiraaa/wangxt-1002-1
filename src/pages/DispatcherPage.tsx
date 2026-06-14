import { useState } from 'react';
import { useQueueStore } from '@/store/queueStore';
import {
  PRIORITY_LABELS,
  RISK_LEVEL_LABELS,
  QUEUE_STATUS_LABELS,
  WINDOW_STATUSES,
  BUSINESS_SKILLS,
} from '@/types';
import {
  LayoutDashboard,
  AlertTriangle,
  XCircle,
  Bell,
  Monitor,
  Users,
  Clock,
  TrendingUp,
  Ban,
  FileX,
  AlertCircle,
  Activity,
  CheckCircle,
  X,
} from 'lucide-react';

export default function DispatcherPage() {
  const {
    numbers,
    windows,
    brokers,
    alerts,
    pauseRecords,
    passRecords,
    getCurrentQueue,
    dismissAlert,
    pauseWindow,
    resumeWindow,
  } = useQueueStore();

  const [selectedWindowForAction, setSelectedWindowForAction] = useState<string | null>(null);
  const [showWindowActionModal, setShowWindowActionModal] = useState(false);
  const [pauseReason, setPauseReason] = useState('');

  const currentQueue = getCurrentQueue();
  const waitingCount = numbers.filter(n => n.status === 'waiting').length;
  const processingCount = numbers.filter(n => n.status === 'calling' || n.status === 'processing').length;
  const reviewingCount = numbers.filter(n => n.status === 'reviewing').length;
  const completedCount = numbers.filter(n => n.status === 'completed').length;
  const incompleteDocsCount = numbers.filter(n => !n.documentsComplete && n.status !== 'completed').length;
  const blacklistedCount = brokers.filter(b => b.isBlacklisted).length;
  const openWindows = windows.filter(w => w.status === 'open').length;
  const pausedWindows = windows.filter(w => w.status === 'paused' || w.status === 'lunch').length;
  const activeAlerts = alerts.filter(a => !a.dismissed);

  const congestionLevel = waitingCount > (openWindows * 5) ? 'high' : waitingCount > (openWindows * 3) ? 'medium' : 'low';

  const averageWaitTime = currentQueue.length > 0
    ? Math.round(
        currentQueue
          .filter(n => n.status === 'waiting')
          .reduce((sum, n) => sum + (Date.now() - new Date(n.createdAt).getTime()) / 60000, 0) /
        Math.max(1, currentQueue.filter(n => n.status === 'waiting').length)
      )
    : 0;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'blacklist': return <Ban className="w-5 h-5" />;
      case 'incomplete': return <FileX className="w-5 h-5" />;
      case 'high_risk': return <AlertCircle className="w-5 h-5" />;
      case 'congestion': return <TrendingUp className="w-5 h-5" />;
      case 'window_down': return <Monitor className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'danger': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const handleWindowPause = (windowId: string) => {
    if (pauseReason.trim()) {
      pauseWindow(windowId, pauseReason.trim(), 'paused');
      setShowWindowActionModal(false);
      setPauseReason('');
      setSelectedWindowForAction(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <LayoutDashboard className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">调度控制台</h1>
              <p className="text-gray-500 text-sm">实时监控窗口负载、拥堵预警和黑名单管理</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              实时监控中
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-xs text-blue-600 font-medium">等待中</span>
            </div>
            <div className="text-3xl font-bold text-blue-700">{waitingCount}</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <span className="text-xs text-purple-600 font-medium">办理中</span>
            </div>
            <div className="text-3xl font-bold text-purple-700">{processingCount}</div>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <span className="text-xs text-orange-600 font-medium">复核中</span>
            </div>
            <div className="text-3xl font-bold text-orange-700">{reviewingCount}</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-xs text-green-600 font-medium">已完成</span>
            </div>
            <div className="text-3xl font-bold text-green-700">{completedCount}</div>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-100">
            <div className="flex items-center justify-between mb-2">
              <FileX className="w-5 h-5 text-red-600" />
              <span className="text-xs text-red-600 font-medium">资料不齐</span>
            </div>
            <div className="text-3xl font-bold text-red-700">{incompleteDocsCount}</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-slate-600" />
              <span className="text-xs text-slate-600 font-medium">平均等待</span>
            </div>
            <div className="text-3xl font-bold text-slate-700">{averageWaitTime}<span className="text-lg">分</span></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-lg border ${
            congestionLevel === 'high' ? 'bg-red-50 border-red-200' :
            congestionLevel === 'medium' ? 'bg-yellow-50 border-yellow-200' :
            'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center gap-3">
              <TrendingUp className={`w-6 h-6 ${
                congestionLevel === 'high' ? 'text-red-600' :
                congestionLevel === 'medium' ? 'text-yellow-600' :
                'text-green-600'
              }`} />
              <div>
                <div className={`font-medium ${
                  congestionLevel === 'high' ? 'text-red-800' :
                  congestionLevel === 'medium' ? 'text-yellow-800' :
                  'text-green-800'
                }`}>
                  拥堵状态：{congestionLevel === 'high' ? '拥堵' : congestionLevel === 'medium' ? '繁忙' : '正常'}
                </div>
                <div className="text-sm text-gray-600">
                  {openWindows}个窗口开放 / {waitingCount}人等待
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-3">
              <Monitor className="w-6 h-6 text-slate-600" />
              <div>
                <div className="font-medium text-slate-800">窗口状态</div>
                <div className="text-sm text-gray-600">
                  {openWindows}个开放 / {pausedWindows}个暂停
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-3">
              <Ban className="w-6 h-6 text-red-600" />
              <div>
                <div className="font-medium text-red-800">黑名单</div>
                <div className="text-sm text-gray-600">{blacklistedCount}名报关员受限</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">实时告警</h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  activeAlerts.length > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {activeAlerts.length} 条
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {activeAlerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
                  <p>暂无告警信息</p>
                </div>
              ) : (
                activeAlerts.map(alert => (
                  <div key={alert.id} className={`p-4 rounded-lg border flex items-start justify-between ${getAlertColor(alert.level)}`}>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                      <div>
                        <div className="font-medium">{alert.message}</div>
                        <div className="text-sm opacity-75 mt-1">
                          {new Date(alert.createdAt).toLocaleString('zh-CN')}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">窗口状态监控</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {windows.map(window => {
                const statusInfo = WINDOW_STATUSES.find(s => s.value === window.status);
                const currentNum = numbers.find(n => n.id === window.currentNumberId);
                const windowQueue = numbers.filter(n =>
                  n.status === 'waiting' && window.skills.includes(n.businessType)
                );
                const avgProcessTime = window.processedCount > 0
                  ? Math.round(120 / window.processedCount)
                  : 0;
                return (
                  <div
                    key={window.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      window.status === 'open' ? 'border-green-200 bg-green-50' :
                      window.status === 'paused' ? 'border-yellow-200 bg-yellow-50' :
                      window.status === 'lunch' ? 'border-orange-200 bg-orange-50' :
                      'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${statusInfo?.color}`} />
                        <span className="font-bold text-lg">{window.name}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusInfo?.color} text-white`}>
                        {statusInfo?.label}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      操作员：{window.operator || '未分配'}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {window.skills.map(skill => {
                        const skillInfo = BUSINESS_SKILLS.find(s => s.type === skill);
                        return (
                          <span key={skill} className="px-2 py-0.5 bg-white rounded text-xs border border-gray-200">
                            {skillInfo?.name}
                          </span>
                        );
                      })}
                    </div>
                    {currentNum && (
                      <div className="p-3 bg-white rounded-lg border border-gray-200 mb-3">
                        <div className="text-xs text-gray-500 mb-1">正在办理</div>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-blue-600">{currentNum.number}</span>
                          <span className="text-sm text-gray-600">{currentNum.brokerName}</span>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <div className="text-gray-500">已办理</div>
                        <div className="font-bold text-gray-800">{window.processedCount}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">待处理</div>
                        <div className="font-bold text-gray-800">{windowQueue.length}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">平均耗时</div>
                        <div className="font-bold text-gray-800">{avgProcessTime}分</div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      {window.status === 'open' ? (
                        <button
                          onClick={() => {
                            setSelectedWindowForAction(window.id);
                            setShowWindowActionModal(true);
                          }}
                          className="flex-1 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors"
                        >
                          暂停服务
                        </button>
                      ) : (window.status === 'paused' || window.status === 'lunch') ? (
                        <button
                          onClick={() => resumeWindow(window.id)}
                          className="flex-1 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                        >
                          恢复服务
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Ban className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-semibold text-gray-900">黑名单管理</h2>
            </div>
            <div className="space-y-3">
              {brokers.filter(b => b.isBlacklisted).length === 0 ? (
                <p className="text-gray-500 text-center py-4 text-sm">暂无黑名单报关员</p>
              ) : (
                brokers.filter(b => b.isBlacklisted).map(broker => (
                  <div key={broker.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="font-medium text-red-800">{broker.name}</div>
                    <div className="text-sm text-gray-600">{broker.company}</div>
                    <div className="text-sm text-red-600 mt-1">{broker.blacklistReason}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">当前队列</h2>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                {currentQueue.length}
              </span>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {currentQueue.map((num, index) => (
                <div
                  key={num.id}
                  className={`p-3 rounded-lg border ${
                    index === 0 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${index === 0 ? 'text-blue-600' : 'text-gray-600'}`}>
                        {num.number}
                      </span>
                      {num.priority > 0 && (
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${PRIORITY_LABELS[num.priority].color}`}>
                          {PRIORITY_LABELS[num.priority].label}
                        </span>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      num.status === 'waiting' ? 'bg-blue-100 text-blue-700' :
                      num.status === 'calling' ? 'bg-yellow-100 text-yellow-700' :
                      num.status === 'processing' ? 'bg-purple-100 text-purple-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {QUEUE_STATUS_LABELS[num.status]}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{num.brokerName}</div>
                  {num.isSpecialCargo && num.riskLevel && (
                    <div className={`mt-1 text-xs font-medium ${RISK_LEVEL_LABELS[num.riskLevel].color} px-2 py-0.5 rounded inline-block`}>
                      {RISK_LEVEL_LABELS[num.riskLevel].label}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">最近操作记录</h2>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {pauseRecords.slice(-5).reverse().map(record => (
                <div key={record.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-yellow-700">{record.windowName}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(record.pausedAt).toLocaleTimeString('zh-CN')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">{record.reason}</div>
                  <div className="text-xs text-gray-500">操作人：{record.pausedBy}</div>
                </div>
              ))}
              {passRecords.slice(-5).reverse().map(record => (
                <div key={record.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">
                      {record.number} 过号
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(record.passedAt).toLocaleTimeString('zh-CN')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {record.windowName} | {record.reason}
                  </div>
                  <div className="text-xs text-gray-500">新位置：第{record.newPosition}位</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showWindowActionModal && selectedWindowForAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">暂停窗口服务</h3>
            <p className="text-gray-600 mb-4">请输入暂停原因</p>
            <textarea
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
              placeholder="例如：设备维护、人员临时离岗、午休..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-yellow-500 resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => handleWindowPause(selectedWindowForAction)}
                disabled={!pauseReason.trim()}
                className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
              >
                确认暂停
              </button>
              <button
                onClick={() => {
                  setShowWindowActionModal(false);
                  setPauseReason('');
                  setSelectedWindowForAction(null);
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
