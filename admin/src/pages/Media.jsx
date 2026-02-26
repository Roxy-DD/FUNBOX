import React, { useEffect, useState, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Upload, Trash2, Copy, Image as ImageIcon, Check, Search, Grid, List, Loader2 } from 'lucide-react';

export default function Media() {
    const { t } = useLanguage();
    const toast = useToast();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewType, setViewType] = useState('grid'); // grid, list

    const loadImages = () => {
        setLoading(true);
        fetch('/api/media')
            .then(res => res.json())
            .then(data => {
                setImages(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load media", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        loadImages();
    }, []);

    const filteredImages = images.filter(img => 
        img.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleUpload(e.dataTransfer.files[0]);
        }
    }, []);

    const handleUpload = (file) => {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        fetch('/api/media', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                toast.success(t('media.upload') + ': ' + file.name);
                loadImages();
            }
        })
        .catch(err => toast.error(err.message))
        .finally(() => setUploading(false));
    };

    const handleDelete = (filename) => {
        if (!confirm(t('media.deleteConfirm'))) return;

        fetch(`/api/media/${filename}`, {
            method: 'DELETE'
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setImages(prev => prev.filter(img => img.name !== filename));
                toast.success(t('common.delete') + ': ' + filename);
            }
        });
    };

    const copyToClipboard = (path, name) => {
        navigator.clipboard.writeText(path).then(() => {
            setCopiedId(name);
            toast.success(t('media.copySuccess'));
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    const formatBytes = (bytes, decimals = 1) => {
        if (!+bytes) return '0 B';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{t('media.title')}</h2>
                    <p className="text-sm text-gray-400 mt-0.5">{filteredImages.length} {t('media.items')}</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text"
                            placeholder={t('posts.filter.search')}
                            className="pl-9 pr-4 py-2 w-56 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm bg-white"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {/* View Toggle */}
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button onClick={() => setViewType('grid')} className={`p-1.5 rounded-lg transition-all ${viewType === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}>
                            <Grid size={16} />
                        </button>
                        <button onClick={() => setViewType('list')} className={`p-1.5 rounded-lg transition-all ${viewType === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}>
                            <List size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Upload Area */}
            <div 
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                    dragActive ? 'border-blue-400 bg-blue-50 scale-[1.01]' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div className="flex flex-col items-center gap-3">
                    <div className={`p-4 rounded-2xl transition-all duration-300 ${dragActive ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-400'}`}>
                        {uploading ? (
                            <Loader2 size={28} className="animate-spin text-blue-500" />
                        ) : (
                            <Upload size={28} />
                        )}
                    </div>
                    <p className="text-gray-500 font-medium text-sm">
                        {uploading ? t('media.uploading') : t('media.dragDrop')}
                    </p>
                    <input 
                        type="file" 
                        className="hidden" 
                        id="file-upload"
                        onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0])}
                        accept="image/*"
                    />
                    <label 
                        htmlFor="file-upload"
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 cursor-pointer text-sm font-medium"
                    >
                        {t('media.upload')}
                    </label>
                </div>
            </div>

            {/* Image Grid */}
            {loading ? (
                <div className="text-center py-16">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <span className="text-gray-400 text-sm">{t('common.loading')}</span>
                </div>
            ) : filteredImages.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <ImageIcon size={48} className="mx-auto mb-3 text-gray-200" />
                    <p>{t('media.empty')}</p>
                </div>
            ) : viewType === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredImages.map((img) => (
                        <div key={img.name} className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
                            <div className="aspect-square bg-gray-50 overflow-hidden flex items-center justify-center">
                                <img 
                                    src={`http://localhost:5174${img.path}`}
                                    onError={(e) => {e.target.onerror = null; e.target.src=`${img.path}`}}
                                    alt={img.name} 
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                />
                            </div>
                            
                            <div className="p-3">
                                <p className="text-sm font-medium text-gray-800 truncate" title={img.name}>{img.name}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{formatBytes(img.size)}</p>
                            </div>

                            {/* Overlay Actions */}
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col justify-end p-3">
                                <div className="flex gap-2 justify-end">
                                    <button 
                                        onClick={() => copyToClipboard(img.path, img.name)}
                                        className="p-2.5 bg-white/90 text-gray-700 rounded-xl hover:bg-blue-500 hover:text-white transition-colors shadow-sm"
                                        title={t('media.copySuccess')}
                                    >
                                        {copiedId === img.name ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(img.name)}
                                        className="p-2.5 bg-white/90 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors shadow-sm"
                                        title={t('common.delete')}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* List View */
                <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
                    {filteredImages.map((img) => (
                        <div key={img.name} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors group">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                <img 
                                    src={`http://localhost:5174${img.path}`}
                                    onError={(e) => {e.target.onerror = null; e.target.src=`${img.path}`}}
                                    alt={img.name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{img.name}</p>
                                <p className="text-xs text-gray-400">{formatBytes(img.size)}</p>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => copyToClipboard(img.path, img.name)}
                                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    {copiedId === img.name ? <Check size={16} /> : <Copy size={16} />}
                                </button>
                                <button 
                                    onClick={() => handleDelete(img.name)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
