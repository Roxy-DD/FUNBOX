// Project data configuration file
// Used to manage data for the project display page

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

/*
export const skills: Skill[] = [
  {
    name: '技能名称',
    category: 'frontend', // 技能分类
    level: 90, // 技能等级 (0-100)
    icon: 'skill-icons:javascript', // 图标名称
    description: '技能描述',
    experience: '3年', // 经验时长
    projects: ['project-1', 'project-2'], // 相关项目ID
    certifications: [ // 可选：相关认证
      {
        name: '认证名称',
        issuer: '颁发机构',
        date: '2023-01-01',
        url: 'https://certification-url.com'
      }
    ]
  }
];
*/

export const projectsData: Project[] = [
	{
		id: "0721",
		title: "0721",
		description:
			"基于Rust的Windows自动化工具服务器，提供丰富的系统交互能力，支持MCP协议。",
		image: "",
		category: "desktop",
		techStack: ["Rust", "PowerShell", "MCP Protocol"],
		status: "completed",
		liveDemo: "",
		sourceCode: "https://github.com/Roxy-DD/0721", // 更改为GitHub链接
		visitUrl: "", // 添加前往项目链接
		startDate: "2025-10-22",
		endDate: "",
		featured: true,
		tags: ["Rust", "MCP", "AI"],
	},
	{
		id: "Bilibili2Bangumi",
		title: "Bilibili2Bangumi",
		description:
			"一个将B站追番列表同步到Bangumi的工具",
		image: "",
		category: "desktop",
		techStack: ["Python", "Bangumi API", "Bilibili API"],
		status: "completed",
		liveDemo: "",
		sourceCode: "https://github.com/Roxy-DD/Bilibili2Bangumi",
		visitUrl: "", // 添加前往项目链接
		startDate: "2025-04-11",
		endDate: "",
		featured: true,
		tags: ["Python", "Animation"],
	},
	{
		id: "obsidian-git-sync",
		title: "obsidian-git-sync",
		description:
			"一个为Obsidian设计的Git同步插件,可以帮助您轻松地将Obsidian笔记与Git仓库同步。",
		image: "",
		category: "desktop",
		techStack: ["TypeScript", "Obsidian API", "Git", "Node.js"],
		status: "completed",
		sourceCode: "https://github.com/Roxy-DD/obsidian-git-sync",
		startDate: "2022-1-24",
		tags: ["Obsidian", "Git", "Plugin", "TypeScript", "Node.js"],
	},
	{
		id: "mapview",
		title: "mapview",
		description:
			"一个streamlist的地图标点工具",
		image: "",
		category: "web",
		techStack: ["Python", "Streamlit"],
		status: "completed",
		liveDemo: "",
		sourceCode: "https://github.com/Roxy-DD/mapview",
		visitUrl: "", // 添加前往项目链接
		startDate: "2022-01-24",
		endDate: "",
		tags: ["Python", "Streamlit", "Map", "Data Visualization"],
	},
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
