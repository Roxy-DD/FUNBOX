import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import {
    Save, ArrowLeft, Eye, Edit3, Columns,
    Bold, Italic, Strikethrough, List, ListOrdered, Link as LinkIcon, Image as ImageIcon,
    Quote, Code, Heading1, Heading2, Heading3, Table as TableIcon, Pin, FileImage,
    AlignLeft, Loader2, Minus, CheckSquare, Undo2, Redo2,
    ChevronDown, ChevronRight, Calendar, Tag, Folder, FileText,
    PanelRightOpen, PanelRightClose, Type, Hash, Clock, X
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import './EditorPreview.css';
import MediaPicker from './MediaPicker';

export default function PostEditor({ slug, existingCategories = [], existingTags = [], onBack }) {
    const { t, lang } = useLanguage();
    const toast = useToast();
    const [content, setContent] = useState('');
    const [originalContent, setOriginalContent] = useState('');
    const [viewMode, setViewMode] = useState('split');
    const [saving, setSaving] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [metadata, setMetadata] = useState({
        title: '', description: '',
        published: new Date().toISOString().split('T')[0],
        draft: false, tags: '', category: '',
        pinned: false, image: '',
    });
    const [originalMeta, setOriginalMeta] = useState(null);
    const [slugName, setSlugName] = useState(slug === 'new' ? '' : slug);
    const [loading, setLoading] = useState(slug !== 'new');
    const editorRef = useRef(null);
    const previewRef = useRef(null);
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [sidebarSections, setSidebarSections] = useState({
        basic: true, seo: true, publish: true,
    });

    // Load post data
    useEffect(() => {
        if (slug !== 'new') {
            fetch(`/api/posts/${slug}`)
                .then(res => res.json())
                .then(data => {
                    const tags = Array.isArray(data.metadata.tags)
                        ? data.metadata.tags.join(', ')
                        : (data.metadata.tags || '');
                    const meta = { ...data.metadata, tags };
                    setContent(data.content || '');
                    setOriginalContent(data.content || '');
                    setMetadata(meta);
                    setOriginalMeta(meta);
                    setLoading(false);
                });
        } else {
            setOriginalContent('');
            setOriginalMeta({ ...metadata });
        }
    }, [slug]);

    // Unsaved changes detection
    const hasUnsavedChanges = useMemo(() => {
        if (!originalMeta) return false;
        const metaChanged = JSON.stringify(metadata) !== JSON.stringify(originalMeta);
        return content !== originalContent || metaChanged;
    }, [content, originalContent, metadata, originalMeta]);

    useEffect(() => {
        const handler = (e) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [hasUnsavedChanges]);

    // Word/character count
    const wordStats = useMemo(() => {
        const chars = content.length;
        // CJK-aware word count
        const cjk = (content.match(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g) || []).length;
        const nonCjk = content.replace(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g, ' ');
        const words = cjk + (nonCjk.trim() ? nonCjk.trim().split(/\s+/).filter(Boolean).length : 0);
        const readMin = Math.max(1, Math.ceil(words / 300));
        return { chars, words, readMin };
    }, [content]);

    // Auto-generate slug from title (new posts only)
    useEffect(() => {
        if (slug === 'new' && metadata.title && !slugName) {
            const auto = metadata.title
                .toLowerCase()
                .replace(/[\u4e00-\u9fff]+/g, m => m) // keep CJK
                .replace(/[^\w\u4e00-\u9fff-]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '')
                .substring(0, 60);
            setSlugName(auto);
        }
    }, [metadata.title, slug]);

    // Save
    const handleSave = useCallback(() => {
        if (!slugName) return toast.warning(t('posts.editor.slugRequired'));
        if (!metadata.title) return toast.warning(t('posts.editor.titleRequired'));

        setSaving(true);
        const payload = {
            slug: slugName, content,
            metadata: {
                ...metadata,
                tags: typeof metadata.tags === 'string'
                    ? metadata.tags.split(',').map(t => t.trim()).filter(Boolean)
                    : metadata.tags
            }
        };

        fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(() => {
                toast.success(t('common.saved'));
                setOriginalContent(content);
                setOriginalMeta({ ...metadata });
                if (slug === 'new') onBack();
            })
            .catch(err => toast.error(err.message))
            .finally(() => setSaving(false));
    }, [slugName, metadata, content, slug, onBack, t, toast]);

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [handleSave]);

    // Insert text helper
    const insertText = (before, after = '') => {
        const textarea = editorRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const sel = content.substring(start, end);
        const newText = content.substring(0, start) + before + sel + after + content.substring(end);
        setContent(newText);
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, end + before.length);
        }, 0);
    };

    // Tab key support
    const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            insertText('  ');
        }
    };

    // Media picker callback
    const handleMediaSelect = (path) => {
        insertText(`![](${path})`);
    };

    // Clipboard image paste
    const handlePaste = async (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                e.preventDefault();
                const file = item.getAsFile();
                const formData = new FormData();
                formData.append('file', file);
                toast.info(lang === 'zh' ? '正在上传剪贴板图片...' : 'Uploading clipboard image...');
                try {
                    const res = await fetch('/api/media', { method: 'POST', body: formData });
                    const data = await res.json();
                    if (data.path) {
                        insertText(`![](${data.path})`);
                        toast.success(lang === 'zh' ? '图片已插入' : 'Image inserted');
                    }
                } catch (err) {
                    toast.error(err.message);
                }
                break;
            }
        }
    };

    // Sync scroll
    const handleEditorScroll = () => {
        if (viewMode !== 'split' || !editorRef.current || !previewRef.current) return;
        const editor = editorRef.current;
        const ratio = editor.scrollTop / (editor.scrollHeight - editor.clientHeight || 1);
        const preview = previewRef.current;
        preview.scrollTop = ratio * (preview.scrollHeight - preview.clientHeight);
    };

    if (loading) return (
        <div className="h-full flex items-center justify-center">
            <div className="text-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400 text-sm">{t('common.loading')}</p>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col gap-2">
            {/* Top Bar */}
            <div className="flex justify-between items-center bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button onClick={() => {
                        if (hasUnsavedChanges && !confirm(lang === 'zh' ? '有未保存的更改，确定离开？' : 'Unsaved changes. Leave?')) return;
                        onBack();
                    }} className="text-gray-400 hover:text-gray-800 p-2 rounded-xl hover:bg-gray-100 transition-all flex-shrink-0">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex-1 min-w-0">
                        <input
                            type="text"
                            placeholder={t('posts.editor.placeholder.title')}
                            className="text-lg font-bold text-gray-800 border-none focus:ring-0 placeholder-gray-300 w-full bg-transparent outline-none"
                            value={metadata.title}
                            onChange={e => setMetadata({ ...metadata, title: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex gap-2 items-center flex-shrink-0">
                    {/* Status indicator */}
                    {hasUnsavedChanges && (
                        <span className="text-[10px] text-amber-500 bg-amber-50 px-2 py-1 rounded-full font-medium ring-1 ring-amber-200">
                            {lang === 'zh' ? '未保存' : 'Unsaved'}
                        </span>
                    )}
                    {/* View mode */}
                    <div className="flex bg-gray-100 p-0.5 rounded-xl">
                        {[
                            { mode: 'edit', icon: Edit3 },
                            { mode: 'split', icon: Columns },
                            { mode: 'preview', icon: Eye },
                        ].map(({ mode, icon: VIcon }) => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`p-1.5 rounded-lg transition-all duration-200 ${viewMode === mode ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <VIcon size={15} />
                            </button>
                        ))}
                    </div>
                    {/* Sidebar toggle */}
                    <button
                        onClick={() => setShowSidebar(!showSidebar)}
                        className={`p-1.5 rounded-lg transition-all ${showSidebar ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        {showSidebar ? <PanelRightClose size={15} /> : <PanelRightOpen size={15} />}
                    </button>
                    {/* Save */}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 font-medium transition-all duration-300 flex items-center gap-1.5 disabled:opacity-60 text-sm"
                    >
                        {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                        {t('common.save')}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-2 overflow-hidden">
                {/* Main Editor + Preview */}
                <div className="flex-1 flex gap-2 overflow-hidden">
                    {/* Editor */}
                    {(viewMode === 'edit' || viewMode === 'split') && (
                        <div className={`flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
                            {/* Toolbar */}
                            <div className="px-2 py-1.5 border-b bg-gray-50/80 flex items-center gap-0.5 flex-wrap">
                                <ToolbarButton icon={Bold} onClick={() => insertText('**', '**')} shortcut="Ctrl+B" />
                                <ToolbarButton icon={Italic} onClick={() => insertText('*', '*')} shortcut="Ctrl+I" />
                                <ToolbarButton icon={Strikethrough} onClick={() => insertText('~~', '~~')} />
                                <Sep />
                                <ToolbarButton icon={Heading1} onClick={() => insertText('# ')} />
                                <ToolbarButton icon={Heading2} onClick={() => insertText('## ')} />
                                <ToolbarButton icon={Heading3} onClick={() => insertText('### ')} />
                                <Sep />
                                <ToolbarButton icon={List} onClick={() => insertText('- ')} />
                                <ToolbarButton icon={ListOrdered} onClick={() => insertText('1. ')} />
                                <ToolbarButton icon={CheckSquare} onClick={() => insertText('- [ ] ')} />
                                <ToolbarButton icon={Quote} onClick={() => insertText('> ')} />
                                <Sep />
                                <ToolbarButton icon={Code} onClick={() => insertText('```\n', '\n```')} />
                                <ToolbarButton icon={LinkIcon} onClick={() => insertText('[', '](url)')} />
                                <ToolbarButton icon={ImageIcon} onClick={() => setShowMediaPicker(true)} />
                                <ToolbarButton icon={TableIcon} onClick={() => insertText('| Header | Header |\n| --- | --- |\n| Cell | Cell |')} />
                                <ToolbarButton icon={Minus} onClick={() => insertText('\n---\n')} />
                            </div>

                            {/* Textarea */}
                            <textarea
                                ref={editorRef}
                                className="flex-1 w-full p-5 font-mono text-sm resize-none focus:outline-none leading-relaxed bg-white"
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onScroll={handleEditorScroll}
                                onPaste={handlePaste}
                                placeholder={t('posts.editor.placeholder.content')}
                                spellCheck={false}
                            />

                            {/* Status bar */}
                            <div className="px-4 py-1.5 border-t bg-gray-50/80 flex items-center gap-4 text-[11px] text-gray-400">
                                <span className="flex items-center gap-1"><Type size={11} />{wordStats.words} {lang === 'zh' ? '词' : 'words'}</span>
                                <span className="flex items-center gap-1"><Hash size={11} />{wordStats.chars} {lang === 'zh' ? '字符' : 'chars'}</span>
                                <span className="flex items-center gap-1"><Clock size={11} />~{wordStats.readMin} min</span>
                                <span className="ml-auto opacity-60">Ctrl+S {lang === 'zh' ? '保存' : 'save'}</span>
                            </div>
                        </div>
                    )}

                    {/* Preview */}
                    {(viewMode === 'preview' || viewMode === 'split') && (
                        <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
                            <div className="px-4 py-2 border-b bg-gray-50/80 text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Eye size={13} />
                                {t('posts.editor.preview')}
                            </div>
                            <div ref={previewRef} className="flex-1 overflow-auto p-6 editor-preview">
                                {content ? (
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeHighlight]}
                                    >
                                        {content}
                                    </ReactMarkdown>
                                ) : (
                                    <p className="text-gray-300 text-center py-16 text-sm">{lang === 'zh' ? '开始输入以预览...' : 'Start typing to preview...'}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Metadata Panel */}
                {showSidebar && (
                    <div className="w-72 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-auto flex-shrink-0">
                        <div className="p-4 space-y-1">
                            {/* Basic Info */}
                            <SidebarSection
                                title={lang === 'zh' ? '基本信息' : 'Basic Info'}
                                open={sidebarSections.basic}
                                onToggle={() => setSidebarSections(s => ({ ...s, basic: !s.basic }))}
                            >
                                <SidebarField label="Slug" icon={FileText}>
                                    <input
                                        type="text"
                                        className="sidebar-input"
                                        value={slugName}
                                        onChange={e => setSlugName(e.target.value)}
                                        disabled={slug !== 'new'}
                                        placeholder="post-slug"
                                    />
                                </SidebarField>
                                <SidebarField label={lang === 'zh' ? '日期' : 'Date'} icon={Calendar}>
                                    <input
                                        type="date"
                                        className="sidebar-input"
                                        value={metadata.published ? new Date(metadata.published).toISOString().split('T')[0] : ''}
                                        onChange={e => setMetadata({ ...metadata, published: e.target.value })}
                                    />
                                </SidebarField>
                                <SidebarField label={lang === 'zh' ? '分类' : 'Category'} icon={Folder}>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            list="category-options"
                                            className="sidebar-input"
                                            value={metadata.category || ''}
                                            onChange={e => setMetadata({ ...metadata, category: e.target.value })}
                                            placeholder={t('posts.editor.placeholder.category')}
                                        />
                                        <datalist id="category-options">
                                            {existingCategories.map(c => <option key={c} value={c} />)}
                                        </datalist>
                                    </div>
                                </SidebarField>
                                <SidebarField label={lang === 'zh' ? '标签' : 'Tags'} icon={Tag}>
                                    <TagInput 
                                        value={metadata.tags} 
                                        onChange={tagsArr => setMetadata({ ...metadata, tags: tagsArr.join(', ') })} 
                                        options={existingTags} 
                                        placeholder={t('posts.editor.placeholder.tags')} 
                                    />
                                </SidebarField>
                            </SidebarSection>

                            {/* SEO */}
                            <SidebarSection
                                title="SEO"
                                open={sidebarSections.seo}
                                onToggle={() => setSidebarSections(s => ({ ...s, seo: !s.seo }))}
                            >
                                <SidebarField label={lang === 'zh' ? '描述' : 'Description'} icon={AlignLeft}>
                                    <textarea
                                        className="sidebar-input min-h-[60px] resize-none"
                                        value={metadata.description || ''}
                                        onChange={e => setMetadata({ ...metadata, description: e.target.value })}
                                        placeholder={lang === 'zh' ? '文章摘要...' : 'Post description...'}
                                        rows={2}
                                    />
                                    {metadata.description && (
                                        <p className="text-[10px] text-gray-400 mt-1">{metadata.description.length}/160</p>
                                    )}
                                </SidebarField>
                                <SidebarField label={lang === 'zh' ? '封面图' : 'Cover'} icon={FileImage}>
                                    <div className="flex gap-1.5">
                                        <input
                                            type="text"
                                            className="sidebar-input flex-1"
                                            value={metadata.image || ''}
                                            onChange={e => setMetadata({ ...metadata, image: e.target.value })}
                                            placeholder="./cover.jpg"
                                        />
                                        <button
                                            onClick={() => setShowMediaPicker(true)}
                                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
                                        >
                                            <ImageIcon size={14} />
                                        </button>
                                    </div>
                                </SidebarField>
                            </SidebarSection>

                            {/* Publish Options */}
                            <SidebarSection
                                title={lang === 'zh' ? '发布选项' : 'Publish'}
                                open={sidebarSections.publish}
                                onToggle={() => setSidebarSections(s => ({ ...s, publish: !s.publish }))}
                            >
                                <div className="space-y-2.5">
                                    <ToggleRow
                                        label={lang === 'zh' ? '草稿' : 'Draft'}
                                        checked={metadata.draft}
                                        onChange={v => setMetadata({ ...metadata, draft: v })}
                                        color="amber"
                                    />
                                    <ToggleRow
                                        label={lang === 'zh' ? '置顶' : 'Pinned'}
                                        checked={metadata.pinned}
                                        onChange={v => setMetadata({ ...metadata, pinned: v })}
                                        color="blue"
                                        icon={Pin}
                                    />
                                </div>
                            </SidebarSection>
                        </div>
                    </div>
                )}
            </div>

            {/* Media Picker Modal */}
            {showMediaPicker && (
                <MediaPicker
                    onSelect={handleMediaSelect}
                    onClose={() => setShowMediaPicker(false)}
                />
            )}

            {/* Inline styles for sidebar inputs */}
            <style>{`
                .sidebar-input {
                    width: 100%;
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 6px 10px;
                    font-size: 12px;
                    color: #374151;
                    outline: none;
                    transition: all 0.15s;
                }
                .sidebar-input:focus {
                    border-color: #6366f1;
                    box-shadow: 0 0 0 2px rgba(99,102,241,0.15);
                    background: white;
                }
                .sidebar-input:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
}

/* Sub-components */

function SidebarSection({ title, open, onToggle, children }) {
    return (
        <div className="border-b border-gray-100 last:border-0 pb-3 mb-1">
            <button
                onClick={onToggle}
                className="flex items-center justify-between w-full py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
            >
                <span>{title}</span>
                {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {open && <div className="space-y-3 mt-1">{children}</div>}
        </div>
    );
}

function SidebarField({ label, icon: Icon, children }) {
    return (
        <div>
            <label className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 mb-1">
                {Icon && <Icon size={12} className="text-gray-400" />}
                {label}
            </label>
            {children}
        </div>
    );
}

function ToggleRow({ label, checked, onChange, color = 'blue', icon: Icon }) {
    const colors = {
        blue: { bg: 'bg-blue-500', ring: 'ring-blue-200' },
        amber: { bg: 'bg-amber-500', ring: 'ring-amber-200' },
    };
    const c = colors[color] || colors.blue;

    return (
        <button
            onClick={() => onChange(!checked)}
            className="flex items-center justify-between w-full group"
        >
            <span className="flex items-center gap-1.5 text-xs text-gray-600">
                {Icon && <Icon size={13} className="text-gray-400" />}
                {label}
            </span>
            <div className={`w-9 h-5 rounded-full transition-all duration-200 relative ${checked ? c.bg : 'bg-gray-200'} ${checked ? `ring-2 ${c.ring}` : ''}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${checked ? 'left-[18px]' : 'left-0.5'}`} />
            </div>
        </button>
    );
}

function ToolbarButton({ icon: Icon, onClick, shortcut }) {
    return (
        <button
            onClick={onClick}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-150"
            title={shortcut || undefined}
        >
            <Icon size={15} />
        </button>
    );
}

function Sep() {
    return <div className="w-px h-4 bg-gray-200 mx-1" />;
}

function TagInput({ value, onChange, options, placeholder }) {
    const [inputVal, setInputVal] = React.useState('');
    const [showSuggestions, setShowSuggestions] = React.useState(false);

    const tags = Array.isArray(value) ? value : (typeof value === 'string' ? value.split(',').map(t=>t.trim()).filter(Boolean) : []);

    const handleAdd = (tag) => {
        const trimmed = tag.trim();
        if (trimmed && !tags.includes(trimmed)) {
            onChange([...tags, trimmed]);
        }
        setInputVal('');
        setShowSuggestions(false);
    };

    const handleRemove = (tagToRemove) => {
        onChange(tags.filter(t => t !== tagToRemove));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            if (inputVal) handleAdd(inputVal);
        } else if (e.key === 'Backspace' && !inputVal && tags.length > 0) {
            handleRemove(tags[tags.length - 1]);
        }
    };

    const suggestions = options.filter(o => o.toLowerCase().includes(inputVal.toLowerCase()) && !tags.includes(o));

    return (
        <div className="relative">
            <div className="flex flex-wrap gap-1.5 p-1.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/15 transition-all text-xs min-h-[34px]">
                {tags.map(t => (
                    <span key={t} className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md font-medium group">
                        {t}
                        <button onClick={() => handleRemove(t)} className="text-indigo-400 hover:text-indigo-800 focus:outline-none">
                            <X size={10} />
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    className="flex-1 min-w-[60px] bg-transparent outline-none text-gray-700 py-0.5 px-1"
                    placeholder={tags.length === 0 ? placeholder : ''}
                    value={inputVal}
                    onChange={e => {
                        setInputVal(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onKeyDown={handleKeyDown}
                />
            </div>
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {suggestions.map(s => (
                        <div
                            key={s}
                            className="px-3 py-2 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer transition-colors"
                            onMouseDown={(e) => { e.preventDefault(); handleAdd(s); }}
                        >
                            {s}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
