import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { FreestyleDevServerFilesystem } from "freestyle-sandboxes";

export const assetTool = (fs: FreestyleDevServerFilesystem, _appId: string) =>
  createTool({
    id: "list_assets",
    description: `List available game assets that have been uploaded for this app. Shows asset names, descriptions, types, and file paths so you can reference them in your game code.`,
    inputSchema: z.object({
      type: z.enum(["image", "audio", "video", "sprite", "tilemap", "font", "json", "all"]).optional().default("all").describe("Filter assets by type"),
    }),
    execute: async ({ context: { type } }) => {
      try {
        // Read assets from manifest file
        let assets = [];
        try {
          const manifestContent = await fs.readFile('/template/assets-manifest.json');
          assets = JSON.parse(manifestContent);
        } catch (error) {
          return `No assets found. Upload some assets first using the asset upload UI.`;
        }

        // Filter by type if specified
        const filteredAssets = type && type !== "all"
          ? assets.filter((asset: any) => asset.type === type)
          : assets;

        if (filteredAssets.length === 0) {
          return `No ${type === "all" ? "" : type + " "}assets found. Upload some assets first using the asset upload UI.`;
        }

        let result = `Found ${filteredAssets.length} ${type === "all" ? "" : type + " "}assets:\n\n`;

        filteredAssets.forEach((asset: any) => {
          const assetKey = asset.name.toLowerCase().replace(/[^a-z0-9]/g, '_');

          result += `**${asset.name}** (${asset.type})\n`;
          result += `- Asset Key: '${assetKey}'\n`;
          result += `- Description: ${asset.description}\n`;
          if (asset.tags && asset.tags.length > 0) {
            result += `- Tags: ${asset.tags.join(', ')}\n`;
          }
          result += `- Size: ${Math.round(asset.fileSize / 1024)}KB\n`;
          result += `- Status: Ready to use\n\n`;
        });

        // Add instructions for loading
        if (filteredAssets.length > 0) {
          result += `\n**LOADING INSTRUCTIONS:**\n`;
          result += `To use these assets, call the 'get_asset_data' tool with the asset name to get the data URL.\n`;
          result += `Then use: this.load.image('asset_key', dataUrl) in your preload() function.\n\n`;

          result += `**Available asset keys:**\n`;
          filteredAssets.forEach((asset: any) => {
            const assetKey = asset.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
            result += `- '${assetKey}' (${asset.name})\n`;
          });
        }

        return result;
      } catch (error) {
        throw new Error(`Asset tool error: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
  });
