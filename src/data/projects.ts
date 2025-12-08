// Project data configuration file
// Auto-generated from JSON - Edit via admin dashboard
// Last updated: 2025-12-08T13:27:34.460Z

export interface Project {
	id: string;
	title: string;
	description: string;
	image: string;
	category: "web" | "mobile" | "desktop" | "other";
	techStack: string[];
	status: "completed" | "in-progress" | "planned";
	liveDemo?: string;
	sourceCode?: string;
	startDate: string;
	endDate?: string;
	featured?: boolean;
	tags?: string[];
	visitUrl?: string; // 添加前往项目链接字段
}

export const projectsData: Project[] = [
  {
    "id": "funbox",
    "title": "FUNBOX",
    "description": "funbox",
    "image": "",
    "category": "web",
    "techStack": [
      "Astro",
      "astro-theme"
    ],
    "status": "in-progress",
    "liveDemo": "https://mikufun.dpdns.org/",
    "sourceCode": "https://github.com/Roxy-DD/FUNBOX",
    "visitUrl": "",
    "startDate": "2024-05-21",
    "endDate": "2025-12-06",
    "featured": false,
    "tags": [
      "astro",
      "static-site",
      "blog-template"
    ]
  },
  {
    "id": "mizuki",
    "title": "Mizuki",
    "description": "下一代Material Design 3 博客主题(Astro驱动) (Forked from matsuzaka-yuki/Mizuki)",
    "image": "",
    "category": "web",
    "techStack": [
      "Astro",
      "TypeScript",
      "Svelte",
      "Tailwind CSS"
    ],
    "status": "completed",
    "liveDemo": "",
    "sourceCode": "https://github.com/Roxy-DD/Mizuki",
    "visitUrl": "",
    "startDate": "2025-11-24",
    "endDate": "2025-12-06",
    "featured": false,
    "tags": [
      "astro",
      "theme",
      "blog"
    ]
  },
  {
    "id": "proxy-cli",
    "title": "Proxy CLI",
    "description": "一个简单的命令行代理管理工具，用于快速切换本地 HTTP/HTTPS 代理。",
    "image": "",
    "category": "desktop",
    "techStack": [
      "Rust",
      "CLI"
    ],
    "status": "completed",
    "liveDemo": "",
    "sourceCode": "https://github.com/Roxy-DD/proxy-cli",
    "visitUrl": "",
    "startDate": "2025-12-03",
    "endDate": "2025-12-03",
    "featured": true,
    "tags": [
      "rust",
      "cli",
      "proxy",
      "tool"
    ]
  },
  {
    "id": "mizuki-blog-manager",
    "title": "Mizuki Blog Manager",
    "description": "Mizuka Blog Manager 是一个基于 Flask 的轻量级博客管理系统，专为 Mizuka 博客系统设计。它提供了直观的 Web 界面，让用户可以轻松创建、编辑和管理博客文章。",
    "image": "",
    "category": "web",
    "techStack": [
      "Python",
      "Flask",
      "Web"
    ],
    "status": "completed",
    "liveDemo": "",
    "sourceCode": "https://github.com/Roxy-DD/Mizuki-Blog-Manager",
    "visitUrl": "",
    "startDate": "2025-12-03",
    "endDate": "2025-12-03",
    "featured": false,
    "tags": [
      "python",
      "flask",
      "blog-management"
    ]
  },
  {
    "id": "0721",
    "title": "0721 Automation Server",
    "description": "基于Rust的Windows自动化工具服务器，提供丰富的系统交互能力，支持MCP协议。",
    "image": "",
    "category": "desktop",
    "techStack": [
      "Rust",
      "Windows",
      "Automation",
      "MCP"
    ],
    "status": "completed",
    "liveDemo": "",
    "sourceCode": "https://github.com/Roxy-DD/0721",
    "visitUrl": "",
    "startDate": "2025-12-02",
    "endDate": "2025-12-03",
    "featured": true,
    "tags": [
      "rust",
      "windows",
      "windows",
      "server"
    ]
  },
  {
    "id": "obsidian-git-sync",
    "title": "Obsidian Git Sync",
    "description": "一个为Obsidian设计的Git同步插件,可以帮助您轻松地将Obsidian笔记与Git仓库同步。",
    "image": "",
    "category": "web",
    "techStack": [],
    "status": "completed",
    "liveDemo": "",
    "sourceCode": "https://github.com/Roxy-DD/obsidian-git-sync",
    "visitUrl": "",
    "startDate": "2024-08-01",
    "endDate": "2024-08-21",
    "featured": false,
    "tags": [
      "obsidian",
      "plugin",
      "git",
      "sync"
    ]
  },
  {
    "id": "mapview",
    "title": "Mapview",
    "description": "一个streamlist的地图标点工具",
    "image": "",
    "category": "web",
    "techStack": [
      "Python"
    ],
    "status": "completed",
    "liveDemo": "",
    "sourceCode": "https://github.com/Roxy-DD/mapview",
    "visitUrl": "",
    "startDate": "",
    "endDate": "",
    "featured": false,
    "tags": [
      "Python",
      "streamlit",
      "map"
    ]
  },
  {
    "id": "bilibili2bangumi",
    "title": "Bilibili2Bangumi",
    "description": "一个将B站追番列表同步到Bangumi的工具",
    "image": "",
    "category": "desktop",
    "techStack": [
      "Python"
    ],
    "status": "completed",
    "liveDemo": "",
    "sourceCode": "https://github.com/Roxy-DD/Bilibili2Bangumi",
    "visitUrl": "",
    "startDate": "2024-08-01",
    "endDate": "2024-08-20",
    "featured": true,
    "tags": [
      "python",
      "bilibili",
      "bangumi",
      "sync"
    ]
  },
  {
    "id": "galremote",
    "title": "galremote",
    "description": "About\nGalRemote 是在原始 Sunshine 及 Sunshine 基地版基础上进行的深度定制版本，专为 Galgame 玩家 打造。不仅继承了基地版的所有优秀特性（HDR、虚拟显示器等），还集成了全新的 Galgame 管理功能和更加现代化的控制面板。",
    "image": "",
    "category": "desktop",
    "techStack": [
      "Rust",
      "Vue",
      "React",
      "Tauri"
    ],
    "status": "in-progress",
    "liveDemo": "",
    "sourceCode": "https://github.com/Roxy-DD/galremote",
    "visitUrl": "",
    "startDate": "2025-11-26",
    "endDate": "",
    "featured": true,
    "tags": [
      "Rust",
      "Vue",
      "React",
      "Tauri"
    ]
  },
  {
    "id": "galremote-control-panel",
    "title": "galremote-control-panel",
    "description": "基于 Tauri 2.8.4 的 Galremote 控制面板 GUI。",
    "image": "",
    "category": "web",
    "techStack": [
      "Rust",
      "Vue",
      "Tauri"
    ],
    "status": "in-progress",
    "liveDemo": "",
    "sourceCode": "https://github.com/Roxy-DD/galremote-control-panel",
    "visitUrl": "",
    "startDate": "2025-11-29",
    "endDate": "",
    "featured": false,
    "tags": [
      "Rust",
      "Vue",
      "Tauri"
    ]
  }
];

// Get project statistics
export const getProjectStats = () => {
	const total = projectsData.length;
	const completed = projectsData.filter((p) => p.status === "completed").length;
	const inProgress = projectsData.filter(
		(p) => p.status === "in-progress",
	).length;
	const planned = projectsData.filter((p) => p.status === "planned").length;

	return {
		total,
		byStatus: {
			completed,
			inProgress,
			planned,
		},
	};
};

// Get projects by category
export const getProjectsByCategory = (category?: string) => {
	if (!category || category === "all") {
		return projectsData;
	}
	return projectsData.filter((p) => p.category === category);
};

// Get featured projects
export const getFeaturedProjects = () => {
	return projectsData.filter((p) => p.featured);
};

// Get all tech stacks
export const getAllTechStack = () => {
	const techSet = new Set<string>();
	projectsData.forEach((project) => {
		project.techStack.forEach((tech) => {
			techSet.add(tech);
		});
	});
	return Array.from(techSet).sort();
};

















