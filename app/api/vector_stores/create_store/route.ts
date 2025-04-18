import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI();

export async function POST(request: Request) {
  const { name } = await request.json();
  try {
    const vectorStore = await openai.vectorStores.create({
      name,
    });
    return NextResponse.json(vectorStore, { status: 200 });
  } catch (error) {
    console.error("Error creating vector store:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error creating vector store" },
      { status: 500 }
    );
  }
}
