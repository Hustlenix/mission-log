import { getAuth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const auth = await getAuth();
    return await auth.handler(request);
  } catch {
    return Response.json(
      {
        message:
          "Account service is temporarily unavailable. Please try again.",
      },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
