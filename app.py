import os
import streamlit as st
from pathlib import Path
import yaml
from datetime import date, datetime
import json
import shutil
import subprocess
import webbrowser

# ======================================================
# YAML 配置（移到类外部）
# ======================================================
class NoAliasDumper(yaml.SafeDumper):
    def ignore_aliases(self, data):
        return True

def no_quoted_str_representer(dumper, data):
    if isinstance(data, str):
        try:
            date.fromisoformat(data)
            return dumper.represent_scalar("tag:yaml.org,2002:timestamp", data)
        except:
            return dumper.represent_scalar("tag:yaml.org,2002:str", data)
    return dumper.represent_scalar("tag:yaml.org,2002:str", data)

yaml.add_representer(str, no_quoted_str_representer, Dumper=NoAliasDumper)

# ======================================================
# 页面配置和样式
# ======================================================
st.set_page_config(
    page_title="Mizuka Blog Manager",
    page_icon="📝",
    layout="wide",
    initial_sidebar_state="expanded"
)

# 自定义CSS样式
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        font-weight: 700;
        color: #1f77b4;
        margin-bottom: 1rem;
    }
    .sub-header {
        font-size: 1.5rem;
        font-weight: 600;
        color: #2e86ab;
        margin-top: 1.5rem;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #e0e0e0;
    }
    .required-field::after {
        content: " *";
        color: #ff4b4b;
    }
    .field-hint {
        font-size: 0.85rem;
        color: #666;
        font-style: italic;
        margin-top: -0.5rem;
        margin-bottom: 0.5rem;
    }
    .success-box {
        padding: 1rem;
        border-radius: 0.5rem;
        background-color: #d4edda;
        border: 1px solid #c3e6cb;
        color: #155724;
    }
    .warning-box {
        padding: 1rem;
        border-radius: 0.5rem;
        background-color: #fff3cd;
        border: 1px solid #ffeaa7;
        color: #856404;
    }
    .info-box {
        padding: 1rem;
        border-radius: 0.5rem;
        background-color: #d1ecf1;
        border: 1px solid #bee5eb;
        color: #0c5460;
    }
    .tag-chip {
        display: inline-block;
        background-color: #e0e0e0;
        padding: 0.2rem 0.6rem;
        margin: 0.2rem;
        border-radius: 1rem;
        font-size: 0.85rem;
    }
</style>
""", unsafe_allow_html=True)

# ======================================================
# 标签和分类管理器
# ======================================================
class TaxonomyManager:
    def __init__(self, config_file):
        self.config_file = config_file
    
    def scan_posts_taxonomy(self, posts_dir):
        """从所有文章中扫描标签和分类"""
        if not os.path.exists(posts_dir):
            return set(), set()
        
        all_tags = set()
        all_categories = set()
        
        for post_dir in os.listdir(posts_dir):
            post_path = os.path.join(posts_dir, post_dir)
            if os.path.isdir(post_path):
                file_path = os.path.join(post_path, "index.md")
                if os.path.exists(file_path):
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            content = f.read()
                        if content.startswith("---"):
                            parts = content.split("---", 2)
                            if len(parts) >= 3:
                                frontmatter = yaml.safe_load(parts[1]) or {}
                                # 同步标签
                                if "tags" in frontmatter and isinstance(frontmatter["tags"], list):
                                    for tag in frontmatter["tags"]:
                                        if tag and tag.strip():
                                            all_tags.add(tag.strip())
                                # 同步分类
                                if "category" in frontmatter and frontmatter["category"]:
                                    category = frontmatter["category"].strip()
                                    if category:
                                        all_categories.add(category)
                    except Exception as e:
                        continue
        
        return all_tags, all_categories
    
    def load_taxonomy(self, posts_dir):
        """加载标签和分类数据（从文章同步）"""
        tags, categories = self.scan_posts_taxonomy(posts_dir)
        
        # 如果有缓存文件，合并用户手动添加但尚未使用的标签分类
        if self.config_file.exists():
            try:
                with open(self.config_file, "r", encoding="utf-8") as f:
                    cached_data = json.load(f)
                    # 合并缓存的标签和分类（但以实际文章中的为准）
                    cached_tags = set(cached_data.get("tags", []))
                    cached_categories = set(cached_data.get("categories", []))
                    
                    # 只保留那些不在当前文章中的缓存项（用户手动添加但尚未使用的）
                    extra_tags = cached_tags - tags
                    extra_categories = cached_categories - categories
                    
                    tags.update(extra_tags)
                    categories.update(extra_categories)
            except Exception:
                # 如果缓存文件损坏，忽略它
                pass
        
        return sorted(list(tags)), sorted(list(categories))
    
    def save_taxonomy(self, tags, categories):
        """保存标签和分类数据到缓存"""
        try:
            data = {
                "tags": sorted(list(tags)),
                "categories": sorted(list(categories))
            }
            with open(self.config_file, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            st.error(f"保存标签分类数据失败: {e}")
            return False
    
    def add_new_taxonomy(self, posts_dir, new_tags=None, new_categories=None):
        """添加新的标签和分类到缓存"""
        if new_tags is None:
            new_tags = []
        if new_categories is None:
            new_categories = []
        
        # 先获取当前的文章标签分类
        current_tags, current_categories = self.scan_posts_taxonomy(posts_dir)
        
        # 添加新的标签分类
        for tag in new_tags:
            if tag and tag.strip():
                current_tags.add(tag.strip())
        
        for category in new_categories:
            if category and category.strip():
                current_categories.add(category.strip())
        
        # 保存到缓存
        return self.save_taxonomy(current_tags, current_categories)

# ======================================================
# 博客管理工具
# ======================================================
class MizukaBlogManager:
    def __init__(self):
        self.config_file = Path(__file__).parent / "mizuka_blog_config.json"
        self.taxonomy_manager = TaxonomyManager(Path(__file__).parent / "mizuka_taxonomy.json")
    
    def load_config(self):
        """加载配置"""
        if self.config_file.exists():
            try:
                with open(self.config_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                st.error(f"配置加载失败: {e}")
                return {}
        return {}
    
    def save_config(self, config):
        """保存配置"""
        try:
            with open(self.config_file, "w", encoding="utf-8") as f:
                json.dump(config, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            st.error(f"配置保存失败: {e}")
            return False
    
    def parse_frontmatter(self, file_path):
        """解析frontmatter"""
        if not os.path.exists(file_path):
            return {}, ""
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            if content.startswith("---"):
                parts = content.split("---", 2)
                if len(parts) >= 3:
                    frontmatter = yaml.safe_load(parts[1]) or {}
                    body = parts[2].strip()
                    return frontmatter, body
            return {}, content
        except Exception as e:
            st.error(f"文件解析失败: {e}")
            return {}, ""
    
    def save_frontmatter(self, file_path, frontmatter, body):
        """保存frontmatter和内容"""
        try:
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, "w", encoding="utf-8") as f:
                f.write("---\n")
                yaml.dump(frontmatter, f, allow_unicode=True, sort_keys=False, Dumper=NoAliasDumper)
                f.write("---\n\n")
                f.write(body)
            return True
        except Exception as e:
            st.error(f"文件保存失败: {e}")
            return False
    
    def list_posts(self, posts_dir):
        """获取文章列表"""
        try:
            if not os.path.exists(posts_dir):
                return []
            dirs = [d for d in os.listdir(posts_dir) 
                   if os.path.isdir(os.path.join(posts_dir, d)) and 
                   os.path.exists(os.path.join(posts_dir, d, "index.md"))]
            return sorted(dirs)
        except Exception as e:
            st.error(f"获取文章列表失败: {e}")
            return []
    
    def open_directory(self, path):
        """打开目录"""
        try:
            path = Path(path)
            if not path.exists():
                st.error("路径不存在")
                return False
                
            if os.name == 'nt':  # Windows
                os.startfile(str(path))
            elif os.name == 'posix':  # macOS, Linux
                subprocess.run(['open', str(path)] if os.uname().sysname == 'Darwin' else ['xdg-open', str(path)])
            return True
        except Exception as e:
            st.error(f"打开目录失败: {e}")
            return False
    
    def validate_folder_name(self, name):
        """验证文件夹名称"""
        if not name or not name.strip():
            return False, "文件夹名不能为空"
        if any(c in name for c in '/\\?%*:|"<>'):
            return False, "文件夹名包含非法字符"
        if len(name) > 100:
            return False, "文件夹名过长（最多100个字符）"
        return True, ""

    def generate_folder_name(self, title):
        """根据标题生成文件夹名"""
        import re
        # 移除特殊字符，替换空格为连字符
        name = re.sub(r'[^\w\s-]', '', title.strip())
        name = re.sub(r'[-\s]+', '-', name)
        return name.lower()
    
    def get_taxonomy(self, posts_dir):
        """获取标签和分类列表（从文章同步）"""
        return self.taxonomy_manager.load_taxonomy(posts_dir)

# ======================================================
# 初始化
# ======================================================
manager = MizukaBlogManager()
config = manager.load_config()

# ======================================================
# 侧边栏 - 路径配置
# ======================================================
with st.sidebar:
    st.markdown('<div class="sub-header">⚙️ 博客配置</div>', unsafe_allow_html=True)
    
    # 默认路径 - 根据Mizuka结构
    default_posts_dir = Path(__file__).parent / "src" / "content" / "posts"
    default_posts_dir.mkdir(parents=True, exist_ok=True)
    
    # 路径配置
    if "posts_dir" not in st.session_state:
        st.session_state["posts_dir"] = config.get("posts_dir", str(default_posts_dir))
    
    posts_dir_input = st.text_input(
        "博客文章目录",
        value=st.session_state["posts_dir"],
        help="Mizuka博客的posts目录路径 (src/content/posts)"
    )
    
    col1, col2 = st.columns(2)
    with col1:
        if st.button("✅ 应用路径", use_container_width=True):
            if os.path.isdir(posts_dir_input):
                st.session_state["posts_dir"] = posts_dir_input
                config["posts_dir"] = posts_dir_input
                if manager.save_config(config):
                    st.success("路径应用成功!")
            else:
                st.warning("路径不存在，将自动创建")
                os.makedirs(posts_dir_input, exist_ok=True)
                st.session_state["posts_dir"] = posts_dir_input
                config["posts_dir"] = posts_dir_input
                if manager.save_config(config):
                    st.success("路径创建并应用成功!")
    
    with col2:
        if st.button("📁 打开目录", use_container_width=True):
            if manager.open_directory(st.session_state["posts_dir"]):
                st.success("目录已打开!")
    
    st.markdown("---")
    
    # 统计信息
    posts_dir = st.session_state["posts_dir"]
    post_dirs = manager.list_posts(posts_dir)
    total_posts = len(post_dirs)
    draft_posts = 0
    pinned_posts = 0
    
    # 获取标签分类统计
    tags, categories = manager.get_taxonomy(posts_dir)
    
    # 统计草稿和置顶文章
    for post_dir in post_dirs:
        file_path = os.path.join(posts_dir, post_dir, "index.md")
        data, _ = manager.parse_frontmatter(file_path)
        if data.get('draft'):
            draft_posts += 1
        if data.get('pinned'):
            pinned_posts += 1
    
    st.markdown("**📊 统计信息**")
    st.markdown(f"- 总文章数: **{total_posts}**")
    st.markdown(f"- 草稿文章: **{draft_posts}**")
    st.markdown(f"- 置顶文章: **{pinned_posts}**")
    st.markdown(f"- 标签数量: **{len(tags)}**")
    st.markdown(f"- 分类数量: **{len(categories)}**")
    
    # 快速操作
    st.markdown("---")
    st.markdown("**⚡ 快速操作**")
    if st.button("🔄 刷新数据", use_container_width=True):
        st.rerun()

# ======================================================
# 主界面
# ======================================================
st.markdown('<div class="main-header">📘 Mizuka 博客管理系统</div>', unsafe_allow_html=True)
st.caption("专为Mizuka博客系统设计的文章管理工具 - 支持文件夹方案的文章管理")

# 显示当前路径信息
current_posts_dir = st.session_state["posts_dir"]
st.info(f"📁 当前文章目录: `{current_posts_dir}`")

# 获取标签和分类列表（每次都会从文章同步）
all_tags, all_categories = manager.get_taxonomy(current_posts_dir)

# 标签页布局
tab1, tab2, tab3, tab4 = st.tabs(["📝 创建/编辑文章", "🔍 文章管理", "⚡ 批量操作", "🏷️ 标签分类管理"])

with tab1:
    st.markdown('<div class="sub-header">文章创建与编辑</div>', unsafe_allow_html=True)
    
    # 操作模式选择
    col1, col2 = st.columns([2, 1])
    with col1:
        search_query = st.text_input(
            "🔍 搜索文章", 
            placeholder="输入关键字搜索文章标题或文件夹名...",
            help="支持模糊搜索，不区分大小写"
        ).strip().lower()
    
    with col2:
        post_action = st.radio(
            "操作模式",
            ["创建新文章", "编辑现有文章"],
            horizontal=True
        )
    
    # 文章选择（编辑模式）
    selected_post = None
    data, body = {}, ""
    
    if post_action == "编辑现有文章":
        if search_query:
            filtered_posts = [p for p in post_dirs if search_query in p.lower()]
        else:
            filtered_posts = post_dirs
        
        if filtered_posts:
            selected_post = st.selectbox("选择要编辑的文章", filtered_posts)
            if selected_post:
                post_dir_path = os.path.join(posts_dir, selected_post)
                file_path = os.path.join(post_dir_path, "index.md")
                data, body = manager.parse_frontmatter(file_path)
                
                # 显示当前文章信息
                col_info1, col_info2, col_info3 = st.columns(3)
                with col_info1:
                    st.metric("文件夹名", selected_post)
                with col_info2:
                    status = "📝 草稿" if data.get('draft') else "✅ 已发布"
                    st.metric("状态", status)
                with col_info3:
                    if st.button("📂 打开文章目录", use_container_width=True):
                        manager.open_directory(post_dir_path)
        else:
            st.warning("没有找到符合条件的文章")
            post_action = "创建新文章"
    
    # 文章编辑表单
    with st.form("article_form", clear_on_submit=False):
        st.markdown("### 基本信息")
        
        col1, col2 = st.columns([3, 1])
        
        with col1:
            title = st.text_input(
                "文章标题",
                value=data.get("title", ""),
                placeholder="输入文章标题",
                help="这是文章的显示标题"
            )
            st.markdown('<div class="field-hint">必需字段 - 标题将用于SEO和页面显示</div>', unsafe_allow_html=True)
            
            description = st.text_area(
                "文章描述",
                value=data.get("description", ""),
                placeholder="输入文章简短描述",
                height=80,
                help="用于SEO和文章摘要显示"
            )
            st.markdown('<div class="field-hint">必需字段 - 建议50-160字符以获得最佳SEO效果</div>', unsafe_allow_html=True)
        
        with col2:
            # 自动生成文件夹名
            folder_name = st.text_input(
                "文件夹名",
                value=selected_post if selected_post else manager.generate_folder_name(title) if title else "",
                placeholder="自动生成或手动输入",
                help="文章文件夹名称，用于URL路径"
            )
            if title and not folder_name and not selected_post:
                folder_name = manager.generate_folder_name(title)
                st.text_input("生成的文件夹名", value=folder_name, key="generated_folder")
            
            # 文件夹名验证
            if folder_name:
                is_valid, validation_msg = manager.validate_folder_name(folder_name)
                if not is_valid:
                    st.error(f"文件夹名无效: {validation_msg}")
                else:
                    # 检查是否已存在
                    target_dir = os.path.join(posts_dir, folder_name)
                    if os.path.exists(target_dir) and (not selected_post or folder_name != selected_post):
                        st.warning(f"⚠️ 文件夹 '{folder_name}' 已存在")
        
        st.markdown("### 内容分类")
        col_cat1, col_cat2 = st.columns(2)
        
        with col_cat1:
            # 标签选择
            tags_from_data = data.get("tags", [])
            tags_selected = st.multiselect(
                "文章标签",
                options=all_tags,
                default=tags_from_data,
                help="选择文章标签"
            )
            
            # 新建标签（不直接保存，只在表单提交时处理）
            new_tag = st.text_input("输入新标签", placeholder="输入新标签名称")
            if new_tag.strip() and new_tag not in tags_selected:
                tags_selected.append(new_tag.strip())
        
        with col_cat2:
            # 分类选择
            category_from_data = data.get("category", "")
            category_selected = st.selectbox(
                "文章分类",
                options=[""] + all_categories,
                index=0 if not category_from_data else (all_categories.index(category_from_data) + 1 if category_from_data in all_categories else 0)
            )
            
            # 新建分类（不直接保存，只在表单提交时处理）
            new_category = st.text_input("输入新分类", placeholder="输入新分类名称")
            if new_category.strip():
                category_selected = new_category.strip()
        
        st.markdown("### 发布设置")
        col_pub1, col_pub2, col_pub3 = st.columns(3)
        
        with col_pub1:
            # 日期设置
            published_value = data.get("published", data.get("pubDate", data.get("date", date.today())))
            try:
                if isinstance(published_value, str):
                    published_value = date.fromisoformat(published_value)
            except:
                published_value = date.today()
            
            published = st.date_input(
                "发布日期",
                value=published_value,
                help="文章发布的日期"
            )
        
        with col_pub2:
            # 状态设置
            draft = st.checkbox(
                "草稿状态",
                value=bool(data.get("draft", False)),
                help="勾选表示文章为草稿，不会在正式环境中显示"
            )
            
            pinned = st.checkbox(
                "置顶文章",
                value=bool(data.get("pinned", False)),
                help="勾选表示文章将置顶显示"
            )
        
        with col_pub3:
            # 作者信息
            author = st.text_input(
                "作者",
                value=data.get("author", ""),
                placeholder="文章作者姓名"
            )
            
            license_name = st.text_input(
                "许可证",
                value=data.get("licenseName", ""),
                placeholder="如: MIT, CC BY 4.0"
            )
        
        st.markdown("### 其他信息")
        col_other1, col_other2 = st.columns(2)
        
        with col_other1:
            source_link = st.text_input(
                "源链接",
                value=data.get("sourceLink", ""),
                placeholder="如: https://github.com/username/repo"
            )
        
        with col_other2:
            # 图片设置
            image_url = st.text_input(
                "封面图片URL",
                value=data.get("image", {}).get("url", ""),
                placeholder="./cover.jpg 或完整URL"
            )
            image_alt = st.text_input(
                "封面图片描述",
                value=data.get("image", {}).get("alt", ""),
                placeholder="图片的替代文本"
            )
        
        st.markdown("### 文章内容")
        body = st.text_area(
            "Markdown正文",
            value=body,
            height=400,
            placeholder="# 标题\n\n您的文章内容...\n\n支持标准的Markdown语法",
            help="使用Markdown格式编写文章内容，支持代码块、表格、图片等"
        )
        
        # 表单提交按钮
        submitted = st.form_submit_button(
            "💾 保存文章" if selected_post else "🚀 创建文章",
            use_container_width=True
        )
        
        if submitted:
            # 验证必需字段
            if not all([title.strip(), description.strip(), folder_name.strip()]):
                st.error("❌ 请填写标题、描述和文件夹名等必需字段")
            else:
                # 处理新标签和分类
                new_tags_to_add = []
                new_categories_to_add = []
                
                # 检查新标签
                for tag in tags_selected:
                    if tag not in all_tags:
                        new_tags_to_add.append(tag)
                
                # 检查新分类
                if category_selected and category_selected not in all_categories:
                    new_categories_to_add.append(category_selected)
                
                # 保存新标签分类到缓存
                if new_tags_to_add or new_categories_to_add:
                    manager.taxonomy_manager.add_new_taxonomy(posts_dir, new_tags_to_add, new_categories_to_add)
                
                # 构建frontmatter - 按照Mizuka规范
                frontmatter = {
                    "title": title.strip(),
                    "description": description.strip(),
                }
                
                # 分类信息
                if tags_selected:
                    frontmatter["tags"] = tags_selected
                if category_selected:
                    frontmatter["category"] = category_selected
                
                # 发布信息
                frontmatter["published"] = str(published)
                frontmatter["pubDate"] = str(published)
                frontmatter["date"] = str(published)
                frontmatter["draft"] = draft
                
                # 可选字段
                if pinned:
                    frontmatter["pinned"] = True
                if author:
                    frontmatter["author"] = author
                if license_name:
                    frontmatter["licenseName"] = license_name
                if source_link:
                    frontmatter["sourceLink"] = source_link
                if image_url or image_alt:
                    frontmatter["image"] = {
                        "url": image_url,
                        "alt": image_alt
                    }
                
                # 确定保存路径
                if post_action == "创建新文章":
                    post_dir_path = os.path.join(posts_dir, folder_name.strip())
                    if os.path.exists(post_dir_path):
                        st.error(f"❌ 文件夹 '{folder_name}' 已存在，请使用不同的文件夹名")
                    else:
                        file_path = os.path.join(post_dir_path, "index.md")
                        if manager.save_frontmatter(file_path, frontmatter, body):
                            st.success(f"✅ 文章创建成功: {folder_name}")
                            st.balloons()
                else:
                    # 编辑现有文章
                    if folder_name != selected_post:
                        # 需要重命名文件夹
                        old_dir = os.path.join(posts_dir, selected_post)
                        new_dir = os.path.join(posts_dir, folder_name.strip())
                        if os.path.exists(new_dir):
                            st.error(f"❌ 目标文件夹 '{folder_name}' 已存在")
                        else:
                            os.rename(old_dir, new_dir)
                            file_path = os.path.join(new_dir, "index.md")
                    else:
                        file_path = os.path.join(posts_dir, selected_post, "index.md")
                    
                    if manager.save_frontmatter(file_path, frontmatter, body):
                        st.success(f"✅ 文章更新成功: {folder_name}")

with tab2:
    st.markdown('<div class="sub-header">文章管理</div>', unsafe_allow_html=True)
    
    if not post_dirs:
        st.info("📭 暂无文章，请在「创建/编辑文章」标签中创建新文章")
    else:
        # 搜索和筛选
        col_search, col_filter, col_sort = st.columns([2, 1, 1])
        with col_search:
            manage_search = st.text_input("搜索文章", placeholder="输入标题、标签或分类...", key="manage_search")
        
        with col_filter:
            filter_options = ["全部文章", "仅草稿", "仅发布", "仅置顶"]
            filter_choice = st.selectbox("筛选", filter_options, key="filter_choice")
        
        with col_sort:
            sort_options = ["按名称", "按日期(新到旧)", "按日期(旧到新)"]
            sort_choice = st.selectbox("排序", sort_options, key="sort_choice")
        
        # 过滤和排序文章
        filtered_posts = []
        for post_dir in post_dirs:
            file_path = os.path.join(posts_dir, post_dir, "index.md")
            data, _ = manager.parse_frontmatter(file_path)
            
            # 搜索过滤
            if manage_search:
                search_lower = manage_search.lower()
                matches = (
                    search_lower in data.get('title', '').lower() or
                    search_lower in data.get('description', '').lower() or
                    search_lower in ' '.join(data.get('tags', [])).lower() or
                    search_lower in data.get('category', '').lower() or
                    search_lower in post_dir.lower()
                )
                if not matches:
                    continue
            
            # 状态过滤
            if filter_choice == "仅草稿" and not data.get('draft'):
                continue
            if filter_choice == "仅发布" and data.get('draft'):
                continue
            if filter_choice == "仅置顶" and not data.get('pinned'):
                continue
            
            filtered_posts.append((post_dir, data))
        
        # 排序
        if sort_choice == "按日期(新到旧)":
            filtered_posts.sort(key=lambda x: x[1].get('published', ''), reverse=True)
        elif sort_choice == "按日期(旧到新)":
            filtered_posts.sort(key=lambda x: x[1].get('published', ''))
        else:
            filtered_posts.sort(key=lambda x: x[0])
        
        # 显示文章列表
        st.markdown(f"**找到 {len(filtered_posts)} 篇文章**")
        
        for post_dir, data in filtered_posts:
            post_path = os.path.join(posts_dir, post_dir)
            
            with st.expander(f"📄 {data.get('title', post_dir)}", expanded=False):
                col_info, col_actions = st.columns([3, 1])
                
                with col_info:
                    # 基本信息
                    st.write(f"**描述:** {data.get('description', '无描述')}")
                    st.write(f"**文件夹:** `{post_dir}`")
                    
                    col_meta1, col_meta2 = st.columns(2)
                    with col_meta1:
                        st.write(f"**分类:** {data.get('category', '未分类')}")
                        st.write(f"**日期:** {data.get('published', '未知')}")
                    with col_meta2:
                        st.write(f"**作者:** {data.get('author', '未设置')}")
                        st.write(f"**标签:** {', '.join(data.get('tags', [])) or '无标签'}")
                    
                    # 状态标签
                    col_status1, col_status2, col_status3 = st.columns(3)
                    with col_status1:
                        if data.get('draft'):
                            st.warning("📋 草稿")
                        else:
                            st.success("✅ 已发布")
                    with col_status2:
                        if data.get('pinned'):
                            st.info("📌 置顶")
                    with col_status3:
                        if data.get('image', {}).get('url'):
                            st.caption("🖼️ 有封面")
                
                with col_actions:
                    if st.button("📂 打开目录", key=f"open_{post_dir}", use_container_width=True):
                        if manager.open_directory(post_path):
                            st.success("目录已打开!")
                    
                    if st.button("✏️ 编辑", key=f"edit_{post_dir}", use_container_width=True):
                        st.session_state.edit_post = post_dir
                        st.rerun()
                    
                    if st.button("🗑️ 删除", key=f"delete_{post_dir}", use_container_width=True):
                        st.session_state.delete_post = post_dir
        
        # 处理删除操作
        if hasattr(st.session_state, 'delete_post'):
            post_to_delete = st.session_state.delete_post
            st.warning(f"⚠️ 确认删除文章: **{post_to_delete}**?")
            col_confirm1, col_confirm2 = st.columns(2)
            with col_confirm1:
                if st.button("✅ 确认删除", use_container_width=True, key="confirm_delete"):
                    try:
                        shutil.rmtree(os.path.join(posts_dir, post_to_delete))
                        st.success(f"✅ 已删除文章: {post_to_delete}")
                        del st.session_state.delete_post
                        st.rerun()
                    except Exception as e:
                        st.error(f"删除失败: {e}")
            with col_confirm2:
                if st.button("❌ 取消", use_container_width=True, key="cancel_delete"):
                    del st.session_state.delete_post
                    st.rerun()

with tab3:
    st.markdown('<div class="sub-header">批量操作</div>', unsafe_allow_html=True)
    
    if not post_dirs:
        st.info("📭 暂无文章可进行批量操作")
    else:
        st.warning("⚠️ 批量操作不可撤销，请谨慎操作！")
        
        # 批量选择
        selected_posts = st.multiselect(
            "选择要操作的文章",
            post_dirs,
            help="可多选文章进行批量操作"
        )
        
        if selected_posts:
            st.success(f"已选择 {len(selected_posts)} 篇文章")
            
            # 批量操作选项
            operation = st.radio(
                "选择批量操作类型",
                ["批量状态管理", "批量重命名", "批量删除"],
                horizontal=True
            )
            
            if operation == "批量状态管理":
                st.markdown("### 批量状态管理")
                col_status1, col_status2 = st.columns(2)
                
                with col_status1:
                    if st.button("🚀 批量发布", use_container_width=True, key="batch_publish"):
                        success_count = 0
                        for post in selected_posts:
                            file_path = os.path.join(posts_dir, post, "index.md")
                            data, body = manager.parse_frontmatter(file_path)
                            data["draft"] = False
                            if manager.save_frontmatter(file_path, data, body):
                                success_count += 1
                        st.success(f"✅ 已发布 {success_count} 篇文章")
                        st.rerun()
                
                with col_status2:
                    if st.button("📝 批量转为草稿", use_container_width=True, key="batch_draft"):
                        success_count = 0
                        for post in selected_posts:
                            file_path = os.path.join(posts_dir, post, "index.md")
                            data, body = manager.parse_frontmatter(file_path)
                            data["draft"] = True
                            if manager.save_frontmatter(file_path, data, body):
                                success_count += 1
                        st.success(f"✅ 已将 {success_count} 篇文章转为草稿")
                        st.rerun()
                
                col_status3, col_status4 = st.columns(2)
                with col_status3:
                    if st.button("📌 批量置顶", use_container_width=True, key="batch_pin"):
                        success_count = 0
                        for post in selected_posts:
                            file_path = os.path.join(posts_dir, post, "index.md")
                            data, body = manager.parse_frontmatter(file_path)
                            data["pinned"] = True
                            if manager.save_frontmatter(file_path, data, body):
                                success_count += 1
                        st.success(f"✅ 已置顶 {success_count} 篇文章")
                        st.rerun()
                
                with col_status4:
                    if st.button("🔓 批量取消置顶", use_container_width=True, key="batch_unpin"):
                        success_count = 0
                        for post in selected_posts:
                            file_path = os.path.join(posts_dir, post, "index.md")
                            data, body = manager.parse_frontmatter(file_path)
                            data["pinned"] = False
                            if manager.save_frontmatter(file_path, data, body):
                                success_count += 1
                        st.success(f"✅ 已取消置顶 {success_count} 篇文章")
                        st.rerun()
            
            elif operation == "批量重命名":
                st.markdown("### 批量重命名")
                st.info("💡 批量重命名基于当前标题自动生成文件夹名")
                
                rename_plan = []
                for post in selected_posts:
                    file_path = os.path.join(posts_dir, post, "index.md")
                    data, _ = manager.parse_frontmatter(file_path)
                    new_name = manager.generate_folder_name(data.get('title', post))
                    rename_plan.append((post, new_name))
                
                # 显示重命名计划
                st.markdown("**重命名计划:**")
                for old_name, new_name in rename_plan:
                    col_rename1, col_rename2, col_rename3 = st.columns([3, 2, 1])
                    with col_rename1:
                        st.write(f"`{old_name}`")
                    with col_rename2:
                        st.write(f"→ `{new_name}`")
                    with col_rename3:
                        if old_name == new_name:
                            st.caption("无变化")
                        elif os.path.exists(os.path.join(posts_dir, new_name)):
                            st.error("冲突")
                        else:
                            st.success("可执行")
                
                if st.button("✏️ 执行批量重命名", use_container_width=True, key="execute_rename"):
                    success_count = 0
                    for old_name, new_name in rename_plan:
                        if old_name != new_name and new_name.strip():
                            try:
                                old_path = os.path.join(posts_dir, old_name)
                                new_path = os.path.join(posts_dir, new_name)
                                if not os.path.exists(new_path):
                                    os.rename(old_path, new_path)
                                    success_count += 1
                            except Exception as e:
                                st.error(f"重命名失败 {old_name}: {e}")
                    st.success(f"✅ 成功重命名 {success_count} 篇文章")
                    st.rerun()
            
            elif operation == "批量删除":
                st.markdown("### 批量删除")
                st.error("🚨 危险操作！这将永久删除选中的文章及其所有内容")
                
                # 显示将要删除的文章
                st.markdown("**将要删除的文章:**")
                for post in selected_posts:
                    st.write(f"- {post}")
                
                # 确认删除
                confirm_text = st.text_input(
                    "请输入 'DELETE' 确认删除操作",
                    placeholder="输入 DELETE 确认",
                    help="这是一个安全确认步骤",
                    key="batch_delete_confirm"
                )
                
                if st.button("🗑️ 执行批量删除", use_container_width=True, 
                           disabled=confirm_text != "DELETE", key="execute_batch_delete"):
                    if confirm_text == "DELETE":
                        success_count = 0
                        for post in selected_posts:
                            try:
                                shutil.rmtree(os.path.join(posts_dir, post))
                                success_count += 1
                            except Exception as e:
                                st.error(f"删除失败 {post}: {e}")
                        st.success(f"✅ 已删除 {success_count} 篇文章")
                        st.rerun()
                    else:
                        st.error("请输入 'DELETE' 确认删除操作")

        else:
            st.info("👆 请先选择要操作的文章")

with tab4:
    st.markdown('<div class="sub-header">标签和分类管理</div>', unsafe_allow_html=True)
    
    col_stats1, col_stats2 = st.columns(2)
    with col_stats1:
        st.metric("标签数量", len(all_tags))
        # 显示标签列表
        st.markdown("**所有标签:**")
        if all_tags:
            tag_cols = st.columns(3)
            for i, tag in enumerate(all_tags):
                with tag_cols[i % 3]:
                    st.markdown(f'<div class="tag-chip">{tag}</div>', unsafe_allow_html=True)
        else:
            st.info("暂无标签")
    
    with col_stats2:
        st.metric("分类数量", len(all_categories))
        # 显示分类列表
        st.markdown("**所有分类:**")
        if all_categories:
            for category in all_categories:
                st.write(f"- {category}")
        else:
            st.info("暂无分类")
    
    st.markdown("---")
    
    # 手动添加标签分类
    st.markdown("### 手动添加标签或分类")
    col_add1, col_add2 = st.columns(2)
    
    with col_add1:
        st.markdown("**添加新标签**")
        new_tag_input = st.text_input("新标签名称", key="new_tag_manual")
        if st.button("➕ 添加标签", key="add_tag_manual"):
            if new_tag_input.strip():
                if manager.taxonomy_manager.add_new_taxonomy(posts_dir, new_tags=[new_tag_input.strip()]):
                    st.success(f"✅ 标签 '{new_tag_input}' 已添加到缓存")
                    st.rerun()
            else:
                st.error("请输入标签名称")
    
    with col_add2:
        st.markdown("**添加新分类**")
        new_category_input = st.text_input("新分类名称", key="new_category_manual")
        if st.button("➕ 添加分类", key="add_category_manual"):
            if new_category_input.strip():
                if manager.taxonomy_manager.add_new_taxonomy(posts_dir, new_categories=[new_category_input.strip()]):
                    st.success(f"✅ 分类 '{new_category_input}' 已添加到缓存")
                    st.rerun()
            else:
                st.error("请输入分类名称")
    
    st.markdown("---")
    
    # 重新同步按钮
    st.markdown("### 数据同步")
    st.info("标签和分类数据会自动从所有文章中同步。如果需要强制重新同步，请点击以下按钮：")
    
    if st.button("🔄 重新同步标签分类数据", use_container_width=True):
        # 强制重新扫描所有文章
        tags, categories = manager.taxonomy_manager.scan_posts_taxonomy(posts_dir)
        manager.taxonomy_manager.save_taxonomy(tags, categories)
        st.success("✅ 标签分类数据已重新同步")
        st.rerun()

# ======================================================
# 页脚
# ======================================================
st.markdown("---")
st.caption("Mizuka Blog Manager © 2024 - 专为Mizuka博客系统设计的专业内容管理工具")

# 处理编辑跳转
if hasattr(st.session_state, 'edit_post'):
    st.session_state.post_action = "编辑现有文章"
    st.session_state.search_query = st.session_state.edit_post
    del st.session_state.edit_post
    st.rerun()