import { sql } from "@/lib/db";
import promptsData from "./prompts-data.json";
import { NewPrompt } from "@/lib/db/schema"; // Import the type if needed for validation/typing

async function seedPrompts() {
  console.log("Starting to seed prompts...");

  let insertedCount = 0;
  let skippedCount = 0;

  for (const prompt of promptsData) {
    try {
      // Basic check for required fields
      if (!prompt.title || !prompt.prompt || !prompt.category) {
        console.warn(`Skipping prompt due to missing data: ${JSON.stringify(prompt)}`);
        skippedCount++;
        continue;
      }

      // Construct the data object matching the schema (mapping title to name)
      const newPromptData: Omit<NewPrompt, 'id' | 'createdAt' | 'updatedAt' | 'systemMessage'> & { systemMessage?: string | null } = {
        name: prompt.title,
        prompt: prompt.prompt,
        category: prompt.category,
        // systemMessage is not in the JSON, so we omit or set to null
        systemMessage: null, 
      };

      // Insert the prompt using the sql tagged template
      await sql`
        INSERT INTO legalprompt (name, prompt, category, "systemMessage")
        VALUES (${newPromptData.name}, ${newPromptData.prompt}, ${newPromptData.category}, ${newPromptData.systemMessage})
        ON CONFLICT (name) DO NOTHING; -- Optional: Prevent duplicates based on name
      `;
      
      insertedCount++;
      console.log(`Inserted prompt: ${prompt.title}`);

    } catch (error) {
      console.error(`Failed to insert prompt "${prompt.title}":`, error);
      // Decide if you want to stop the script on error or continue
      // throw error; // Uncomment to stop on first error
    }
  }

  console.log("--------------------");
  console.log(`Seeding complete.`);
  console.log(`Inserted: ${insertedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log("--------------------");

  // Important: The neon serverless driver doesn't require explicit disconnection usually.
  // If using a different driver (like node-postgres 'pg'), you might need:
  // await sql.end(); 
  // console.log("Database connection closed.");
}

seedPrompts().catch((error) => {
  console.error("Seeding script failed:", error);
  process.exit(1);
});
