import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FileText, Cpu, Clock, PenTool, Layout, FolderOpen, ExternalLink, Activity, TrendingUp, Sparkles, Settings } from 'lucide-react';

export default function Dashboard({ setActiveTab }) {
    const { t } = useLanguage();
    const [stats, setStats] = useState({
        total: 0,
        published: 0,
        drafts: 0,
        lastUpdated: '-'
    });
    const [recentPosts, setRecentPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryStats, setCategoryStats] = useState([]);

    useEffect(() => {
        fetch('/api/posts')
            .then(res => res.json())
            .then(data => {
                const sorted = data.sort((a, b) => new Date(b.published || 0) - new Date(a.published || 0));
                setStats({
                    total: data.length,
                    published: data.filter(p => !p.draft).length,
                    drafts: data.filter(p => p.draft).length,
                    lastUpdated: sorted[0]?.published ? new Date(sorted[0].published).toLocaleDateString() : '-'
                });
                setRecentPosts(sorted.slice(0, 5));
                // Compute category stats
                const catMap = {};
                data.forEach(p => {
                    const cat = p.category || 'Uncategorized';
                    catMap[cat] = (catMap[cat] || 0) + 1;
                });
                const catArr = Object.entries(catMap)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 6);
                setCategoryStats(catArr);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load dashboard data", err);
                setLoading(false);
            });
    }, []);

    const statCards = [
        { icon: FileText, title: t('common.stats.totalPosts'), value: stats.total, gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', ring: 'ring-blue-200' },
        { icon: Layout, title: t('common.stats.published'), value: stats.published, gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', ring: 'ring-emerald-200' },
        { icon: PenTool, title: t('common.stats.drafts'), value: stats.drafts, gradient: 'from-amber-400 to-orange-500', bg: 'bg-amber-50', ring: 'ring-amber-200' },
        { icon: Clock, title: t('common.stats.latestUpdate'), value: stats.lastUpdated, gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', ring: 'ring-violet-200' },
    ];

    const catColors = [
        'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-violet-500', 'bg-rose-500', 'bg-cyan-500'
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Sparkles size={24} className="text-amber-400" />
                        {t('common.dashboard')}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">{t('common.welcome')}</p>
                </div>
                <a 
                    href="http://localhost:4321" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 text-sm font-medium"
                >
                    <ExternalLink size={16} />
                    {t('common.viewSite')}
                </a>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {statCards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div 
                            key={idx}
                            className={`relative overflow-hidden rounded-2xl p-5 ${card.bg} ring-1 ${card.ring} hover:shadow-lg transition-all duration-300 group cursor-default`}
                            style={{ animationDelay: `${idx * 80}ms` }}
                        >
                            <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br ${card.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
                            <div className="flex items-center gap-4 relative z-10">
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} text-white shadow-lg shadow-${card.gradient.split(' ')[1]}/30`}>
                                    <Icon size={22} />
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{card.title}</p>
                                    <p className="text-2xl font-bold text-gray-800 mt-0.5">{loading ? '—' : card.value}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <Activity size={20} className="text-blue-500" />
                            {t('common.activity.title')}
                        </h3>
                        <button onClick={() => setActiveTab('posts')} className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors">{t('common.viewAll')}</button>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {loading ? (
                            <div className="p-10 text-center">
                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                <span className="text-gray-400 text-sm">{t('common.loading')}</span>
                            </div>
                        ) : recentPosts.length === 0 ? (
                            <div className="p-12 text-center text-gray-400">
                                <FileText size={40} className="mx-auto mb-3 text-gray-200" />
                                <p>{t('common.noActivity')}</p>
                            </div>
                        ) : (
                            recentPosts.map((post) => (
                                <div key={post.slug} className="px-6 py-4 hover:bg-gray-50/70 transition-all duration-200 flex items-center justify-between group cursor-pointer" onClick={() => setActiveTab('posts')}>
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2.5 rounded-xl ${post.draft ? 'bg-amber-50 text-amber-500 ring-1 ring-amber-200' : 'bg-emerald-50 text-emerald-500 ring-1 ring-emerald-200'}`}>
                                            <FileText size={18} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{post.title || post.slug}</h4>
                                            <p className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                                                <span>{post.published ? new Date(post.published).toLocaleDateString() : '—'}</span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                                <span className="text-gray-400">{post.category || 'Uncategorized'}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setActiveTab('posts'); }}
                                            className="px-3.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                                        >
                                            {t('common.edit')}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="px-6 py-5 border-b border-gray-100">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Cpu size={20} className="text-orange-500" />
                                {t('common.quickActions.title')}
                            </h3>
                        </div>
                        <div className="p-4 space-y-2">
                            {[
                                { label: t('common.quickActions.newPost'), icon: PenTool, tab: 'posts', color: 'blue', gradient: 'from-blue-500 to-indigo-500' },
                                { label: t('common.quickActions.media'), icon: FolderOpen, tab: 'media', color: 'purple', gradient: 'from-purple-500 to-pink-500' },
                                { label: t('common.settings'), icon: Settings, tab: 'settings', color: 'gray', gradient: 'from-gray-500 to-gray-600' },
                            ].map((action) => {
                                const AIcon = action.icon;
                                return (
                                    <button 
                                        key={action.tab}
                                        onClick={() => setActiveTab(action.tab)}
                                        className={`w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-${action.color}-50 group transition-all duration-200 border border-transparent hover:border-${action.color}-100`}
                                    >
                                        <span className={`flex items-center gap-3 font-medium text-gray-700 group-hover:text-${action.color}-700`}>
                                            <div className={`p-2 bg-gradient-to-br ${action.gradient} rounded-lg text-white shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                                                <AIcon size={16} />
                                            </div>
                                            {action.label}
                                        </span>
                                        <span className={`text-gray-300 group-hover:text-${action.color}-400 transition-transform duration-200 group-hover:translate-x-1`}>→</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Category Distribution */}
                    {!loading && categoryStats.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                            <div className="px-6 py-5 border-b border-gray-100">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <TrendingUp size={20} className="text-emerald-500" />
                                    {t('posts.columns.category')}
                                </h3>
                            </div>
                            <div className="p-5 space-y-3">
                                {categoryStats.map((cat, idx) => (
                                    <div key={cat.name} className="flex items-center gap-3">
                                        <div className={`w-2.5 h-2.5 rounded-full ${catColors[idx % catColors.length]}`} />
                                        <span className="text-sm text-gray-600 flex-1 truncate">{cat.name}</span>
                                        <span className="text-sm font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md">{cat.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
