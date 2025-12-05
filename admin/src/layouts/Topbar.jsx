import React from 'react';
import { Languages, User, Bell } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Topbar() {
    const { lang, toggleLang } = useLanguage();

    return (
        <div className="h-16 bg-white border-b flex items-center justify-between px-6">
            <div className="text-gray-400 text-sm">
                {/* Breadcrumbs placeholder */}
            </div>
            
            <div className="flex items-center gap-4">
                <button 
                    onClick={toggleLang}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
                >
                    <Languages size={16} />
                    <span>{lang === 'en' ? 'English' : '中文'}</span>
                </button>
                
                <div className="h-8 w-px bg-gray-200 mx-2"></div>
                
                <button className="text-gray-500 hover:text-gray-700 relative">
                    <Bell size={20} />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
                <div className="flex items-center gap-3 ml-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        A
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden md:block">Admin</span>
                </div>
            </div>
        </div>
    );
}
