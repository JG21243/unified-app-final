import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI();

export async function GET() {
  try {
    const stores = await openai.vectorStores.list({ limit: 50 });
    return NextResponse.json(stores, { status: 200 });
  } catch (error) {
    console.error("Error listing vector stores:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error listing vector stores" },
      { status: 500 }
    );
  }
}
