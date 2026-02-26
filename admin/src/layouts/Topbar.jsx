import React, { useState } from 'react';
import { Languages, Cloud, Loader2, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

export default function Topbar() {
    const { lang, toggleLang, t } = useLanguage();
    const toast = useToast();
    const [syncing, setSyncing] = useState(false);

    const handleSync = () => {
        if (syncing) return;
        
        setSyncing(true);
        fetch('/api/git/push-posts', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    toast.success(t('topbar.syncSuccess'));
                } else {
                    toast.error(t('topbar.syncFailed') + ': ' + data.error);
                }
            })
            .catch(err => toast.error(t('topbar.syncFailed') + ': ' + err.message))
            .finally(() => setSyncing(false));
    };

    return (
        <div className="h-14 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6">
            <div className="text-gray-400 text-sm">
                {/* Breadcrumbs placeholder */}
            </div>
            
            <div className="flex items-center gap-3">
                {/* Sync Button */}
                <button 
                    onClick={handleSync}
                    disabled={syncing}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                        syncing 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/25'
                    }`}
                >
                    {syncing ? (
                        <>
                            <Loader2 size={15} className="animate-spin" />
                            <span>{t('topbar.syncing')}</span>
                        </>
                    ) : (
                        <>
                            <Cloud size={15} />
                            <span>{t('topbar.syncToRemote')}</span>
                        </>
                    )}
                </button>

                <div className="h-7 w-px bg-gray-200" />
                
                <button 
                    onClick={toggleLang}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-medium transition-all duration-200 ring-1 ring-gray-200"
                >
                    <Languages size={15} />
                    <span>{lang === 'en' ? 'EN' : '中'}</span>
                </button>
                
                <div className="flex items-center gap-3 ml-1">
                    <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-violet-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        A
                    </div>
                </div>
            </div>
        </div>
    );
}
