import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI();

export async function POST(request: Request) {
  const { vectorStoreId, fileId } = await request.json();
  try {
    const vectorStore = await openai.vectorStores.files.create(
      vectorStoreId,
      {
        file_id: fileId,
      }
    );
    return NextResponse.json(vectorStore, { status: 200 });
  } catch (error) {
    console.error("Error adding file:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error adding file" },
      { status: 500 }
    );
  }
}
