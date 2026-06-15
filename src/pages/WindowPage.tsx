import { useState } from 'react';
import { useQueueStore } from '@/store/queueStore';
import {
  BUSINESS_SKILLS,
  PRIORITY_LABELS,
  WINDOW_STATUSES,
  QUEUE_STATUS_LABELS,
  RISK_LEVEL_LABELS,
} from '@/types';
import type { WindowStatus } from '@/types';
import {
  Monitor,
  Play,
  Pause,
  Square,
  SkipForward,
  User,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle,
  Coffee,
} from 'lucide-react';

export default function WindowPage() {
  const {
    windows,
    numbers,
    getWaitingQueue,
    getNextNumber,
    callNextNumber,
    startProcessing,
    completeNumber,
    pauseWindow,
    resumeWindow,
    passNumber,
  } = useQueueStore();

  const [selectedWindow, setSelectedWindow] = useState(windows[0]?.id || '');
  const [pauseReason, setPauseReason] = useState('');
  const [passReason, setPassReason] = useState('');
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);

  const window = windows.find(w => w.id === selectedWindow);
  const currentNumber = numbers.find(n => n.id === window?.currentNumberId);
  const waitingQueue = getWaitingQueue(selectedWindow);
  const nextNumber = getNextNumber(selectedWindow);

  const handleCallNext = () => {
    if (!window || window.status !== 'open') return;
    callNextNumber(selectedWindow);
  };

  const handleComplete = () => {
    if (currentNumber) {
      completeNumber(currentNumber.id);
    }
  };

  const handlePause = (status: WindowStatus) => {
    pauseWindow(selectedWindow, pauseReason || (status === 'lunch' ? '午休' : '暂停服务'), status);
    setShowPauseModal(false);
    setPauseReason('');
  };

  const handleResume = () => {
    resumeWindow(selectedWindow);
  };

  const handlePass = () => {
    if (currentNumber) {
      passNumber(currentNumber.id, selectedWindow, passReason || '报关员未到');
      setShowPassModal(false);
      setPassReason('');
    }
  };

  const statusInfo = window ? WINDOW_STATUSES.find(s => s.value === window.status) : null;
  const canCall = window?.status === 'open' && !!nextNumber;
  const canPause = window?.status === 'open';
  const canResume = window?.status === 'paused' || window?.status === 'lunch';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <Monitor className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">窗口叫号</h1>
            <p className="text-gray-500 text-sm">按业务类型和窗口技能叫号</p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">选择窗口</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {windows.map(w => {
              const ws = WINDOW_STATUSES.find(s => s.value === w.status);
              return (
                <button
                  key={w.id}
                  onClick={() => setSelectedWindow(w.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedWindow === w.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg">{w.name}</span>
                    <span className={`w-3 h-3 rounded-full ${ws?.color}`} />
                  </div>
                  <div className="text-sm text-gray-500">
                    {ws?.label}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    已办理: {w.processedCount}件
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {window && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${statusInfo?.color}`} />
                <span className="font-medium">{window.name}</span>
                <span className="text-gray-500">— {window.operator || '未分配'}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo?.color} text-white`}>
                {statusInfo?.label}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">业务技能：</span>
              {window.skills.map(skill => {
                const skillInfo = BUSINESS_SKILLS.find(s => s.type === skill);
                return (
                  <span key={skill} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-sm">
                    {skillInfo?.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {window?.status !== 'open' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800">
              窗口当前处于【{statusInfo?.label}】状态，无法叫号
            </span>
          </div>
        )}

        {currentNumber && (
          <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-600 mb-1">正在办理</div>
                <div className="text-5xl font-bold text-blue-700">{currentNumber.number}</div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-900">{currentNumber.brokerName}</span>
                </div>
                <div className="text-sm text-gray-500">{currentNumber.company}</div>
                <div className="flex items-center gap-2 mt-2">
                  {currentNumber.priority > 0 && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_LABELS[currentNumber.priority].color}`}>
                      {PRIORITY_LABELS[currentNumber.priority].label}
                    </span>
                  )}
                  {currentNumber.isSpecialCargo && currentNumber.riskLevel && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${RISK_LEVEL_LABELS[currentNumber.riskLevel].color}`}>
                      {RISK_LEVEL_LABELS[currentNumber.riskLevel].label}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <FileText className="w-4 h-4" />
                <span className="font-medium">{currentNumber.cargoDescription}</span>
                <span className="text-gray-400">|</span>
                <span>{currentNumber.cargoWeight} kg</span>
              </div>
              {!currentNumber.documentsComplete && currentNumber.missingDocuments && (
                <div className="mt-2 flex items-center gap-2 text-sm text-orange-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span>缺少资料：{currentNumber.missingDocuments.join('、')}</span>
                </div>
              )}
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>叫号时间：{currentNumber.calledAt && new Date(currentNumber.calledAt).toLocaleTimeString('zh-CN')}</span>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleComplete}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                办理完成
              </button>
              <button
                onClick={() => setShowPassModal(true)}
                className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <SkipForward className="w-5 h-5" />
                过号（回队尾）
              </button>
              <button
                onClick={() => {
                  if (currentNumber) {
                    startProcessing(currentNumber.id);
                  }
                }}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                开始办理
              </button>
            </div>
          </div>
        )}

        {!currentNumber && (
          <div className="mb-6 p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl text-center">
            <div className="text-4xl mb-3">📢</div>
            <div className="text-gray-500 mb-4">
              {window?.status !== 'open'
                ? '窗口暂停服务，请恢复后再叫号'
                : !nextNumber
                ? '当前等待队列为空'
                : '点击下方按钮叫下一号'}
            </div>
            {canCall && nextNumber && (
              <button
                onClick={handleCallNext}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-lg transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <Play className="w-6 h-6" />
                叫号：{nextNumber.number}
              </button>
            )}
          </div>
        )}

        {currentNumber && currentNumber.status === 'calling' && (
          <div className="mb-6 p-6 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-amber-600 mb-1">等待报到</div>
                <div className="text-5xl font-bold text-amber-700">{currentNumber.number}</div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-900">{currentNumber.brokerName}</span>
                </div>
                <div className="text-sm text-gray-500">{currentNumber.company}</div>
                <div className="flex items-center gap-2 mt-2">
                  {currentNumber.priority > 0 && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_LABELS[currentNumber.priority].color}`}>
                      {PRIORITY_LABELS[currentNumber.priority].label}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-amber-200 flex gap-3">
              <button
                onClick={() => {
                  if (currentNumber) {
                    startProcessing(currentNumber.id);
                  }
                }}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                报到，开始办理
              </button>
              <button
                onClick={() => setShowPassModal(true)}
                className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <SkipForward className="w-5 h-5" />
                过号（回队尾）
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={handleCallNext}
            disabled={!canCall}
            className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
              canCall
                ? 'border-blue-300 hover:border-blue-500 hover:bg-blue-50'
                : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
            }`}
          >
            <Play className="w-8 h-8 text-blue-600" />
            <span className="font-medium">叫下一号</span>
            {nextNumber && <span className="text-sm text-blue-600">下一位: {nextNumber.number}</span>}
          </button>

          <button
            onClick={() => setShowPauseModal(true)}
            disabled={!canPause}
            className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
              canPause
                ? 'border-yellow-300 hover:border-yellow-500 hover:bg-yellow-50'
                : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
            }`}
          >
            <Pause className="w-8 h-8 text-yellow-600" />
            <span className="font-medium">暂停服务</span>
          </button>

          <button
            onClick={handleResume}
            disabled={!canResume}
            className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
              canResume
                ? 'border-green-300 hover:border-green-500 hover:bg-green-50'
                : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
            }`}
          >
            <Play className="w-8 h-8 text-green-600" />
            <span className="font-medium">恢复服务</span>
          </button>

          <button
            onClick={() => handlePause('lunch')}
            disabled={!canPause}
            className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
              canPause
                ? 'border-orange-300 hover:border-orange-500 hover:bg-orange-50'
                : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
            }`}
          >
            <Coffee className="w-8 h-8 text-orange-600" />
            <span className="font-medium">午休</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">等待队列</h2>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
              {waitingQueue.length} 人
            </span>
          </div>
        </div>
        <div className="space-y-3">
          {waitingQueue.length === 0 ? (
            <p className="text-gray-500 text-center py-8">等待队列为空</p>
          ) : (
            waitingQueue.map((num, index) => (
              <div
                key={num.id}
                className={`p-4 rounded-lg border transition-all ${
                  index === 0 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-2xl font-bold ${index === 0 ? 'text-blue-600' : 'text-gray-600'}`}>
                      {num.number}
                    </span>
                    <div>
                      <div className="font-medium text-gray-900">{num.brokerName}</div>
                      <div className="text-sm text-gray-500">{num.cargoDescription}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {index === 0 && (
                      <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-medium">
                        下一位
                      </span>
                    )}
                    {num.priority > 0 && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_LABELS[num.priority].color}`}>
                        {PRIORITY_LABELS[num.priority].label}
                      </span>
                    )}
                    {num.isSpecialCargo && num.riskLevel && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${RISK_LEVEL_LABELS[num.riskLevel].color}`}>
                        {RISK_LEVEL_LABELS[num.riskLevel].label}
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      num.status === 'waiting' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {QUEUE_STATUS_LABELS[num.status]}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                  <span>等待时间：{Math.floor((Date.now() - new Date(num.createdAt).getTime()) / 60000)} 分钟</span>
                  {num.passCount > 0 && <span>过号次数：{num.passCount}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showPauseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">暂停服务</h3>
            <p className="text-gray-600 mb-4">请输入暂停原因</p>
            <textarea
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
              placeholder="例如：设备维护、人员临时离岗..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => handlePause('paused')}
                className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
              >
                暂停服务
              </button>
              <button
                onClick={() => handlePause('lunch')}
                className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                午休
              </button>
              <button
                onClick={() => setShowPauseModal(false)}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {showPassModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">过号处理</h3>
            <p className="text-gray-600 mb-2">过号后将自动回到队尾</p>
            <p className="text-sm text-orange-600 mb-4">
              当前号码：<span className="font-bold">{currentNumber?.number}</span>
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-2">过号原因</label>
            <select
              value={passReason}
              onChange={(e) => setPassReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            >
              <option value="报关员未到">报关员未到</option>
              <option value="资料未备齐">资料未备齐</option>
              <option value="报关员临时离开">报关员临时离开</option>
              <option value="其他原因">其他原因</option>
            </select>
            <div className="flex gap-3">
              <button
                onClick={handlePass}
                className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
              >
                确认过号
              </button>
              <button
                onClick={() => setShowPassModal(false)}
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
