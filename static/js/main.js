// 全局变量
let selectedPosts = new Set();
let currentPreviewMode = false;

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化工具提示
    initTooltips();
    
    // 初始化表单验证
    initFormValidation();
    
    // 初始化文章选择功能
    initPostSelection();
    
    // 初始化标签管理
    initTagManagement();
    
    // 初始化预览功能
    initPreviewToggle();
    
    // 初始化自动保存
    initAutoSave();
    
    // 初始化移动端菜单
    initMobileMenu();
});

// 初始化Bootstrap工具提示
function initTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// 初始化表单验证
function initFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });
}

// 初始化文章选择功能
function initPostSelection() {
    // 全选/取消全选
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const postCheckboxes = document.querySelectorAll('.post-checkbox');
            postCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
                const postId = checkbox.getAttribute('data-post-id');
                if (this.checked) {
                    selectedPosts.add(postId);
                    document.querySelector(`[data-post-card="${postId}"]`).classList.add('selected');
                } else {
                    selectedPosts.delete(postId);
                    document.querySelector(`[data-post-card="${postId}"]`).classList.remove('selected');
                }
            });
            updateBatchOperationButtons();
        });
    }
    
    // 单个文章选择
    const postCheckboxes = document.querySelectorAll('.post-checkbox');
    postCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const postId = this.getAttribute('data-post-id');
            if (this.checked) {
                selectedPosts.add(postId);
                document.querySelector(`[data-post-card="${postId}"]`).classList.add('selected');
            } else {
                selectedPosts.delete(postId);
                document.querySelector(`[data-post-card="${postId}"]`).classList.remove('selected');
            }
            updateBatchOperationButtons();
        });
    });
}

// 更新批量操作按钮状态
function updateBatchOperationButtons() {
    const batchOperationButtons = document.querySelectorAll('.batch-operation-btn');
    const hasSelection = selectedPosts.size > 0;
    
    batchOperationButtons.forEach(button => {
        button.disabled = !hasSelection;
    });
    
    // 更新选择计数
    const selectionCount = document.getElementById('selectionCount');
    if (selectionCount) {
        selectionCount.textContent = selectedPosts.size;
    }
}

// 初始化标签管理
function initTagManagement() {
    // 添加标签
    const addTagBtn = document.getElementById('addTagBtn');
    if (addTagBtn) {
        addTagBtn.addEventListener('click', function() {
            const tagInput = document.getElementById('tagInput');
            if (tagInput.value.trim()) {
                addTag(tagInput.value.trim());
                tagInput.value = '';
            }
        });
        
        // 回车添加标签
        tagInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTagBtn.click();
            }
        });
    }
    
    // 标签删除
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-tag')) {
            const tagElement = e.target.closest('.tag');
            if (tagElement) {
                tagElement.remove();
                updateTagInput();
            }
        }
    });
}

// 添加标签
function addTag(tagText) {
    const tagsContainer = document.getElementById('tagsContainer');
    const tagInput = document.getElementById('tagInput');
    
    if (!tagsContainer || !tagInput) return;
    
    // 检查标签是否已存在
    const existingTags = Array.from(tagsContainer.querySelectorAll('.tag-text')).map(el => el.textContent.trim());
    if (existingTags.includes(tagText)) {
        showToast('标签已存在', 'warning');
        return;
    }
    
    // 创建标签元素
    const tagElement = document.createElement('div');
    tagElement.className = 'tag';
    tagElement.innerHTML = `
        <span class="tag-text">${tagText}</span>
        <span class="remove-tag">&times;</span>
    `;
    
    tagsContainer.appendChild(tagElement);
    updateTagInput();
}

// 更新标签输入框的值
function updateTagInput() {
    const tagsContainer = document.getElementById('tagsContainer');
    const tagInput = document.getElementById('tagInput');
    
    if (!tagsContainer || !tagInput) return;
    
    const tags = Array.from(tagsContainer.querySelectorAll('.tag-text')).map(el => el.textContent.trim());
    tagInput.value = tags.join(', ');
}

// 初始化预览功能
function initPreviewToggle() {
    const previewToggle = document.getElementById('previewToggle');
    const contentEditor = document.getElementById('contentEditor');
    const contentPreview = document.getElementById('contentPreview');
    
    if (!previewToggle || !contentEditor || !contentPreview) return;
    
    previewToggle.addEventListener('click', function() {
        currentPreviewMode = !currentPreviewMode;
        
        if (currentPreviewMode) {
            // 切换到预览模式
            contentEditor.style.display = 'none';
            contentPreview.style.display = 'block';
            previewToggle.innerHTML = '<i class="bi bi-pencil-square"></i> 编辑';
            previewToggle.classList.remove('btn-outline-secondary');
            previewToggle.classList.add('btn-primary');
            
            // 更新预览内容
            updatePreview();
        } else {
            // 切换到编辑模式
            contentEditor.style.display = 'block';
            contentPreview.style.display = 'none';
            previewToggle.innerHTML = '<i class="bi bi-eye"></i> 预览';
            previewToggle.classList.remove('btn-primary');
            previewToggle.classList.add('btn-outline-secondary');
        }
    });
    
    // 编辑器内容变化时自动更新预览
    if (contentEditor) {
        contentEditor.addEventListener('input', debounce(function() {
            if (currentPreviewMode) {
                updatePreview();
            }
        }, 300));
    }
}

// 更新预览内容
function updatePreview() {
    const contentEditor = document.getElementById('contentEditor');
    const contentPreview = document.getElementById('contentPreview');
    
    if (!contentEditor || !contentPreview) return;
    
    // 简单的Markdown到HTML转换
    let markdownText = contentEditor.value;
    let htmlContent = markdownToHtml(markdownText);
    
    contentPreview.innerHTML = htmlContent;
}

// 简单的Markdown到HTML转换
function markdownToHtml(markdown) {
    // 转换标题
    markdown = markdown.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    markdown = markdown.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    markdown = markdown.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // 转换粗体和斜体
    markdown = markdown.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    markdown = markdown.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // 转换代码块
    markdown = markdown.replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>');
    markdown = markdown.replace(/`(.+?)`/g, '<code>$1</code>');
    
    // 转换链接
    markdown = markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // 转换图片
    markdown = markdown.replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
    
    // 转换引用
    markdown = markdown.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
    
    // 转换段落
    markdown = markdown.replace(/\n\n/g, '</p><p>');
    markdown = '<p>' + markdown + '</p>';
    
    // 转换换行
    markdown = markdown.replace(/\n/g, '<br>');
    
    return markdown;
}

// 初始化自动保存
function initAutoSave() {
    const contentEditor = document.getElementById('contentEditor');
    const titleInput = document.getElementById('titleInput');
    
    if (!contentEditor || !titleInput) return;
    
    let autoSaveTimer;
    
    function saveDraft() {
        const title = titleInput.value;
        const content = contentEditor.value;
        
        // 保存到localStorage
        localStorage.setItem('draftTitle', title);
        localStorage.setItem('draftContent', content);
        
        // 显示保存提示
        showToast('草稿已自动保存', 'success');
    }
    
    // 监听内容变化
    [contentEditor, titleInput].forEach(element => {
        element.addEventListener('input', function() {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(saveDraft, 2000); // 2秒后自动保存
        });
    });
    
    // 页面加载时恢复草稿
    window.addEventListener('load', function() {
        const savedTitle = localStorage.getItem('draftTitle');
        const savedContent = localStorage.getItem('draftContent');
        
        if (savedTitle && !titleInput.value) {
            titleInput.value = savedTitle;
        }
        
        if (savedContent && !contentEditor.value) {
            contentEditor.value = savedContent;
        }
    });
}

// 初始化移动端菜单
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (!mobileMenuToggle || !sidebar) return;
    
    mobileMenuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('show');
    });
    
    // 点击主内容区域时关闭侧边栏
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        mainContent.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('show');
            }
        });
    }
}

// 显示提示消息
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    
    // 创建toast元素
    const toastElement = document.createElement('div');
    toastElement.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'danger' ? 'danger' : type === 'warning' ? 'warning' : 'info'} border-0`;
    toastElement.setAttribute('role', 'alert');
    toastElement.setAttribute('aria-live', 'assertive');
    toastElement.setAttribute('aria-atomic', 'true');
    
    toastElement.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    toastContainer.appendChild(toastElement);
    
    // 初始化并显示toast
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 3000
    });
    
    toast.show();
    
    // 监听隐藏事件，移除元素
    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    });
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// 从标题生成文件夹名
function generateFolderName(title) {
    if (!title) return '';
    
    // 移除特殊字符，替换空格为连字符
    let folderName = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // 移除特殊字符
        .replace(/\s+/g, '-') // 空格替换为连字符
        .replace(/-+/g, '-') // 多个连字符合并为一个
        .trim();
    
    // 限制长度
    if (folderName.length > 50) {
        folderName = folderName.substring(0, 50);
    }
    
    return folderName;
}

// 自动生成文件夹名
function autoGenerateFolderName() {
    const titleInput = document.getElementById('titleInput');
    const folderNameInput = document.getElementById('folderNameInput');
    
    if (!titleInput || !folderNameInput) return;
    
    titleInput.addEventListener('input', function() {
        // 只有当文件夹名为空或者是自动生成的时候才更新
        if (!folderNameInput.value || folderNameInput.dataset.autoGenerated === 'true') {
            folderNameInput.value = generateFolderName(this.value);
            folderNameInput.dataset.autoGenerated = 'true';
        }
    });
    
    // 手动编辑文件夹名时，标记为非自动生成
    folderNameInput.addEventListener('input', function() {
        this.dataset.autoGenerated = 'false';
    });
}

// 确认删除操作
function confirmDelete(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// 格式化日期时间
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 初始化页面时调用自动生成文件夹名
document.addEventListener('DOMContentLoaded', function() {
    autoGenerateFolderName();
});