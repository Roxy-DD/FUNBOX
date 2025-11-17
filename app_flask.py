from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from pathlib import Path
import os
import yaml
from datetime import date, datetime
import json
import shutil
import subprocess
import webbrowser

# 创建Flask应用
app = Flask(__name__)
app.secret_key = 'mizuka_blog_manager_secret_key'  # 用于flash消息

# ======================================================
# YAML 配置
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
            print(f"保存标签分类数据失败: {e}")
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
                print(f"配置加载失败: {e}")
                return {}
        return {}
    
    def save_config(self, config):
        """保存配置"""
        try:
            with open(self.config_file, "w", encoding="utf-8") as f:
                json.dump(config, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            print(f"配置保存失败: {e}")
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
            print(f"文件解析失败: {e}")
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
            print(f"文件保存失败: {e}")
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
            print(f"获取文章列表失败: {e}")
            return []
    
    def open_directory(self, path):
        """打开目录"""
        try:
            path = Path(path)
            if not path.exists():
                return False
                
            if os.name == 'nt':  # Windows
                os.startfile(str(path))
            elif os.name == 'posix':  # macOS, Linux
                subprocess.run(['open', str(path)] if os.uname().sysname == 'Darwin' else ['xdg-open', str(path)])
            return True
        except Exception as e:
            print(f"打开目录失败: {e}")
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

# 初始化管理器
manager = MizukaBlogManager()

# 获取默认路径
def get_posts_dir():
    config = manager.load_config()
    default_posts_dir = Path(__file__).parent / "src" / "content" / "posts"
    default_posts_dir.mkdir(parents=True, exist_ok=True)
    return config.get("posts_dir", str(default_posts_dir))

# 获取文章列表
def get_post_list(posts_dir):
    return manager.list_posts(posts_dir)

# 获取标签和分类
def get_tags_and_categories(posts_dir):
    return manager.get_taxonomy(posts_dir)

# 获取文章数据
def get_post_data(posts_dir, post_name):
    file_path = os.path.join(posts_dir, post_name, "index.md")
    return manager.parse_frontmatter(file_path)

# 保存文章
def save_post(posts_dir, post_name, frontmatter, body):
    file_path = os.path.join(posts_dir, post_name, "index.md")
    return manager.save_frontmatter(file_path, frontmatter, body)

# 删除文章
def delete_post(posts_dir, post_name):
    try:
        shutil.rmtree(os.path.join(posts_dir, post_name))
        return True
    except Exception as e:
        print(f"删除文章失败: {e}")
        return False

# 重命名文章文件夹
def rename_post(posts_dir, old_name, new_name):
    try:
        old_path = os.path.join(posts_dir, old_name)
        new_path = os.path.join(posts_dir, new_name)
        if os.path.exists(new_path):
            return False, "目标文件夹已存在"
        os.rename(old_path, new_path)
        return True, "重命名成功"
    except Exception as e:
        return False, f"重命名失败: {e}"

# 路由和视图函数
@app.route('/')
def index():
    """首页"""
    try:
        # 获取统计信息
        total_posts = len(blog_manager.posts)
        draft_posts = len([p for p in blog_manager.posts if p.draft])
        pinned_posts = len([p for p in blog_manager.posts if p.pinned])
        tags_count = len(taxonomy_manager.tags)
        
        # 获取最近文章
        recent_posts = sorted(blog_manager.posts, key=lambda x: x.date, reverse=True)[:5]
        
        return render_template(
            'index.html',
            total_posts=total_posts,
            draft_posts=draft_posts,
            pinned_posts=pinned_posts,
            tags_count=tags_count,
            recent_posts=recent_posts
        )
    except Exception as e:
        flash(f'加载首页时出错: {str(e)}', 'error')
        return render_template('index.html', 
                             total_posts=0, 
                             draft_posts=0, 
                             pinned_posts=0, 
                             tags_count=0, 
                             recent_posts=[])

@app.route('/create', methods=['GET', 'POST'])
def create_post():
    """创建新文章"""
    if request.method == 'POST':
        try:
            # 获取表单数据
            title = request.form.get('title', '').strip()
            folder_name = request.form.get('folder_name', '').strip()
            excerpt = request.form.get('excerpt', '').strip()
            category = request.form.get('category', '').strip()
            tags = [tag.strip() for tag in request.form.get('tags', '').split(',') if tag.strip()]
            author = request.form.get('author', '').strip()
            layout = request.form.get('layout', 'post')
            date = request.form.get('date', '')
            time = request.form.get('time', '')
            permalink = request.form.get('permalink', '').strip()
            content = request.form.get('content', '')
            draft = 'draft' in request.form
            pinned = 'pinned' in request.form
            
            # 验证必填字段
            if not title or not folder_name:
                flash('标题和文件夹名称是必填项', 'error')
                return render_template(
                    'edit_post.html',
                    post=None,
                    categories=taxonomy_manager.categories,
                    error='标题和文件夹名称是必填项'
                )
            
            # 创建文章
            blog_manager.create_post(
                title=title,
                folder_name=folder_name,
                content=content,
                excerpt=excerpt,
                category=category,
                tags=tags,
                author=author,
                layout=layout,
                date=date,
                time=time,
                permalink=permalink,
                draft=draft,
                pinned=pinned
            )
            
            flash('文章创建成功！', 'success')
            return redirect(url_for('manage_posts'))
            
        except Exception as e:
            flash(f'创建文章时出错: {str(e)}', 'error')
            return render_template(
                'edit_post.html',
                post=None,
                categories=taxonomy_manager.categories,
                error=str(e)
            )
    
    # GET请求，显示创建表单
    return render_template(
        'edit_post.html',
        post=None,
        categories=taxonomy_manager.categories
    )

@app.route('/edit/<post_id>', methods=['GET', 'POST'])
def edit_post(post_id):
    """编辑文章"""
    try:
        # 查找文章
        post = None
        for p in blog_manager.posts:
            if p.folder == post_id:
                post = p
                break
        
        if not post:
            flash(f'找不到文章: {post_id}', 'error')
            return redirect(url_for('manage_posts'))
        
        if request.method == 'POST':
            # 获取表单数据
            title = request.form.get('title', '').strip()
            folder_name = request.form.get('folder_name', '').strip()
            excerpt = request.form.get('excerpt', '').strip()
            category = request.form.get('category', '').strip()
            tags = [tag.strip() for tag in request.form.get('tags', '').split(',') if tag.strip()]
            author = request.form.get('author', '').strip()
            layout = request.form.get('layout', 'post')
            date = request.form.get('date', '')
            time = request.form.get('time', '')
            permalink = request.form.get('permalink', '').strip()
            content = request.form.get('content', '')
            draft = 'draft' in request.form
            pinned = 'pinned' in request.form
            
            # 验证必填字段
            if not title or not folder_name:
                flash('标题和文件夹名称是必填项', 'error')
                return render_template(
                    'edit_post.html',
                    post=post,
                    categories=taxonomy_manager.categories,
                    error='标题和文件夹名称是必填项'
                )
            
            # 更新文章
            blog_manager.update_post(
                post_id=post_id,
                title=title,
                folder_name=folder_name,
                content=content,
                excerpt=excerpt,
                category=category,
                tags=tags,
                author=author,
                layout=layout,
                date=date,
                time=time,
                permalink=permalink,
                draft=draft,
                pinned=pinned
            )
            
            flash('文章更新成功！', 'success')
            return redirect(url_for('manage_posts'))
        
        # GET请求，显示编辑表单
        return render_template(
            'edit_post.html',
            post=post,
            categories=taxonomy_manager.categories
        )
        
    except Exception as e:
        flash(f'编辑文章时出错: {str(e)}', 'error')
        return redirect(url_for('manage_posts'))

@app.route('/manage')
def manage_posts():
    """管理文章"""
    try:
        # 获取查询参数
        search_query = request.args.get('search', '').strip()
        category_filter = request.args.get('category', '').strip()
        status_filter = request.args.get('status', '').strip()
        sort_by = request.args.get('sort_by', 'date_desc')
        
        # 筛选文章
        filtered_posts = blog_manager.posts.copy()
        
        # 搜索筛选
        if search_query:
            search_query_lower = search_query.lower()
            filtered_posts = [p for p in filtered_posts 
                             if search_query_lower in p.title.lower() 
                             or search_query_lower in p.content.lower() 
                             or search_query_lower in p.folder.lower()]
        
        # 分类筛选
        if category_filter:
            filtered_posts = [p for p in filtered_posts if p.category == category_filter]
        
        # 状态筛选
        if status_filter == 'published':
            filtered_posts = [p for p in filtered_posts if not p.draft]
        elif status_filter == 'draft':
            filtered_posts = [p for p in filtered_posts if p.draft]
        elif status_filter == 'pinned':
            filtered_posts = [p for p in filtered_posts if p.pinned]
        
        # 排序
        if sort_by == 'date_desc':
            filtered_posts.sort(key=lambda x: x.date, reverse=True)
        elif sort_by == 'date_asc':
            filtered_posts.sort(key=lambda x: x.date)
        elif sort_by == 'title_asc':
            filtered_posts.sort(key=lambda x: x.title.lower())
        elif sort_by == 'title_desc':
            filtered_posts.sort(key=lambda x: x.title.lower(), reverse=True)
        
        return render_template(
            'manage_posts.html',
            posts=filtered_posts,
            categories=taxonomy_manager.categories,
            search_query=search_query,
            category_filter=category_filter,
            status_filter=status_filter,
            sort_by=sort_by
        )
        
    except Exception as e:
        flash(f'加载文章列表时出错: {str(e)}', 'error')
        return render_template(
            'manage_posts.html',
            posts=[],
            categories=taxonomy_manager.categories,
            search_query='',
            category_filter='',
            status_filter='',
            sort_by='date_desc',
            error=str(e)
        )

@app.route('/delete/<post_id>')
def delete_post(post_id):
    """删除文章"""
    try:
        blog_manager.delete_post(post_id)
        flash('文章删除成功！', 'success')
    except Exception as e:
        flash(f'删除文章时出错: {str(e)}', 'error')
    
    return redirect(url_for('manage_posts'))

@app.route('/batch', methods=['GET', 'POST'])
def batch_operations():
    """批量操作"""
    try:
        if request.method == 'POST':
            action = request.form.get('action', '')
            selected_posts = request.form.get('selected_posts', '').split(',')
            selected_posts = [p for p in selected_posts if p.strip()]
            
            if not selected_posts:
                flash('请选择至少一篇文章进行操作', 'error')
                return render_template(
                    'batch_operations.html',
                    posts=blog_manager.posts,
                    categories=taxonomy_manager.categories
                )
            
            # 执行批量操作
            if action == 'publish':
                blog_manager.batch_publish(selected_posts)
                flash(f'已发布 {len(selected_posts)} 篇文章', 'success')
            elif action == 'draft':
                blog_manager.batch_draft(selected_posts)
                flash(f'已将 {len(selected_posts)} 篇文章转为草稿', 'success')
            elif action == 'pin':
                blog_manager.batch_pin(selected_posts)
                flash(f'已置顶 {len(selected_posts)} 篇文章', 'success')
            elif action == 'unpin':
                blog_manager.batch_unpin(selected_posts)
                flash(f'已取消置顶 {len(selected_posts)} 篇文章', 'success')
            elif action == 'delete':
                blog_manager.batch_delete(selected_posts)
                flash(f'已删除 {len(selected_posts)} 篇文章', 'success')
            elif action == 'rename':
                pattern = request.form.get('rename_pattern', '')
                start = int(request.form.get('rename_start', 1))
                blog_manager.batch_rename(selected_posts, pattern, start)
                flash(f'已重命名 {len(selected_posts)} 篇文章', 'success')
            elif action == 'category':
                category = request.form.get('batch_category', '')
                blog_manager.batch_set_category(selected_posts, category)
                flash(f'已设置 {len(selected_posts)} 篇文章的分类', 'success')
            elif action == 'tags':
                tags = [tag.strip() for tag in request.form.get('batch_tags', '').split(',') if tag.strip()]
                replace = request.form.get('replace_tags', 'false') == 'true'
                blog_manager.batch_add_tags(selected_posts, tags, replace)
                flash(f'已为 {len(selected_posts)} 篇文章添加标签', 'success')
            else:
                flash('未知操作', 'error')
            
            return redirect(url_for('batch_operations'))
        
        # GET请求，显示批量操作页面
        return render_template(
            'batch_operations.html',
            posts=blog_manager.posts,
            categories=taxonomy_manager.categories
        )
        
    except Exception as e:
        flash(f'执行批量操作时出错: {str(e)}', 'error')
        return render_template(
            'batch_operations.html',
            posts=blog_manager.posts,
            categories=taxonomy_manager.categories,
            error=str(e)
        )

@app.route('/taxonomy', methods=['GET', 'POST'])
def taxonomy_management():
    """标签和分类管理"""
    try:
        if request.method == 'POST':
            action = request.form.get('action', '')
            
            if action == 'add':
                # 添加新标签或分类
                new_tag = request.form.get('new_tag', '').strip()
                new_category = request.form.get('new_category', '').strip()
                
                if new_tag:
                    taxonomy_manager.add_tag(new_tag)
                    flash(f'已添加标签: {new_tag}', 'success')
                
                if new_category:
                    taxonomy_manager.add_category(new_category)
                    flash(f'已添加分类: {new_category}', 'success')
                
                if not new_tag and not new_category:
                    flash('请输入标签或分类名称', 'error')
            
            elif action == 'sync':
                # 重新同步数据
                taxonomy_manager.sync_from_posts(blog_manager.posts)
                flash('数据同步完成', 'success')
            
            elif action == 'delete_tag':
                # 删除标签
                tag = request.form.get('item', '')
                if tag:
                    taxonomy_manager.remove_tag(tag)
                    flash(f'已删除标签: {tag}', 'success')
            
            elif action == 'delete_category':
                # 删除分类
                category = request.form.get('item', '')
                if category:
                    taxonomy_manager.remove_category(category)
                    flash(f'已删除分类: {category}', 'success')
            
            return redirect(url_for('taxonomy_management'))
        
        # 获取统计信息
        total_tag_usage = sum(taxonomy_manager.tags.values())
        total_category_usage = sum(taxonomy_manager.categories.values())
        
        # GET请求，显示标签和分类管理页面
        return render_template(
            'taxonomy_management.html',
            tags=taxonomy_manager.tags,
            categories=taxonomy_manager.categories,
            total_tag_usage=total_tag_usage,
            total_category_usage=total_category_usage
        )
        
    except Exception as e:
        flash(f'管理标签和分类时出错: {str(e)}', 'error')
        return render_template(
            'taxonomy_management.html',
            tags={},
            categories={},
            total_tag_usage=0,
            total_category_usage=0,
            error=str(e)
        )

@app.route('/settings', methods=['GET', 'POST'])
def settings():
    """路径配置和系统设置"""
    try:
        if request.method == 'POST':
            # 获取表单数据
            posts_dir = request.form.get('posts_dir', '').strip()
            
            if posts_dir:
                # 更新文章目录
                app.config['POSTS_DIR'] = posts_dir
                blog_manager.posts_dir = posts_dir
                blog_manager.load_posts()
                taxonomy_manager.sync_from_posts(blog_manager.posts)
                flash('文章目录已更新', 'success')
            else:
                flash('请输入有效的目录路径', 'error')
            
            return redirect(url_for('settings'))
        
        # GET请求，显示设置页面
        return render_template(
            'settings.html',
            posts_dir=app.config.get('POSTS_DIR', ''),
            total_posts=len(blog_manager.posts),
            draft_posts=len([p for p in blog_manager.posts if p.draft]),
            pinned_posts=len([p for p in blog_manager.posts if p.pinned]),
            tags_count=len(taxonomy_manager.tags),
            categories_count=len(taxonomy_manager.categories)
        )
        
    except Exception as e:
        flash(f'加载设置页面时出错: {str(e)}', 'error')
        return render_template(
            'settings.html',
            posts_dir=app.config.get('POSTS_DIR', ''),
            total_posts=0,
            draft_posts=0,
            pinned_posts=0,
            tags_count=0,
            categories_count=0,
            error=str(e)
        )

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=9999)