import { NextRequest, NextResponse } from "next/server";
import { getApp } from "@/actions/get-app";
import { getAppIdFromHeaders } from "@/lib/utils";
import { freestyle } from "@/lib/freestyle";

export async function POST(req: NextRequest) {
  try {
    const appId = getAppIdFromHeaders(req);

    if (!appId) {
      return NextResponse.json({ error: "Missing App Id header" }, { status: 400 });
    }

    const app = await getApp(appId);
    if (!app) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string || "";
    const type = formData.get("type") as string || "other";
    const tags = formData.get("tags") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: "Asset name is required" }, { status: 400 });
    }

    // Get freestyle filesystem
    const { fs } = await freestyle.requestDevServer({
      repoId: app.info.gitRepo,
    });

    // Generate clean filename using user's chosen asset name
    const fileExtension = file.name.split('.').pop() || '';
    const sanitizedName = name.replace(/[^a-zA-Z0-9-_]/g, '_');
    const fileName = `${sanitizedName}.${fileExtension}`;

    // Save to the Next.js public directory so it's served by the dev server
    const publicDir = "/template/public";
    const filePath = `${publicDir}/${fileName}`;

    // Convert to base64 for Freestyle filesystem storage
    const arrayBuffer = await file.arrayBuffer();
    const base64Content = Buffer.from(arrayBuffer).toString('base64');

    // Ensure public directory exists
    try {
      await fs.ls(publicDir);
    } catch {
      // Create public directory if it doesn't exist
      await fs.writeFile(`${publicDir}/.gitkeep`, '');
    }

    // Write the file with base64 encoding for binary files
    await fs.writeFile(filePath, base64Content, 'base64');

    // Parse tags for AI context
    let parsedTags: string[] = [];
    if (tags) {
      try {
        parsedTags = JSON.parse(tags);
      } catch {
        parsedTags = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      }
    }

    // Create a simple asset manifest file for the AI to reference
    const assetInfo = {
      id: crypto.randomUUID(), // Generate unique ID for the asset
      name,
      description,
      type,
      fileName,
      originalFileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      tags: parsedTags,
      webPath: `/${fileName}`, // Try direct file path first
      uploadedAt: new Date().toISOString()
    };

    // Save asset info to a manifest file the AI can read
    try {
      let manifest = [];
      try {
        const existingManifest = await fs.readFile('/template/assets-manifest.json');
        manifest = JSON.parse(existingManifest);
      } catch {
        // No existing manifest, start fresh
      }

      // Remove any existing asset with the same name
      manifest = manifest.filter((asset: { fileName: string }) => asset.fileName !== fileName);

      // Add new asset
      manifest.push(assetInfo);

      await fs.writeFile('/template/assets-manifest.json', JSON.stringify(manifest, null, 2));
    } catch (error) {
      console.warn("Failed to update assets manifest:", error);
    }

    return NextResponse.json({
      success: true,
      asset: assetInfo
    });

  } catch (error) {
    console.error("Asset upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload asset" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const appId = getAppIdFromHeaders(req);

    if (!appId) {
      return NextResponse.json({ error: "Missing App Id header" }, { status: 400 });
    }

    const app = await getApp(appId);
    if (!app) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    // Get freestyle filesystem
    const { fs } = await freestyle.requestDevServer({
      repoId: app.info.gitRepo,
    });

    // Read assets from manifest file
    let assets = [];
    try {
      const manifestContent = await fs.readFile('/template/assets-manifest.json');
      assets = JSON.parse(manifestContent);
    } catch {
      // No manifest file exists yet, return empty array
      console.log("No assets manifest found, returning empty array");
    }

    return NextResponse.json({
      success: true,
      assets: assets,
    });

  } catch (error) {
    console.error("Get assets error:", error);
    return NextResponse.json(
      { error: "Failed to get assets" },
      { status: 500 }
    );
  }
}
