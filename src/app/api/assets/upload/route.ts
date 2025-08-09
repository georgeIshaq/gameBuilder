import { NextRequest, NextResponse } from "next/server";
import { getApp } from "@/actions/get-app";
import { getAppIdFromHeaders } from "@/lib/utils";
import { freestyle } from "@/lib/freestyle";
import { db, assetsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

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

    // Create assets directory if it doesn't exist
    const assetsDir = "/template/public/assets";
    try {
      await fs.readdir(assetsDir);
    } catch {
      // Directory doesn't exist, create it
      await fs.mkdir(assetsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || '';
    const sanitizedName = name.replace(/[^a-zA-Z0-9-_]/g, '_');
    const fileName = `${sanitizedName}_${timestamp}.${fileExtension}`;
    const filePath = `${assetsDir}/${fileName}`;

    // Convert file to buffer and write to filesystem
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);

    // Parse tags
    let parsedTags: string[] = [];
    if (tags) {
      try {
        parsedTags = JSON.parse(tags);
      } catch {
        parsedTags = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      }
    }

    // Get image dimensions if it's an image
    let width: number | undefined;
    let height: number | undefined;
    
    if (file.type.startsWith('image/')) {
      // For now, we'll skip dimension detection to keep it simple
      // In a production app, you'd use a library like sharp or canvas
    }

    // Save asset metadata to database
    const [asset] = await db.insert(assetsTable).values({
      appId,
      name,
      description,
      type: type as any,
      filePath,
      originalFileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      width,
      height,
      tags: parsedTags,
      metadata: {},
    }).returning();

    // Return the web-accessible path
    const webPath = `/assets/${fileName}`;

    return NextResponse.json({
      success: true,
      asset: {
        id: asset.id,
        name: asset.name,
        description: asset.description,
        type: asset.type,
        webPath,
        filePath,
        originalFileName: asset.originalFileName,
        mimeType: asset.mimeType,
        fileSize: asset.fileSize,
        width: asset.width,
        height: asset.height,
        tags: asset.tags,
        createdAt: asset.createdAt,
      }
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

    // Get all assets for this app
    const assets = await db
      .select()
      .from(assetsTable)
      .where(eq(assetsTable.appId, appId))
      .orderBy(assetsTable.createdAt);

    // Convert file paths to web paths
    const assetsWithWebPaths = assets.map(asset => ({
      ...asset,
      webPath: asset.filePath.replace('/template/public', ''),
    }));

    return NextResponse.json({
      success: true,
      assets: assetsWithWebPaths,
    });

  } catch (error) {
    console.error("Get assets error:", error);
    return NextResponse.json(
      { error: "Failed to get assets" },
      { status: 500 }
    );
  }
}
