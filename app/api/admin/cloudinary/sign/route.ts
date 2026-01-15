import { NextResponse } from "next/server";
import { badRequest, internalError } from "@/lib/response";
import { cloudinarySignature, getCloudinaryEnv, type CloudinaryResourceType } from "@/lib/cloudinary";

type Body = {
  resourceType?: CloudinaryResourceType;
  folder?: string;
};

export async function POST(req: Request) {
  try {
    const env = getCloudinaryEnv();

    const body = (await req.json().catch(() => ({}))) as Body;
    const resourceType: CloudinaryResourceType = body.resourceType === "video" ? "video" : "image";

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = typeof body.folder === "string" && body.folder.trim() ? body.folder.trim() : env.folder;

    const paramsToSign = { folder, timestamp };
    const signature = cloudinarySignature(paramsToSign, env.apiSecret);

    return NextResponse.json({
      success: true,
      data: {
        cloudName: env.cloudName,
        apiKey: env.apiKey,
        folder,
        timestamp,
        signature,
        resourceType
      }
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("Missing Cloudinary")) {
      return badRequest("Cloudinary is not configured");
    }
    return internalError();
  }
}
