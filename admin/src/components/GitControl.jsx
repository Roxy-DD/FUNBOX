import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Cloud, Check, Loader2, GitBranch, AlertCircle, ArrowUpCircle } from 'lucide-react';

export default function GitControl() {
    const { t } = useLanguage();
    const toast = useToast();
    const [status, setStatus] = useState({ hasChanges: false, changes: [], branch: '-' });
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);

    const checkStatus = () => {
        setLoading(true);
        fetch('/api/git/status')
            .then(res => res.json())
            .then(data => {
                setStatus(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleSync = () => {
        if (!status.hasChanges) return;
        
        setSyncing(true);
        fetch('/api/git/sync', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    toast.success(t('git.success'));
                    checkStatus();
                } else {
                    toast.error(t('git.error') + ': ' + data.error);
                }
            })
            .catch(() => toast.error(t('git.error')))
            .finally(() => setSyncing(false));
    };

    return (
        <div className="p-3 mx-3 mt-auto mb-3 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-gray-400 uppercase flex items-center gap-1 tracking-wider">
                    <Cloud size={11} />
                    {t('git.status')}
                </span>
                <span className="text-[10px] text-blue-500 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 font-medium">
                    <GitBranch size={9} />
                    {status.branch}
                </span>
            </div>

            {loading ? (
                <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
                    <Loader2 size={14} className="animate-spin" />
                    {t('common.loading')}
                </div>
            ) : status.hasChanges ? (
                <div className="space-y-2.5">
                    <div className="text-xs text-gray-600 flex items-center gap-1.5">
                        <AlertCircle size={14} className="text-amber-500" />
                        <span>{t('git.hasChanges').replace('{{count}}', status.changes.length)}</span>
                    </div>
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-300 ${
                            syncing 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-md hover:shadow-blue-500/25'
                        }`}
                    >
                        {syncing ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                {t('git.syncing')}
                            </>
                        ) : (
                            <>
                                <ArrowUpCircle size={14} />
                                {t('git.syncNow')}
                            </>
                        )}
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-2 text-xs text-emerald-600 py-1">
                    <Check size={14} />
                    <span>{t('git.noChanges')}</span>
                </div>
            )}
        </div>
    );
}
