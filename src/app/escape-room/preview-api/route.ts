"use server";

import { Question } from "../typings";
import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";

const LAMBDA_CLIENT = new LambdaClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  const { questions, bgImgBase64, bgImgMimeType, bgImgSize } =
    (await request.json()) as {
      questions: Question[];
      bgImgBase64: string | null;
      bgImgMimeType: string;
      bgImgSize: { width: number; height: number } | null;
    };
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return new Response("Invalid questions data", { status: 400 });
  }
  if (!bgImgBase64 || typeof bgImgBase64 !== "string") {
    return new Response("Invalid background image base64", { status: 400 });
  }
  if (!bgImgSize || !bgImgSize.width || !bgImgSize.height) {
    return new Response("Invalid background image size", { status: 400 });
  }
  if (!bgImgMimeType || typeof bgImgMimeType !== "string") {
    return new Response("Invalid background image mime type", { status: 400 });
  }

  const reqPayload = JSON.stringify({
    questions,
    bgImgBase64,
    bgImgSize,
    bgImgMimeType,
  });

  const invokeCommand = new InvokeCommand({
    FunctionName: process.env.AWS_ESCAPE_ROOM_LAMBDA_NAME!,
    Payload: Buffer.from(reqPayload),
    InvocationType: "RequestResponse",
  });

  const { Payload, StatusCode, FunctionError } =
    await LAMBDA_CLIENT.send(invokeCommand);

  if (!Payload || StatusCode !== 200) {
    console.error("Lambda invocation failed", { StatusCode, FunctionError });
    return new Response("Failed to generate preview", { status: 500 });
  }
  const result = JSON.parse(Buffer.from(Payload).toString()).body;

  return new Response(result, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}
