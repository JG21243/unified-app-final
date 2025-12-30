import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : 20;

  try {
    const vectorStores = await openai.vectorStores.list({
      limit,
    });

    return NextResponse.json(vectorStores, { status: 200 });
  } catch (error) {
    console.error("Error listing vector stores:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error listing vector stores",
      },
      { status: 500 }
    );
  }
}
