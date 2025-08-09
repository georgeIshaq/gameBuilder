import { tool } from "ai";
import { z } from "zod";
import { freestyle } from "@/lib/freestyle";

export const getAssetDataTool = tool({
  description: "Get the data URL for a specific asset to use in Phaser games",
  parameters: z.object({
    assetName: z.string().describe("The name of the asset to get data for"),
    appId: z.string().describe("The app ID"),
  }),
  execute: async ({ assetName, appId }) => {
    try {
      // Get the app info to find the repo
      const { getApp } = await import("@/actions/get-app");
      const app = await getApp(appId);

      if (!app) {
        return `Error: Could not find app with ID ${appId}`;
      }
      
      // Get freestyle filesystem
      const { fs } = await freestyle.requestDevServer({
        repoId: app.info.gitRepo,
      });

      // Read the assets manifest
      let assets = [];
      try {
        const manifestContent = await fs.readFile('/template/assets-manifest.json');
        assets = JSON.parse(manifestContent);
      } catch (error) {
        return `Error: No assets found. Please upload some assets first.`;
      }

      // Find the asset by name (case insensitive)
      const asset = assets.find((a: any) => 
        a.name.toLowerCase() === assetName.toLowerCase()
      );

      if (!asset) {
        const availableAssets = assets.map((a: any) => a.name).join(', ');
        return `Error: Asset "${assetName}" not found. Available assets: ${availableAssets}`;
      }

      // Read the actual file and convert to data URL
      const filePath = `/template/public/${asset.fileName}`;
      try {
        const fileContent = await fs.readFile(filePath, 'base64');
        const dataUrl = `data:${asset.mimeType};base64,${fileContent}`;
        
        const assetKey = asset.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        
        return `Asset "${assetName}" data URL:

**Phaser Loading Code:**
\`\`\`javascript
// In your preload() function:
this.load.image('${assetKey}', '${dataUrl}');

// Then in create() function:
this.add.sprite(x, y, '${assetKey}');
\`\`\`

**Asset Info:**
- Name: ${asset.name}
- Type: ${asset.type}
- Size: ${Math.round(asset.fileSize / 1024)}KB
- Description: ${asset.description}`;

      } catch (error) {
        return `Error: Could not read asset file "${asset.fileName}". The file may be corrupted or missing.`;
      }

    } catch (error) {
      console.error("Get asset data error:", error);
      return `Error: Failed to retrieve asset data. ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
});
