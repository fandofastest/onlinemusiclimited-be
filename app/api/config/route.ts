import { ok } from "@/lib/response";

export async function GET() {
  return ok({
    aiDisclaimer: "All tracks are AI-generated and royalty-free.",
    copyrightNotice:
      "No copyrighted music is distributed. No artist imitation. All tracks are original AI-generated, royalty-free, instrumental audio for educational use."
  });
}
