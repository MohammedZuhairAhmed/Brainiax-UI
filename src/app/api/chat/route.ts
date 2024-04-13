import { OpenAIStream, StreamingTextResponse } from "ai";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const url = process.env.NEXT_PUBLIC_BRAINIAX_URL + `/v1/chat/completions`;
  const body = JSON.stringify({
    include_sources: false,
    messages: messages,
    stream: true,
    use_context: true,
  });

  const data = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });

  const stream = OpenAIStream(data);

  return new StreamingTextResponse(stream);
}
