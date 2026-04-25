import { NextResponse } from "next/server";
import { getStocks } from "@/lib/getStocks";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  // TODO: add auth check, rate limiting, and live data fetching here
  const stocks = await getStocks();
  return NextResponse.json(stocks);
}
