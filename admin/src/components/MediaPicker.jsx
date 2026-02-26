import React, { useEffect, useState, useCallback } from 'react';
import { X, Upload, Search, Check, Loader2, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

export default function MediaPicker({ onSelect, onClose }) {
    const { t } = useLanguage();
    const toast = useToast();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        fetch('/api/media')
            .then(res => res.json())
            .then(data => { setImages(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const filtered = images.filter(img =>
        img.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleUpload = (file) => {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        fetch('/api/media', { method: 'POST', body: formData })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    toast.success(t('media.upload') + ': ' + file.name);
                    // Reload images
                    fetch('/api/media').then(r => r.json()).then(setImages);
                }
            })
            .catch(err => toast.error(err.message))
            .finally(() => setUploading(false));
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files?.[0]) handleUpload(e.dataTransfer.files[0]);
    }, []);

    const handleInsert = () => {
        if (selected) {
            onSelect(selected.path);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div 
                className="bg-white rounded-2xl shadow-2xl w-[680px] max-h-[80vh] flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <ImageIcon size={18} className="text-blue-500" />
                        {t('media.title')}
                    </h3>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600">
                        <X size={18} />
                    </button>
                </div>

                {/* Search + Upload */}
                <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-50">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input
                            type="text"
                            placeholder={t('posts.filter.search')}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <input type="file" id="media-picker-upload" className="hidden" accept="image/*"
                        onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])}
                    />
                    <label htmlFor="media-picker-upload"
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors cursor-pointer text-sm font-medium"
                    >
                        {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                        {t('media.upload')}
                    </label>
                </div>

                {/* Image Grid */}
                <div 
                    className="flex-1 overflow-auto p-4"
                    onDragOver={e => e.preventDefault()}
                    onDrop={handleDrop}
                >
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 size={24} className="animate-spin text-blue-500" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <ImageIcon size={40} className="mx-auto mb-2 text-gray-200" />
                            <p className="text-sm">{t('media.empty')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 gap-3">
                            {filtered.map(img => (
                                <button
                                    key={img.name}
                                    onClick={() => setSelected(img)}
                                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 group ${
                                        selected?.name === img.name 
                                            ? 'border-blue-500 ring-2 ring-blue-200 scale-[0.97]' 
                                            : 'border-transparent hover:border-gray-300'
                                    }`}
                                >
                                    <img
                                        src={`http://localhost:5174${img.path}`}
                                        onError={e => { e.target.onerror = null; e.target.src = img.path; }}
                                        alt={img.name}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                    {selected?.name === img.name && (
                                        <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                                <Check size={16} className="text-white" />
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-[10px] text-white truncate">{img.name}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                    <p className="text-xs text-gray-400">
                        {selected ? selected.name : t('posts.editor.mediaPicker.selectHint')}
                    </p>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleInsert}
                            disabled={!selected}
                            className="px-5 py-2 text-sm bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                        >
                            {t('posts.editor.mediaPicker.insert')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
