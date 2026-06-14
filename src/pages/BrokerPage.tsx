import { useState } from 'react';
import { useQueueStore } from '@/store/queueStore';
import { BUSINESS_SKILLS, PRIORITY_LABELS, QUEUE_STATUS_LABELS, RISK_LEVEL_LABELS } from '@/types';
import type { BusinessType, PriorityLevel, RiskLevel } from '@/types';
import { Ticket, ClipboardList, Clock, AlertTriangle, CheckCircle, FileText, Package, Scale } from 'lucide-react';

export default function BrokerPage() {
  const { brokers, numbers, createQueueNumber, getCurrentQueue, requestPriority } = useQueueStore();
  const [selectedBroker, setSelectedBroker] = useState(brokers[0]?.id || '');
  const [businessType, setBusinessType] = useState<BusinessType>('general');
  const [cargoDescription, setCargoDescription] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [isSpecialCargo, setIsSpecialCargo] = useState(false);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('low');
  const [documentsComplete, setDocumentsComplete] = useState(true);
  const [missingDocs, setMissingDocs] = useState('');
  const [priorityRequest, setPriorityRequest] = useState(false);
  const [requestedPriority, setRequestedPriority] = useState<PriorityLevel>(1);
  const [priorityReason, setPriorityReason] = useState('');
  const [expiryHours, setExpiryHours] = useState(1);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const availableBrokers = brokers.filter(b => !b.isBlacklisted);
  const broker = brokers.find(b => b.id === selectedBroker);
  const myNumbers = numbers.filter(n => n.brokerId === selectedBroker).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cargoDescription.trim() || !cargoWeight) {
      setResult({ type: 'error', message: '请填写货物描述和重量' });
      return;
    }
    const missingArray = documentsComplete ? [] : missingDocs.split(/[,，、]/).map(s => s.trim()).filter(Boolean);
    const newNumber = createQueueNumber(
      selectedBroker,
      businessType,
      cargoDescription.trim(),
      parseFloat(cargoWeight),
      { complete: documentsComplete, missing: missingArray },
      isSpecialCargo,
      isSpecialCargo ? riskLevel : undefined
    );
    if (newNumber) {
      setResult({
        type: 'success',
        message: `取号成功！您的号码是【${newNumber.number}】${newNumber.status === 'reviewing' ? '，已进入人工复核队列' : ''}`,
      });
      if (priorityRequest && priorityReason.trim()) {
        requestPriority(newNumber.id, requestedPriority, priorityReason.trim(), expiryHours);
      }
      setCargoDescription('');
      setCargoWeight('');
      setIsSpecialCargo(false);
      setDocumentsComplete(true);
      setMissingDocs('');
      setPriorityRequest(false);
      setPriorityReason('');
    } else {
      setResult({ type: 'error', message: '取号失败，请检查您的账户状态' });
    }
    setTimeout(() => setResult(null), 5000);
  };

  const currentQueue = getCurrentQueue();
  const myPosition = currentQueue.findIndex(n => n.brokerId === selectedBroker && n.status === 'waiting') + 1;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Ticket className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">报关员取号</h1>
            <p className="text-gray-500 text-sm">预约取号并提交资料预审</p>
          </div>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">选择报关员</label>
          <select
            value={selectedBroker}
            onChange={(e) => setSelectedBroker(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {availableBrokers.map(b => (
              <option key={b.id} value={b.id}>
                {b.name} - {b.company}
              </option>
            ))}
          </select>
          {broker && (
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">联系电话：</span>{broker.phone}
              {broker.isBlacklisted && (
                <span className="ml-2 text-red-600 font-medium">⚠️ 黑名单用户</span>
              )}
            </div>
          )}
        </div>

        {myPosition > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <span className="font-medium text-blue-800">您当前排在第 {myPosition} 位</span>
              <span className="text-blue-600 text-sm ml-2">前方有 {myPosition - 1} 人等待</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="w-4 h-4 inline mr-1" />
                业务类型
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {BUSINESS_SKILLS.map(s => (
                  <option key={s.type} value={s.type}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Scale className="w-4 h-4 inline mr-1" />
                货物重量 (kg)
              </label>
              <input
                type="number"
                value={cargoWeight}
                onChange={(e) => setCargoWeight(e.target.value)}
                placeholder="请输入货物重量"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              货物描述
            </label>
            <textarea
              value={cargoDescription}
              onChange={(e) => setCargoDescription(e.target.value)}
              placeholder="请详细描述货物信息..."
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="specialCargo"
              checked={isSpecialCargo}
              onChange={(e) => setIsSpecialCargo(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="specialCargo" className="text-sm font-medium text-gray-700">
              特殊货物（需人工复核）
            </label>
          </div>

          {isSpecialCargo && (
            <div className="ml-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">风险等级</label>
              <div className="flex gap-4">
                {(['low', 'medium', 'high'] as RiskLevel[]).map(level => (
                  <label key={level} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="riskLevel"
                      checked={riskLevel === level}
                      onChange={() => setRiskLevel(level)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className={`px-2 py-1 rounded text-sm ${RISK_LEVEL_LABELS[level].color}`}>
                      {RISK_LEVEL_LABELS[level].label}
                    </span>
                  </label>
                ))}
              </div>
              {riskLevel === 'high' && (
                <p className="mt-2 text-sm text-red-600">⚠️ 高风险货物将自动进入人工复核流程</p>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="docsComplete"
              checked={documentsComplete}
              onChange={(e) => setDocumentsComplete(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="docsComplete" className="text-sm font-medium text-gray-700">
              资料齐全
            </label>
          </div>

          {!documentsComplete && (
            <div className="ml-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">缺少的资料（用逗号分隔）</label>
              <input
                type="text"
                value={missingDocs}
                onChange={(e) => setMissingDocs(e.target.value)}
                placeholder="例如：商业发票、装箱单、合同"
                className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="priorityRequest"
              checked={priorityRequest}
              onChange={(e) => setPriorityRequest(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="priorityRequest" className="text-sm font-medium text-gray-700">
              申请优先级（需主管审批）
            </label>
          </div>

          {priorityRequest && (
            <div className="ml-6 p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">申请优先级</label>
                  <select
                    value={requestedPriority}
                    onChange={(e) => setRequestedPriority(parseInt(e.target.value) as PriorityLevel)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    {[1, 2, 3, 4].map(p => (
                      <option key={p} value={p}>
                        {PRIORITY_LABELS[p as PriorityLevel].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">有效期（小时）</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={expiryHours}
                    onChange={(e) => setExpiryHours(parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">申请理由</label>
                <textarea
                  value={priorityReason}
                  onChange={(e) => setPriorityReason(e.target.value)}
                  placeholder="请说明申请加急的原因..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
                />
              </div>
            </div>
          )}

          {result && (
            <div className={`p-4 rounded-lg flex items-center gap-3 ${
              result.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              {result.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
              <span className={result.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {result.message}
              </span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Ticket className="w-5 h-5" />
            提交取号
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <ClipboardList className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">我的取号记录</h2>
        </div>
        <div className="space-y-3">
          {myNumbers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">暂无取号记录</p>
          ) : (
            myNumbers.slice(0, 5).map(num => (
              <div key={num.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-blue-600">{num.number}</span>
                    <div>
                      <div className="font-medium text-gray-900">{num.cargoDescription}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(num.createdAt).toLocaleString('zh-CN')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {num.priority > 0 && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_LABELS[num.priority].color}`}>
                        {PRIORITY_LABELS[num.priority].label}
                        {!num.priorityApproved && ' (待审批)'}
                      </span>
                    )}
                    {num.isSpecialCargo && num.riskLevel && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${RISK_LEVEL_LABELS[num.riskLevel].color}`}>
                        {RISK_LEVEL_LABELS[num.riskLevel].label}
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      num.status === 'completed' ? 'bg-green-100 text-green-700' :
                      num.status === 'waiting' ? 'bg-blue-100 text-blue-700' :
                      num.status === 'calling' ? 'bg-yellow-100 text-yellow-700' :
                      num.status === 'processing' ? 'bg-purple-100 text-purple-700' :
                      num.status === 'reviewing' ? 'bg-orange-100 text-orange-700' :
                      num.status === 'passed' ? 'bg-gray-100 text-gray-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {QUEUE_STATUS_LABELS[num.status]}
                    </span>
                  </div>
                </div>
                {!num.documentsComplete && num.missingDocuments && (
                  <div className="mt-2 text-sm text-orange-600">
                    ⚠️ 缺少资料：{num.missingDocuments.join('、')}
                  </div>
                )}
                {num.reviewStatus === 'rejected' && num.reviewComment && (
                  <div className="mt-2 text-sm text-red-600">
                    ❌ 复核退回：{num.reviewComment}
                  </div>
                )}
                {num.passCount > 0 && (
                  <div className="mt-2 text-sm text-gray-500">
                    过号次数：{num.passCount}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
