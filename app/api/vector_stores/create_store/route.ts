import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI();

export async function POST(request: Request) {
  const { name, storeName } = await request.json();
  const resolvedName = name || storeName;
  if (!resolvedName) {
    return NextResponse.json(
      { error: "A store name is required to create a vector store." },
      { status: 400 }
    );
  }
  try {
    const vectorStore = await openai.vectorStores.create({
      name: resolvedName,
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
