import React, { useState } from 'react';
import { LayoutDashboard, Settings, FileText, ChevronRight, ExternalLink, Image, FolderKanban, Award, Clock, Menu, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import GitControl from '../components/GitControl';

export default function Sidebar({ activeTab, setActiveTab }) {
    const { t, lang } = useLanguage();
    const [collapsed, setCollapsed] = useState(false);
    
    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: t('common.dashboard') },
        { id: 'posts', icon: FileText, label: t('common.posts') },
        { id: 'media', icon: Image, label: t('common.media.title') },
        { id: 'settings', icon: Settings, label: t('common.settings') },
    ];
    
    const dataItems = [
        { id: 'data-projects', icon: FolderKanban, label: lang === 'zh' ? '项目' : 'Projects' },
        { id: 'data-skills', icon: Award, label: lang === 'zh' ? '技能' : 'Skills' },
        { id: 'data-timeline', icon: Clock, label: lang === 'zh' ? '时间线' : 'Timeline' },
    ];

    return (
        <div className={`${collapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-100 h-full flex flex-col transition-all duration-300`}>
            {/* Brand */}
            <div className="px-5 py-5 flex items-center gap-3 border-b border-gray-100">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20 flex-shrink-0">
                    M
                </div>
                {!collapsed && <h1 className="font-bold text-lg text-gray-800 tracking-tight">Mizuki</h1>}
                <button 
                    onClick={() => setCollapsed(!collapsed)} 
                    className="ml-auto p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    {collapsed ? <Menu size={16} /> : <X size={16} />}
                </button>
            </div>
            
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {menuItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group ${
                                isActive 
                                ? 'bg-blue-50 text-blue-600 font-medium ring-1 ring-blue-200' 
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                            }`}
                            title={collapsed ? item.label : undefined}
                        >
                            <Icon size={19} className={isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
                            {!collapsed && <span className="text-sm">{item.label}</span>}
                            {!collapsed && isActive && <ChevronRight size={15} className="ml-auto text-blue-400" />}
                        </button>
                    );
                })}
                
                {/* Data Management Section */}
                <div className="pt-4 mt-4 border-t border-gray-100">
                    {!collapsed && (
                        <div className="px-3.5 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                            {lang === 'zh' ? '数据管理' : 'Data'}
                        </div>
                    )}
                    {dataItems.map(item => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group ${
                                    isActive 
                                    ? 'bg-blue-50 text-blue-600 font-medium ring-1 ring-blue-200' 
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                                }`}
                                title={collapsed ? item.label : undefined}
                            >
                                <Icon size={19} className={isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
                                {!collapsed && <span className="text-sm">{item.label}</span>}
                                {!collapsed && isActive && <ChevronRight size={15} className="ml-auto text-blue-400" />}
                            </button>
                        );
                    })}
                </div>
                
                {/* View Site */}
                <div className="pt-4 mt-4 border-t border-gray-100">
                    <a 
                        href="http://localhost:4321" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-500 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200 group"
                    >
                        <ExternalLink size={19} className="text-gray-400 group-hover:text-emerald-500" />
                        {!collapsed && <span className="text-sm">{t('common.viewSite')}</span>}
                    </a>
                </div>
            </nav>

            {/* Git Control - only show if not collapsed */}
            {!collapsed && <GitControl />}
            
            <div className="p-3 border-t border-gray-100 text-[10px] text-gray-300 text-center font-medium">
                {collapsed ? 'v1.0' : 'Mizuki Admin v1.0'}
            </div>
        </div>
    );
}
