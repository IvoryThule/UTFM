import { recommendRestaurants } from "@backend/api/recommend";
import { NextResponse } from "next/server";

interface RecommendRequestBody {
	input?: string;
	university?: string;
	history?: string[];
}

export async function POST(request: Request) {
	const body = (await request.json()) as RecommendRequestBody;

	if (!body.input || !body.university) {
		return NextResponse.json(
			{
				code: -1,
				message: "missing required fields: input, university"
			},
			{ status: 400 }
		);
	}

	const result = recommendRestaurants(body.input, body.university, body.history ?? []);

	return NextResponse.json({
		code: 0,
		data: result
	});
}
