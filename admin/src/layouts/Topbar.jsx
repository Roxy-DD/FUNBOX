import React, { useState, useEffect } from 'react';
import { Languages, User, Bell, Cloud, Check, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Topbar() {
    const { lang, toggleLang, t } = useLanguage();
    const [gitStatus, setGitStatus] = useState({ hasChanges: false });
    const [syncing, setSyncing] = useState(false);

    const checkGitStatus = () => {
        fetch('/api/git/status')
            .then(res => res.json())
            .then(data => setGitStatus(data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        checkGitStatus();
        const interval = setInterval(checkGitStatus, 30000); // Every 30s
        return () => clearInterval(interval);
    }, []);

    const handleSync = () => {
        if (!gitStatus.hasChanges || syncing) return;
        
        setSyncing(true);
        fetch('/api/git/sync', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    checkGitStatus();
                } else {
                    alert(t('git.error') + ': ' + data.error);
                }
            })
            .catch(err => alert(t('git.error')))
            .finally(() => setSyncing(false));
    };

    return (
        <div className="h-16 bg-white border-b flex items-center justify-between px-6">
            <div className="text-gray-400 text-sm">
                {/* Breadcrumbs placeholder */}
            </div>
            
            <div className="flex items-center gap-4">
                {/* One-Click Sync Button */}
                <button 
                    onClick={handleSync}
                    disabled={!gitStatus.hasChanges || syncing}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        syncing 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : gitStatus.hasChanges
                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
                                : 'bg-green-50 text-green-600 border border-green-200 cursor-default'
                    }`}
                    title={gitStatus.hasChanges ? t('git.syncNow') : t('git.noChanges')}
                >
                    {syncing ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>{t('git.syncing')}</span>
                        </>
                    ) : gitStatus.hasChanges ? (
                        <>
                            <Cloud size={16} />
                            <span>{t('git.syncNow')}</span>
                            {gitStatus.changes && gitStatus.changes.length > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs">
                                    {gitStatus.changes.length}
                                </span>
                            )}
                        </>
                    ) : (
                        <>
                            <Check size={16} />
                            <span>{t('git.synced')}</span>
                        </>
                    )}
                </button>

                <div className="h-8 w-px bg-gray-200"></div>
                
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
