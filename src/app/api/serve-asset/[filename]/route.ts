import { NextRequest, NextResponse } from "next/server";
import { getApp } from "@/actions/get-app";
import { getAppIdFromHeaders } from "@/lib/utils";
import { freestyle } from "@/lib/freestyle";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const filename = (await params).filename;
    const appId = getAppIdFromHeaders(req);

    if (!appId) {
      return new NextResponse("Missing App Id header", { status: 400 });
    }

    const app = await getApp(appId);
    if (!app) {
      return new NextResponse("App not found", { status: 404 });
    }

    // Get freestyle filesystem
    const { fs } = await freestyle.requestDevServer({
      repoId: app.info.gitRepo,
    });

    // Try to read the file from the public directory
    const filePath = `/template/public/${filename}`;
    
    try {
      const fileContent = await fs.readFile(filePath, 'base64');
      
      // Determine content type based on file extension
      const ext = filename.split('.').pop()?.toLowerCase();
      let contentType = 'application/octet-stream';
      
      switch (ext) {
        case 'png':
          contentType = 'image/png';
          break;
        case 'jpg':
        case 'jpeg':
          contentType = 'image/jpeg';
          break;
        case 'gif':
          contentType = 'image/gif';
          break;
        case 'webp':
          contentType = 'image/webp';
          break;
        case 'svg':
          contentType = 'image/svg+xml';
          break;
      }

      // Convert base64 back to binary
      const buffer = Buffer.from(fileContent, 'base64');
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000',
        },
      });
      
    } catch (error) {
      console.error(`Failed to read asset ${filename}:`, error);
      return new NextResponse("Asset not found", { status: 404 });
    }

  } catch (error) {
    console.error("Asset serve error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
