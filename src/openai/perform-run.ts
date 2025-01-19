import OpenAI from "openai";
import { runToolsHandler } from "./run-tools-handler.js";
import { Run } from "openai/resources/beta/threads/runs/runs";
import { Thread } from "openai/resources/beta/threads/threads";

export const performRun = async (run: Run, client: OpenAI, thread: Thread) => {
  while (run.status === "requires_action") {
    run = await runToolsHandler(run, client, thread);
  }

  if (run.status === "failed") {
    const errorMsg = `I encountered an error: ${
      run.last_error?.message || "Unknown error"
    }`;
    console.error("Run failed: ", run.last_error);
    await client.beta.threads.messages.create(thread.id, {
      role: "assistant",
      content: errorMsg,
    });

    return {
      type: "text",
      text: {
        value: errorMsg,
        annotations: [],
      },
    };
  }

  const messages = await client.beta.threads.messages.list(thread.id);

  const assistantMessage = messages.data.find(
    (message) => message.role === "assistant"
  );

  // console.log(`🚀 Assistant message: ${JSON.stringify(assistantMessage?.content[0])}`);

  return (
    assistantMessage?.content[0] || {
      type: "text",
      text: {
        value: "No response from assistant",
        annotations: [],
      },
    }
  );
};
