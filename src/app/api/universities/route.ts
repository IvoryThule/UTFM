import { universities } from "@backend/data/universities";
import { NextResponse } from "next/server";

export async function GET() {
	return NextResponse.json({
		code: 0,
		data: {
			list: universities
		}
	});
}
