import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI();

export async function DELETE(request: Request) {
  const { vectorStoreId, fileId } = await request.json();

  if (!vectorStoreId || !fileId) {
    return NextResponse.json(
      { error: "vectorStoreId and fileId are required." },
      { status: 400 }
    );
  }

  try {
    const deleted = await openai.vectorStores.files.del(vectorStoreId, fileId);
    return NextResponse.json(deleted, { status: 200 });
  } catch (error) {
    console.error("Error removing file from vector store:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error deleting file" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { vectorStoreId, fileId, action } = await request.json();

  if (!vectorStoreId || !fileId) {
    return NextResponse.json(
      { error: "vectorStoreId and fileId are required." },
      { status: 400 }
    );
  }

  if (action !== "refresh") {
    return NextResponse.json(
      { error: "Unsupported action. Use action=\"refresh\" to re-embed a file." },
      { status: 400 }
    );
  }

  try {
    await openai.vectorStores.files.del(vectorStoreId, fileId);
    const refreshed = await openai.vectorStores.files.create(vectorStoreId, {
      file_id: fileId,
    });
    return NextResponse.json(refreshed, { status: 200 });
  } catch (error) {
    console.error("Error refreshing file:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error refreshing file" },
      { status: 500 }
    );
  }
}
