import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const vectorStoreId = searchParams.get("vector_store_id");
  const query = searchParams.get("q")?.toLowerCase().trim();

  if (!vectorStoreId) {
    return NextResponse.json(
      { error: "A vector store ID is required to list files." },
      { status: 400 }
    );
  }

  try {
    const vectorStoreFiles = await openai.vectorStores.files.list(vectorStoreId, {
      limit: 100,
    });

    const detailedFiles = await Promise.all(
      vectorStoreFiles.data.map(async (file) => {
        const metadata = await openai.files.retrieve(file.id);
        const name =
          // @ts-expect-error - filename is present on file retrieve responses
          metadata.filename || metadata.name || file.id;
        const type =
          // @ts-expect-error - mime_type is present on file retrieve responses
          metadata.mime_type || metadata.purpose || "Unknown";
        return {
          id: file.id,
          name,
          type,
          size: metadata.bytes || 0,
          createdAt: metadata.created_at,
          status: (file as { status?: string }).status || metadata.status,
        };
      })
    );

    const filteredFiles = query
      ? detailedFiles.filter((file) => {
          const term = query.toLowerCase();
          return (
            file.name.toLowerCase().includes(term) ||
            file.type.toLowerCase().includes(term)
          );
        })
      : detailedFiles;

    return NextResponse.json({ data: filteredFiles }, { status: 200 });
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error fetching files" },
      { status: 500 }
    );
  }
}
