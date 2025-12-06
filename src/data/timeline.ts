// TimelineItem data configuration file
// Auto-generated from JSON - Edit via admin dashboard
// Last updated: 2025-12-06T11:50:06.922Z

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

export const timelineData: TimelineItem[] = [
  {
    "id": "edu",
    "title": "大学本科",
    "description": "在西安明德理工学院进行大学本科",
    "type": "education",
    "startDate": "2022-09-01",
    "endDate": "2026-09-01",
    "location": "西安",
    "organization": "西安明德理工学院",
    "position": "",
    "skills": [
      "React",
      "Vue",
      "Rust",
      "Go",
      "Python",
      "Tauri",
      "TypeScript",
      "Java",
      "JavaScript",
      "esp32"
    ],
    "achievements": [],
    "links": [],
    "icon": "",
    "color": "#000000",
    "featured": false
  },
  {
    "id": "0721",
    "title": "0721",
    "description": "基于Rust的Windows自动化工具服务器，提供丰富的系统交互能力，支持MCP协议。",
    "type": "project",
    "startDate": "2025-12-02",
    "endDate": "2025-12-03",
    "location": "西安",
    "organization": "",
    "position": "",
    "skills": [
      "Rust",
      "Windows",
      "Automation",
      "MCP"
    ],
    "achievements": [],
    "links": [],
    "icon": "",
    "color": "#000000",
    "featured": false
  },
  {
    "id": "proxy-cli",
    "title": "Proxy CLI",
    "description": "一个简单的命令行代理管理工具，用于快速切换本地 HTTP/HTTPS 代理。",
    "type": "project",
    "startDate": "2025-12-03",
    "endDate": "2025-12-03",
    "location": "西安",
    "organization": "",
    "position": "",
    "skills": [],
    "achievements": [],
    "links": [],
    "icon": "",
    "color": "#000000",
    "featured": false
  },
  {
    "id": "obsidian-git-sync",
    "title": "obsidian-git-sync",
    "description": "一个为Obsidian设计的Git同步插件,可以帮助您轻松地将Obsidian笔记与Git仓库同步。",
    "type": "project",
    "startDate": "2024-10-14",
    "endDate": "",
    "location": "",
    "organization": "",
    "position": "",
    "skills": [],
    "achievements": [],
    "links": [],
    "icon": "",
    "color": "#000000",
    "featured": false
  },
  {
    "id": "bilibili2bangumi",
    "title": "Bilibili2Bangumi",
    "description": "一个将B站追番列表同步到Bangumi的工具",
    "type": "project",
    "startDate": "2024-08-01",
    "endDate": "",
    "location": "",
    "organization": "",
    "position": "",
    "skills": [],
    "achievements": [],
    "links": [],
    "icon": "",
    "color": "#000000",
    "featured": false
  }
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





