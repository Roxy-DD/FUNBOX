// Timeline data configuration file
// Used to manage data for the timeline page

export interface TimelineItem {
	id: string;
	title: string;
	description: string;
	type: "education" | "work" | "project" | "achievement";
	startDate: string;
	endDate?: string; // If empty, it means current
	location?: string;
	organization?: string;
	position?: string;
	skills?: string[];
	achievements?: string[];
	links?: {
		name: string;
		url: string;
		type: "website" | "certificate" | "project" | "other";
	}[];
	icon?: string; // Iconify icon name
	color?: string;
	featured?: boolean;
}

/*
export const timelineEvents: TimelineEvent[] = [
  {
    id: 'event-1',
    title: '事件标题',
    description: '事件描述，支持 Markdown 格式',
    date: new Date('2023-01-01'),
    type: 'work', // 事件类型
    icon: 'mdi:briefcase', // 图标名称
    location: '地点', // 可选
    organization: '组织/公司', // 可选
    tags: ['标签1', '标签2'], // 可选
    links: [ // 可选：相关链接
      {
        title: '链接标题',
        url: 'https://example.com'
      }
    ],
    achievements: [ // 可选：成就列表
      '成就描述1',
      '成就描述2'
    ]
  }
];
*/

export const timelineData: TimelineItem[] = [
	{
		id: "edu-1",
		title: "计算机科学与技术本科",
		description:
		"信息工程学院 · 主修计算机科学、算法设计、网络与系统开发课程。",
		type: "education",
		organization: "西北工业大学明德学院",
		location: "西安",
		startDate: "2022-09",
		icon: "mdi:school-outline",
		color: "#4F46E5",
	},
	{
		id: "proj-1",
		title: "Obsidian Git Sync 插件",
		description:
		"为 Obsidian 笔记用户打造的全自动化 Git 同步解决方案。智能监测笔记变更，自动执行 commit、push、pull 操作，支持全平台与冲突可视化处理。",
		type: "project",
		organization: "GitHub 开源项目",
		position: "Node.js 开发工程师",
		skills: [
		"skill-icons:nodejs-dark",
		"skill-icons:javascript",
		"skill-icons:git",
		"skill-icons:obsidian",
		"skill-icons:linux-dark",
		],
		links: [
		{
			name: "GitHub 项目",
			url: "https://github.com/Roxy-DD/obsidian-git-sync", // 👉 建议补上真实链接
			type: "project",
		},
		],
		startDate: "2023-06",
		endDate: "2023-09",
		icon: "mdi:git",
		color: "#F59E0B",
	},
	{
		id: "proj-2",
		title: "Bilibili2Bangumi 同步工具",
		description:
		"打通 B 站与 Bangumi 的数据壁垒，实现追番记录、评分、进度的双向同步。支持全量迁移与增量同步，内置数据校验与可视化对比。",
		type: "project",
		organization: "GitHub 开源项目",
		position: "Python 开发工程师",
		skills: [
		"skill-icons:python-dark",
		"skill-icons:github-dark",
		"skill-icons:json",
		"skill-icons:api",
		],
		links: [
		{
			name: "GitHub 项目",
			url: "https://github.com/Roxy-DD/Bilibili2Bangumi",
			type: "project",
		},
		],
		startDate: "2024-01",
		endDate: "2024-05",
		icon: "mdi:code-braces",
		color: "#3B82F6",
	},
	{
		id: "proj-3",
		title: "地图数据处理与路径优化可视化平台",
		description:
		"大学生数字建模大赛项目。高效处理 20万+ 地理数据点，集成数据清洗、异常修正、路径规划与可视化模块，用于物流与导航优化场景。",
		type: "project",
		organization: "大学生数字建模大赛",
		position: "大数据架构师",
		skills: [
		"skill-icons:python-dark",
		"skill-icons:pandas-dark",
		"skill-icons:matplotlib-dark",
		"skill-icons:visualstudio-dark",
		],
		startDate: "2024-09",
		endDate: "2024-10",
		icon: "mdi:map-outline",
		color: "#10B981",
	},
	{
		id: "award-1",
		title: "大学生创新创业大赛",
		description: "省级立项项目《生命体征监测设备级系统》。",
		type: "achievement",
		startDate: "2024-06",
		endDate: "2024-10",
		achievements: ["省级立项项目"],
		icon: "mdi:lightbulb-on-outline",
		color: "#EAB308",
	},
	{
		id: "award-2",
		title: "传智杯程序设计赛道",
		description: "国家级三等奖。",
		type: "achievement",
		startDate: "2024-08",
		endDate: "2024-10",
		achievements: ["国家级三等奖"],
		icon: "mdi:trophy-outline",
		color: "#F97316",
	},
	{
		id: "award-3",
		title: "传智杯 AIGC 赛道",
		description: "省级三等奖。",
		type: "achievement",
		startDate: "2024-08",
		endDate: "2024-10",
		achievements: ["省级三等奖"],
		icon: "mdi:robot-outline",
		color: "#A855F7",
	},
	{
		id: "award-4",
		title: "CTF 铁人三项竞赛（Web方向）",
		description: "校级三等奖。",
		type: "achievement",
		startDate: "2024-04",
		endDate: "2024-06",
		achievements: ["校级三等奖"],
		icon: "mdi:shield-lock-outline",
		color: "#06B6D4",
	},


];

// Get timeline statistics
export const getTimelineStats = () => {
	const total = timelineData.length;
	const byType = {
		education: timelineData.filter((item) => item.type === "education").length,
		work: timelineData.filter((item) => item.type === "work").length,
		project: timelineData.filter((item) => item.type === "project").length,
		achievement: timelineData.filter((item) => item.type === "achievement")
			.length,
	};

	return { total, byType };
};

// Get timeline items by type
export const getTimelineByType = (type?: string) => {
	if (!type || type === "all") {
		return timelineData.sort(
			(a, b) =>
				new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
		);
	}
	return timelineData
		.filter((item) => item.type === type)
		.sort(
			(a, b) =>
				new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
		);
};

// Get featured timeline items
export const getFeaturedTimeline = () => {
	return timelineData
		.filter((item) => item.featured)
		.sort(
			(a, b) =>
				new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
		);
};

// Get current ongoing items
export const getCurrentItems = () => {
	return timelineData.filter((item) => !item.endDate);
};

// Calculate total work experience
export const getTotalWorkExperience = () => {
	const workItems = timelineData.filter((item) => item.type === "work");
	let totalMonths = 0;

	workItems.forEach((item) => {
		const startDate = new Date(item.startDate);
		const endDate = item.endDate ? new Date(item.endDate) : new Date();
		const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
		const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
		totalMonths += diffMonths;
	});

	return {
		years: Math.floor(totalMonths / 12),
		months: totalMonths % 12,
	};
};
