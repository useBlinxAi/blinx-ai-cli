import { config } from "dotenv";
import OpenAI from "openai";
import readline from "readline";
import { createRun } from "./openai/create-run.js";
import { performRun } from "./openai/perform-run.js";
import { createAssistant } from "./openai/create-assistant.js";
import { createThread } from "./openai/create-thread.js";
import { Thread } from "openai/resources/beta/threads/threads";
import { Assistant } from "openai/resources/beta/assistants";

config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query: string): Promise<string> => {
  return new Promise((res) => rl.question(query, res));
};

const chat = async (thread: Thread, assistant: Assistant): Promise<void> => {
  while (true) {
    const userInput = await question("\nYou: ");

    if (userInput.toLowerCase() === "exit") {
      rl.close();
      break;
    }

    try {
      await client.beta.threads.messages.create(thread.id, {
        role: "user",
        content: userInput,
      });

      const run = await createRun(client, thread, assistant.id);
      const result = await performRun(run, client, thread);

      if (result?.type === "text") {
        console.log("\nBlinx:", result.text.value);
      }
    } catch (error) {
      console.error(
        "Error during chat:",
        error instanceof Error ? error.message : "Unknown error"
      );
      rl.close();
      break;
    }
  }
};

const main = async (): Promise<void> => {
  try {
    const assistant = await createAssistant(client);
    const thread = await createThread(client);

    console.log('Chat started! Type "exit" to end the conversation.');
    await chat(thread, assistant);
  } catch (error) {
    console.error(
      "Error in main:",
      error instanceof Error ? error.message : "Unknown error"
    );
    rl.close();
    process.exit(1);
  }
};

main().catch((error) => {
  console.error(
    "Unhandled error: ",
    error instanceof Error ? error.message : "Unknown error"
  );
  process.exit(1);
});
