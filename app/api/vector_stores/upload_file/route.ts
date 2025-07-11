export const config = {
  api: {
    bodyParser: {
      sizeLimit: '35mb', // Adjusted for 25MB file + base64 encoding
    },
  },
};

import OpenAI from "openai";
import { writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";
import fs from "fs";
import { NextResponse } from "next/server";

const openai = new OpenAI();

export async function POST(request: Request) {
  const { fileObject } = await request.json();

  // Note for future development:
  // To support significantly larger file uploads (e.g., >50-100MB),
  // consider implementing a streaming upload mechanism.
  // Relying solely on increasing bodyParser.sizeLimit might become
  // resource-intensive or hit platform limits. Streaming would involve
  // processing the file in chunks directly from the request stream,
  // potentially to a temporary store or directly to the OpenAI API if it supports streaming uploads.
  try {
    // Write the base64 content to a temporary file
    const fileBuffer = Buffer.from(fileObject.content, "base64");
    const tempFilePath = join(tmpdir(), `${randomUUID()}-${fileObject.name}`);
    writeFileSync(tempFilePath, fileBuffer);

    // Create file using OpenAI API with the temporary file path
    const file = await openai.files.create({
      file: fs.createReadStream(tempFilePath),
      purpose: "assistants",
    });

    return NextResponse.json(file, { status: 200 });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: `Error uploading file: ${error?.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
