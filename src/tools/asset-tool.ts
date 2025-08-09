import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { FreestyleDevServerFilesystem } from "freestyle-sandboxes";
import { db, assetsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export const assetTool = (fs: FreestyleDevServerFilesystem, appId: string) =>
  createTool({
    id: "list_assets",
    description: `List available game assets that have been uploaded for this app. Shows asset names, descriptions, types, and file paths so you can reference them in your game code.`,
    inputSchema: z.object({
      type: z.enum(["image", "audio", "video", "sprite", "tilemap", "font", "json", "all"]).optional().default("all").describe("Filter assets by type"),
    }),
    execute: async ({ context: { type } }) => {
      try {
        // Get assets from database
        const assets = await db.select().from(assetsTable).where(eq(assetsTable.appId, appId));

        // Filter by type if specified
        const filteredAssets = type && type !== "all"
          ? assets.filter(asset => asset.type === type)
          : assets;

        if (filteredAssets.length === 0) {
          return `No ${type === "all" ? "" : type + " "}assets found. Upload some assets first using the asset upload UI.`;
        }

        let result = `Found ${filteredAssets.length} ${type === "all" ? "" : type + " "}assets:\n\n`;

        filteredAssets.forEach(asset => {
          const webPath = asset.filePath.replace('/template/public', '');
          result += `**${asset.name}** (${asset.type})\n`;
          result += `- Path: ${webPath}\n`;
          result += `- Description: ${asset.description}\n`;
          if (asset.tags && asset.tags.length > 0) {
            result += `- Tags: ${asset.tags.join(', ')}\n`;
          }
          if (asset.width && asset.height) {
            result += `- Dimensions: ${asset.width}x${asset.height}\n`;
          }
          result += `- Size: ${Math.round(asset.fileSize / 1024)}KB\n\n`;
        });

        return result;
      } catch (error) {
        throw new Error(`Asset tool error: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
  });
