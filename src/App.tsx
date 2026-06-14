import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "@/pages/Home";
import BrokerPage from "@/pages/BrokerPage";
import WindowPage from "@/pages/WindowPage";
import SupervisorPage from "@/pages/SupervisorPage";
import DispatcherPage from "@/pages/DispatcherPage";
import { Ticket, Monitor, Shield, LayoutDashboard, Anchor } from "lucide-react";

function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "首页", icon: <Anchor className="w-5 h-5" /> },
    { path: "/broker", label: "报关员取号", icon: <Ticket className="w-5 h-5" /> },
    { path: "/window", label: "窗口叫号", icon: <Monitor className="w-5 h-5" /> },
    { path: "/supervisor", label: "主管工作台", icon: <Shield className="w-5 h-5" /> },
    { path: "/dispatcher", label: "调度控制台", icon: <LayoutDashboard className="w-5 h-5" /> },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex items-center gap-2 mr-8">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Anchor className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">口岸排队叫号系统</h1>
                <p className="text-xs text-gray-500">Port Queue Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString('zh-CN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/broker" element={<BrokerPage />} />
            <Route path="/window" element={<WindowPage />} />
            <Route path="/supervisor" element={<SupervisorPage />} />
            <Route path="/dispatcher" element={<DispatcherPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
