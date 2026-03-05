import { NextRequest } from "next/server";
import { generateNewTransaction } from "@/lib/mock-data";
import { AUTH_COOKIE, decodeToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Validate auth
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const decoded = decodeToken(token);
  if (!decoded) {
    return new Response("Invalid token", { status: 401 });
  }

  // Create SSE stream
  const encoder = new TextEncoder();
  let intervalId: ReturnType<typeof setInterval>;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`),
      );

      // Send new transactions every 8-15 seconds
      intervalId = setInterval(
        () => {
          try {
            const transaction = generateNewTransaction();
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "new_transaction", transaction })}\n\n`,
              ),
            );
          } catch {
            clearInterval(intervalId);
            controller.close();
          }
        },
        8000 + Math.random() * 7000,
      );
    },
    cancel() {
      clearInterval(intervalId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
