import { Link } from "react-router-dom";
import { useQueueStore } from "@/store/queueStore";
import { Ticket, Monitor, Shield, LayoutDashboard, Users, Clock, CheckCircle, AlertTriangle, TrendingUp, ArrowRight } from "lucide-react";

export default function Home() {
  const { numbers, windows, getCurrentQueue } = useQueueStore();
  
  const currentQueue = getCurrentQueue();
  const waitingCount = numbers.filter(n => n.status === 'waiting').length;
  const processingCount = numbers.filter(n => n.status === 'calling' || n.status === 'processing').length;
  const completedCount = numbers.filter(n => n.status === 'completed').length;
  const openWindows = windows.filter(w => w.status === 'open').length;
  const avgWaitTime = currentQueue.length > 0
    ? Math.round(
        currentQueue
          .filter(n => n.status === 'waiting')
          .reduce((sum, n) => sum + (Date.now() - new Date(n.createdAt).getTime()) / 60000, 0) /
        Math.max(1, currentQueue.filter(n => n.status === 'waiting').length)
      )
    : 0;

  const features = [
    {
      title: "报关员取号",
      description: "预约取号并提交资料预审，支持特殊货物申报和优先级申请",
      icon: <Ticket className="w-8 h-8 text-blue-600" />,
      path: "/broker",
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
      stats: `${waitingCount}人等待中`,
    },
    {
      title: "窗口叫号",
      description: "按业务类型和窗口技能叫号，支持暂停/恢复、过号处理",
      icon: <Monitor className="w-8 h-8 text-green-600" />,
      path: "/window",
      color: "bg-green-50 border-green-200 hover:bg-green-100",
      stats: `${openWindows}个窗口开放`,
    },
    {
      title: "主管工作台",
      description: "调整优先级、处理复核退回、审批插队申请",
      icon: <Shield className="w-8 h-8 text-purple-600" />,
      path: "/supervisor",
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
      stats: `${processingCount}件办理中`,
    },
    {
      title: "调度控制台",
      description: "实时监控窗口负载、拥堵预警和黑名单管理",
      icon: <LayoutDashboard className="w-8 h-8 text-slate-600" />,
      path: "/dispatcher",
      color: "bg-slate-50 border-slate-200 hover:bg-slate-100",
      stats: `${completedCount}件已完成`,
    },
  ];

  const coreFeatures = [
    { icon: <Clock className="w-6 h-6 text-blue-600" />, title: "窗口暂停控制", desc: "支持午休、暂停服务，暂停时无法叫号" },
    { icon: <ArrowRight className="w-6 h-6 text-yellow-600" />, title: "过号回队尾", desc: "过号人员自动回到队尾，记录过号原因" },
    { icon: <AlertTriangle className="w-6 h-6 text-orange-600" />, title: "特殊货物复核", desc: "中高风险货物进入人工复核流程" },
    { icon: <TrendingUp className="w-6 h-6 text-red-600" />, title: "主管插队审批", desc: "最高优先级5，有效期2小时，需审批" },
    { icon: <CheckCircle className="w-6 h-6 text-green-600" />, title: "优先级有效期", desc: "优先级申请需审批，设置有效期自动失效" },
    { icon: <Users className="w-6 h-6 text-slate-600" />, title: "拥堵预警调度", desc: "自动检测拥堵，黑名单、资料不齐实时告警" },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">口岸现场排队叫号系统</h1>
          <p className="text-blue-100 text-lg mb-6">
            智能化报关排队管理，解决窗口暂停、过号、特殊货物复核和主管插队等现场问题
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg">
              <Users className="w-5 h-5" />
              <span>{waitingCount} 人等待</span>
            </div>
            <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg">
              <Clock className="w-5 h-5" />
              <span>平均等待 {avgWaitTime} 分钟</span>
            </div>
            <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <span>今日完成 {completedCount} 件</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Link
            key={index}
            to={feature.path}
            className={`p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${feature.color}`}
          >
            <div className="flex items-start justify-between mb-4">
              {feature.icon}
              <span className="text-xs font-medium px-2 py-1 bg-white rounded-full text-gray-600">
                {feature.stats}
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{feature.description}</p>
            <div className="flex items-center text-sm font-medium text-blue-600">
              进入系统 <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">核心功能特性</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreFeatures.map((item, index) => (
            <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">业务流程</h2>
        <div className="relative">
          <div className="flex items-center justify-between">
            {[
              { step: 1, title: "报关员取号", desc: "提交资料预审" },
              { step: 2, title: "系统派号", desc: "按优先级排队" },
              { step: 3, title: "窗口叫号", desc: "按技能匹配" },
              { step: 4, title: "业务办理", desc: "或进入复核" },
              { step: 5, title: "完成/过号", desc: "过号回队尾" },
            ].map((item, index, arr) => (
              <div key={index} className="flex items-center">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-2">
                    {item.step}
                  </div>
                  <div className="font-semibold text-gray-900">{item.title}</div>
                  <div className="text-sm text-gray-500">{item.desc}</div>
                </div>
                {index < arr.length - 1 && (
                  <div className="w-16 md:w-24 border-t-2 border-dashed border-gray-300 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-100 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-800 mb-2">操作说明</h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• 窗口暂停或午休时，无法继续叫下一号</li>
              <li>• 过号人员将自动回到队尾，记录过号次数和原因</li>
              <li>• 特殊货物根据风险等级（中/高）自动进入人工复核</li>
              <li>• 优先级申请需主管审批，设置有效期后自动失效</li>
              <li>• 主管插队优先级为最高级5，有效期2小时</li>
              <li>• 调度台实时展示黑名单、资料不齐、窗口负载和拥堵预警</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}