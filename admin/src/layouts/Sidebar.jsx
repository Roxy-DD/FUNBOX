import React from 'react';
import { LayoutDashboard, Settings, FileText, ChevronRight, ExternalLink, Image } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import GitControl from '../components/GitControl';

export default function Sidebar({ activeTab, setActiveTab }) {
    const { t } = useLanguage();
    
    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: t('common.dashboard') },
        { id: 'posts', icon: FileText, label: t('common.posts') },
        { id: 'media', icon: Image, label: t('common.media.title') },
        { id: 'settings', icon: Settings, label: t('common.settings') },
    ];

    return (
        <div className="w-64 bg-white border-r h-full flex flex-col">
            <div className="p-6 flex items-center gap-3 border-b">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    M
                </div>
                <h1 className="font-bold text-xl text-gray-800">Admin</h1>
            </div>
            
            <nav className="flex-1 p-4 space-y-1">
                {menuItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                isActive 
                                ? 'bg-blue-50 text-blue-600 font-medium' 
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                            {isActive && <ChevronRight size={16} className="ml-auto" />}
                        </button>
                    );
                })}
                
                <div className="pt-4 mt-4 border-t">
                    <a 
                        href="http://localhost:4321" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-green-50 hover:text-green-700 transition-all duration-200"
                    >
                        <ExternalLink size={20} />
                        <span>{t('common.viewSite')}</span>
                    </a>
                </div>
            </nav>

            <div className="p-4 border-t text-xs text-gray-400 text-center">
                Mizuki Admin v1.0
            </div>
            
            <GitControl />
        </div>
    );
}
