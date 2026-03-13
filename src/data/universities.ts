import type { University } from "@/types";

export const universities: University[] = [
	{
		id: "pku",
		name: "北京大学",
		city: "北京",
		lat: 39.9929,
		lng: 116.306,
		aliases: ["北大", "北京大学"]
	},
	{
		id: "thu",
		name: "清华大学",
		city: "北京",
		lat: 40.0024,
		lng: 116.3266,
		aliases: ["清华", "清华大学"]
	},
	{
		id: "ruc",
		name: "中国人民大学",
		city: "北京",
		lat: 39.9697,
		lng: 116.3119,
		aliases: ["人大", "中国人民大学", "人民大学"]
	},
	{
		id: "bit",
		name: "北京理工大学",
		city: "北京",
		lat: 39.9643,
		lng: 116.3107,
		aliases: ["北理工", "北京理工", "北理"]
	}
];
