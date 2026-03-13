import type { Scene } from "@/types";

export interface CategoryOption {
	id: string;
	label: string;
}

export interface SceneOption {
	id: Scene;
	label: string;
	icon: string;
}

export const categoryOptions: CategoryOption[] = [
	{ id: "中餐", label: "中餐" },
	{ id: "火锅", label: "火锅" },
	{ id: "烧烤", label: "烧烤" },
	{ id: "面食", label: "面食" },
	{ id: "日韩", label: "日韩" },
	{ id: "西餐", label: "西餐" },
	{ id: "轻食", label: "轻食" },
	{ id: "奶茶", label: "奶茶" },
	{ id: "小吃", label: "小吃" }
];

export const sceneOptions: SceneOption[] = [
	{ id: "solo", label: "一个人吃", icon: "🍜" },
	{ id: "date", label: "情侣约会", icon: "👫" },
	{ id: "group", label: "宿舍聚餐", icon: "🎉" },
	{ id: "late-night", label: "深夜食堂", icon: "🌙" },
	{ id: "budget", label: "穷鬼快乐", icon: "💰" }
];
