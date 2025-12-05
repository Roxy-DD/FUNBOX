import type {
	AnnouncementConfig,
	CommentConfig,
	ExpressiveCodeConfig,
	FooterConfig,
	FullscreenWallpaperConfig,
	LicenseConfig,
	MusicPlayerConfig,
	NavBarConfig,
	ProfileConfig,
	SakuraConfig,
	SidebarLayoutConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

// Import config from JSON
import configJson from "../mizuki.config.json";

// Helper to cast JSON to types if needed (though TS might infer correctly, we cast for safety with defined types)
// We'll use the values from JSON but keep the TS types.

export const siteConfig: SiteConfig = configJson.siteConfig as unknown as SiteConfig;
export const fullscreenWallpaperConfig: FullscreenWallpaperConfig = configJson.fullscreenWallpaperConfig as unknown as FullscreenWallpaperConfig;

// NavBar config needs special handling if we want to support LinkPreset enum replacement?
// Actually, LinkPreset is just an object/enum. The JSON has the objects directly.
// In the original file, it used `LinkPreset.Home`, which expands to an object.
// In our JSON, we expanded it to the object. So we can just use the object from JSON.
export const navBarConfig: NavBarConfig = configJson.navBarConfig as unknown as NavBarConfig;

export const profileConfig: ProfileConfig = configJson.profileConfig as unknown as ProfileConfig;
export const licenseConfig: LicenseConfig = configJson.licenseConfig as unknown as LicenseConfig;
export const expressiveCodeConfig: ExpressiveCodeConfig = configJson.expressiveCodeConfig as unknown as ExpressiveCodeConfig;
export const commentConfig: CommentConfig = configJson.commentConfig as unknown as CommentConfig;
export const announcementConfig: AnnouncementConfig = configJson.announcementConfig as unknown as AnnouncementConfig;
export const musicPlayerConfig: MusicPlayerConfig = configJson.musicPlayerConfig as unknown as MusicPlayerConfig;
export const footerConfig: FooterConfig = configJson.footerConfig as unknown as FooterConfig;
export const sidebarLayoutConfig: SidebarLayoutConfig = configJson.sidebarLayoutConfig as unknown as SidebarLayoutConfig;
export const sakuraConfig: SakuraConfig = configJson.sakuraConfig as unknown as SakuraConfig;
export const pioConfig: import("./types/config").PioConfig = configJson.pioConfig as unknown as import("./types/config").PioConfig;

export const widgetConfigs = {
	profile: profileConfig,
	announcement: announcementConfig,
	music: musicPlayerConfig,
	layout: sidebarLayoutConfig,
	sakura: sakuraConfig,
	fullscreenWallpaper: fullscreenWallpaperConfig,
	pio: pioConfig,
} as const;

export const umamiConfig = {
	enabled: configJson.umamiConfig.enabled,
	apiKey: import.meta.env.UMAMI_API_KEY || configJson.umamiConfig.apiKey,
	baseUrl: configJson.umamiConfig.baseUrl,
	scripts: configJson.umamiConfig.scripts,
} as const;
