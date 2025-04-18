import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const vectorStoreId = searchParams.get("vector_store_id");

  try {
    const vectorStore = await openai.vectorStores.files.list(
      vectorStoreId || ""
    );
    return NextResponse.json(vectorStore, { status: 200 });
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error fetching files" },
      { status: 500 }
    );
  }
}
