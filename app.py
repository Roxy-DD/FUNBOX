import os
from pathlib import Path
import streamlit as st
import yaml
from datetime import date
import json
import shutil

# ======================================================
# 配置文件，用于记忆 posts 文件夹、标签、分类
# ======================================================
config_file = Path(__file__).parent / "config.json"

def load_config():
    if config_file.exists():
        try:
            with open(config_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_config(config):
    with open(config_file, "w", encoding="utf-8") as f:
        json.dump(config, f, ensure_ascii=False, indent=2)

config = load_config()

# ======================================================
# YAML 输出配置，防止日期加引号
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
# frontmatter 解析与保存
# ======================================================
def parse_frontmatter(file_path):
    if not os.path.exists(file_path):
        return {}, ""
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    if content.startswith("---"):
        parts = content.split("---", 2)
        if len(parts) >= 3:
            frontmatter = yaml.safe_load(parts[1]) or {}
            body = parts[2].strip()
            return frontmatter, body
    return {}, content

def save_frontmatter(file_path, frontmatter, body):
    with open(file_path, "w", encoding="utf-8") as f:
        f.write("---\n")
        yaml.dump(frontmatter, f, allow_unicode=True, sort_keys=False, Dumper=NoAliasDumper)
        f.write("---\n\n")
        f.write(body)

# ======================================================
# Streamlit 页面配置
# ======================================================
st.set_page_config(page_title="Mizuka Blog 管理工具", layout="wide")
st.title("📘 Mizuka 博客文章管理工具")
st.caption("手动输入 posts 文件夹路径，可记忆上次选择")

# ---------- 默认 posts 文件夹路径 ----------
default_posts_dir = Path(__file__).parent / "src" / "content" / "posts"
default_posts_dir.mkdir(parents=True, exist_ok=True)

if "posts_dir" not in st.session_state:
    st.session_state["posts_dir"] = config.get("posts_dir", str(default_posts_dir))

# ---------- 手动输入 posts 路径 ----------
input_path = st.text_input("posts 文件夹路径", st.session_state["posts_dir"])
if st.button("✅ 应用路径"):
    if os.path.isdir(input_path):
        st.session_state["posts_dir"] = input_path
        config["posts_dir"] = input_path
        save_config(config)
        st.success(f"已应用并记忆路径：{input_path}")
    else:
        st.warning("路径不存在，将自动创建")
        os.makedirs(input_path, exist_ok=True)
        st.session_state["posts_dir"] = input_path
        config["posts_dir"] = input_path
        save_config(config)

posts_dir = st.session_state["posts_dir"]

# ---------- 初始化刷新计数 ----------
if "refresh_counter" not in st.session_state:
    st.session_state["refresh_counter"] = 0
_ = st.session_state["refresh_counter"]

# ======================================================
# 读取文章列表
# ======================================================
def list_posts():
    dirs = [d for d in os.listdir(posts_dir) if os.path.isdir(os.path.join(posts_dir, d))]
    return sorted(dirs)

post_dirs = list_posts()

# ======================================================
# 文章搜索/过滤功能
# ======================================================
st.subheader("🔍 文章搜索/过滤")
search_query = st.text_input("输入关键字搜索文章（标题/文件夹名）").strip().lower()
if search_query:
    filtered_posts = [p for p in post_dirs if search_query in p.lower()]
else:
    filtered_posts = post_dirs

selected_post = st.selectbox(
    "选择文章文件夹（搜索过滤后）", 
    ["🆕 创建新文章"] + filtered_posts
)

data = {}
body = ""
if selected_post != "🆕 创建新文章":
    post_dir = os.path.join(posts_dir, selected_post)
    file_path = os.path.join(post_dir, "index.md")
    data, body = parse_frontmatter(file_path)

# ======================================================
# 标签和分类管理
# ======================================================
existing_tags = sorted(list(set(config.get("existing_tags", ["Rust", "Python", "Markdown", "Web"]))))
existing_categories = sorted(list(set(config.get("existing_categories", ["Rust笔记", "Python笔记", "教程", "示例"]))))

# 确保默认值存在于 options
tags_from_data = data.get("tags", [])
for t in tags_from_data:
    if t not in existing_tags:
        existing_tags.append(t)
existing_tags = sorted(existing_tags)

category_from_data = data.get("category")
if category_from_data and category_from_data not in existing_categories:
    existing_categories.append(category_from_data)
existing_categories = sorted(existing_categories)

st.subheader("📝 Frontmatter 编辑")
with st.form("frontmatter_form"):
    title = st.text_input("标题（title）*", value=data.get("title", ""))
    description = st.text_area("描述（description）*", value=data.get("description", ""))
    
    tags_selected = st.multiselect(
        "标签（tags）* 可选择或创建新标签",
        options=existing_tags,
        default=tags_from_data
    )
    new_tag = st.text_input("添加新标签")
    if new_tag.strip():
        tags_selected.append(new_tag.strip())
        tags_selected = sorted(list(set(tags_selected)))
        if new_tag.strip() not in existing_tags:
            existing_tags.append(new_tag.strip())
            existing_tags = sorted(list(set(existing_tags)))
            config["existing_tags"] = existing_tags
            save_config(config)
    
    category_selected = st.selectbox(
        "分类（category）* 可选择或新建",
        options=existing_categories,
        index=existing_categories.index(category_from_data) if category_from_data in existing_categories else 0
    )
    new_category = st.text_input("添加新分类")
    if new_category.strip():
        category_selected = new_category.strip()
        if new_category.strip() not in existing_categories:
            existing_categories.append(new_category.strip())
            existing_categories = sorted(list(set(existing_categories)))
            config["existing_categories"] = existing_categories
            save_config(config)
    
    draft = st.checkbox("是否为草稿（draft）", value=bool(data.get("draft", False)))
    
    published_value = str(data.get("published", date.today()))
    try:
        published_value = date.fromisoformat(published_value)
    except:
        published_value = date.today()
    published = st.date_input("发布日期（published）*", value=published_value)
    
    pinned = st.checkbox("是否置顶（pinned）", value=bool(data.get("pinned", False)))
    author = st.text_input("作者（author）", value=data.get("author", ""))
    license_name = st.text_input("许可证（licenseName）", value=data.get("licenseName", ""))
    source_link = st.text_input("源链接（sourceLink）", value=data.get("sourceLink", ""))
    image_url = st.text_input("封面图片 URL", value=data.get("image", {}).get("url", ""))
    image_alt = st.text_input("封面图片描述", value=data.get("image", {}).get("alt", ""))

    st.subheader("📄 正文内容")
    body = st.text_area("Markdown 正文内容", value=body, height=300)

    # ---------- 预览 Markdown ----------
    frontmatter_preview = {
        "title": title.strip(),
        "description": description.strip(),
        "tags": tags_selected,
        "category": category_selected,
        "draft": draft,
        "published": str(published),
    }
    if pinned:
        frontmatter_preview["pinned"] = True
    if author:
        frontmatter_preview["author"] = author
    if license_name:
        frontmatter_preview["licenseName"] = license_name
    if source_link:
        frontmatter_preview["sourceLink"] = source_link
    if image_url or image_alt:
        frontmatter_preview["image"] = {"url": image_url, "alt": image_alt}

    preview_md = "---\n"
    preview_md += yaml.dump(frontmatter_preview, allow_unicode=True, sort_keys=False, Dumper=NoAliasDumper)
    preview_md += "---\n\n"
    preview_md += body

    st.subheader("👀 保存前 Markdown 预览")
    with st.expander("展开/折叠预览"):
        st.code(preview_md, language="markdown")

    # ---------- 表单提交按钮 ----------
    submitted = st.form_submit_button("💾 保存文章")

# ---------- 保存逻辑 ----------
if submitted:
    if not title.strip() or not description.strip() or not tags_selected or not category_selected.strip():
        st.error("❌ 请填写所有必填字段！")
    else:
        if selected_post == "🆕 创建新文章":
            folder_name = title.strip().replace(" ", "-")
            post_dir = os.path.join(posts_dir, folder_name)
            os.makedirs(post_dir, exist_ok=True)
        file_path = os.path.join(post_dir, "index.md")
        save_frontmatter(file_path, frontmatter_preview, body)
        st.success(f"✅ 文章已保存：{file_path}")
        st.session_state["refresh_counter"] += 1

# ======================================================
# 批量管理文章
# ======================================================
st.subheader("🗂️ 批量管理文章")
if post_dirs:
    selected_posts_for_batch = st.multiselect("选择文章进行批量操作", post_dirs)
    col1, col2 = st.columns(2)
    with col1:
        if st.button("🗑 删除选中文章"):
            for p in selected_posts_for_batch:
                shutil.rmtree(os.path.join(posts_dir, p))
            st.success("✅ 删除完成")
            st.session_state["refresh_counter"] += 1
    with col2:
        rename_map = {}
        for p in selected_posts_for_batch:
            new_name = st.text_input(f"重命名 {p} 为", value=p)
            rename_map[p] = new_name
        if st.button("✏️ 批量重命名"):
            for old, new in rename_map.items():
                if old != new and new:
                    os.rename(os.path.join(posts_dir, old), os.path.join(posts_dir, new))
            st.success("✅ 批量重命名完成")
            st.session_state["refresh_counter"] += 1
