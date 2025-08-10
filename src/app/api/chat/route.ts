import { getApp } from "@/actions/get-app";
import { freestyle } from "@/lib/freestyle";
import { getAppIdFromHeaders } from "@/lib/utils";
import { UIMessage } from "ai";
import { builderAgent } from "@/mastra/agents/builder";
import { getAgentForUserInput } from "@/lib";

// "fix" mastra mcp bug
import { EventEmitter } from "events";
import {
  isStreamRunning,
  stopStream,
  waitForStreamToStop,
  clearStreamState,
  sendMessageWithStreaming,
} from "@/lib/internal/stream-manager";
EventEmitter.defaultMaxListeners = 1000;

import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  console.log("creating new chat stream");
  const appId = getAppIdFromHeaders(req);

  if (!appId) {
    return new Response("Missing App Id header", { status: 400 });
  }

  const app = await getApp(appId);
  if (!app) {
    return new Response("App not found", { status: 404 });
  }

  // Check if a stream is already running and stop it if necessary
  if (await isStreamRunning(appId)) {
    console.log("Stopping previous stream for appId:", appId);
    await stopStream(appId);

    // Wait until stream state is cleared
    const stopped = await waitForStreamToStop(appId);
    if (!stopped) {
      await clearStreamState(appId);
      return new Response(
        "Previous stream is still shutting down, please try again",
        { status: 429 }
      );
    }
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  // Decide which agent to use based on the latest user text
  const last = messages.at(-1);
  let latestText = "";
  if (last?.parts && Array.isArray(last.parts)) {
    latestText = last.parts
      .filter((p: any) => p?.type === "text" && typeof p.text === "string")
      .map((p: any) => p.text)
      .join("\n");
  }
  const agent = latestText ? getAgentForUserInput(latestText) : builderAgent;

  const { mcpEphemeralUrl, fs } = await freestyle.requestDevServer({
    repoId: app.info.gitRepo,
  });

  const resumableStream = await sendMessageWithStreaming(
    agent,
    appId,
    mcpEphemeralUrl,
    fs,
    messages.at(-1)!
  );

  return resumableStream.response();
}
