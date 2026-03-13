import type { Review } from "@/types";

const reviewTemplates = [
	{
		content: "味道很稳，价格在附近算友好，下课冲一波很合适。",
		queueMinutes: 8,
		spendPerHead: 26,
		tags: ["#性价比高", "#复购"]
	},
	{
		content: "出餐速度快，社恐一个人来也不会尴尬，店员态度也不错。",
		queueMinutes: 5,
		spendPerHead: 22,
		tags: ["#一个人友好", "#出餐快"]
	},
	{
		content: "口味偏重一点但很下饭，和室友来聚餐基本不会踩雷。",
		queueMinutes: 12,
		spendPerHead: 35,
		tags: ["#宿舍聚餐", "#下饭"]
	},
	{
		content: "环境比想象中干净，拍照也还可以，适合约会前半场。",
		queueMinutes: 10,
		spendPerHead: 42,
		tags: ["#环境在线", "#拍照好看"]
	},
	{
		content: "夜里来过两次，营业到挺晚，考试周救我狗命。",
		queueMinutes: 6,
		spendPerHead: 28,
		tags: ["#深夜食堂", "#考试周续命"]
	}
] as const;

const departments = ["计算机学院", "自动化学院", "经管学院", "法学院", "外国语学院"] as const;
const names = ["小林", "阿凯", "小雨", "文博", "子涵", "嘉宁", "北北", "阿南"] as const;
const universityIds = ["pku", "thu", "ruc", "bit"] as const;

function getRating(seed: number): number {
	const ratings = [4.0, 4.2, 4.3, 4.5, 4.7];
	return ratings[seed % ratings.length];
}

function getDate(seed: number): string {
	const day = (seed % 28) + 1;
	return `2026-03-${String(day).padStart(2, "0")}T12:00:00.000Z`;
}

export const reviews: Review[] = Array.from({ length: 20 }).flatMap((_, restaurantIndex) => {
	const restaurantId = `r${String(restaurantIndex + 1).padStart(3, "0")}`;
	return reviewTemplates.map((template, idx) => {
		const seed = restaurantIndex * 10 + idx;
		return {
			id: `rv-${restaurantId}-${idx + 1}`,
			restaurantId,
			universityId: universityIds[seed % universityIds.length],
			authorName: names[seed % names.length],
			authorDepartment: departments[seed % departments.length],
			rating: getRating(seed),
			content: template.content,
			spendPerHead: template.spendPerHead,
			queueMinutes: template.queueMinutes,
			likes: 12 + (seed % 89),
			tags: [...template.tags],
			createdAt: getDate(seed)
		};
	});
});
