import { NextRequest, NextResponse } from "next/server";
import { getApp } from "@/actions/get-app";
import { getAppIdFromHeaders } from "@/lib/utils";
import { freestyle } from "@/lib/freestyle";
import { db, assetsTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const assetId = (await params).id;
    const appId = getAppIdFromHeaders(req);
    
    if (!appId) {
      return NextResponse.json({ error: "Missing App Id header" }, { status: 400 });
    }

    const app = await getApp(appId);
    if (!app) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    // Get the asset to delete
    const [asset] = await db
      .select()
      .from(assetsTable)
      .where(and(eq(assetsTable.id, assetId), eq(assetsTable.appId, appId)));

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // Get freestyle filesystem
    const { fs } = await freestyle.requestDevServer({
      repoId: app.info.gitRepo,
    });

    // Delete file from filesystem
    try {
      await fs.unlink(asset.filePath);
    } catch (error) {
      console.warn("Failed to delete file from filesystem:", error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await db
      .delete(assetsTable)
      .where(and(eq(assetsTable.id, assetId), eq(assetsTable.appId, appId)));

    return NextResponse.json({
      success: true,
      message: "Asset deleted successfully",
    });

  } catch (error) {
    console.error("Asset deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete asset" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const assetId = (await params).id;
    const appId = getAppIdFromHeaders(req);
    
    if (!appId) {
      return NextResponse.json({ error: "Missing App Id header" }, { status: 400 });
    }

    const app = await getApp(appId);
    if (!app) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, description, tags } = body;

    // Update asset metadata
    const [updatedAsset] = await db
      .update(assetsTable)
      .set({
        name,
        description,
        tags,
        updatedAt: new Date(),
      })
      .where(and(eq(assetsTable.id, assetId), eq(assetsTable.appId, appId)))
      .returning();

    if (!updatedAsset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      asset: {
        ...updatedAsset,
        webPath: updatedAsset.filePath.replace('/template/public', ''),
      },
    });

  } catch (error) {
    console.error("Asset update error:", error);
    return NextResponse.json(
      { error: "Failed to update asset" },
      { status: 500 }
    );
  }
}
