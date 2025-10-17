"use server";

import { Question } from "../typings";
import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";

const LAMBDA_CLIENT = new LambdaClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
});

export async function POST(request: Request) {
  const {
    roomId,
    questions,
    bgImgBase64,
    bgImgMimeType,
    bgImgSize,
    timeLimitMinutes,
  } = (await request.json()) as {
    roomId: string;
    questions: Question[];
    bgImgBase64: string | null;
    bgImgMimeType: string;
    bgImgSize: { width: number; height: number } | null;
    timeLimitMinutes: number;
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
    roomId,
    questions,
    bgImgBase64,
    bgImgSize,
    bgImgMimeType,
    timeLimitMinutes,
  });

  const invokeCommand = new InvokeCommand({
    FunctionName: process.env.AWS_ESCAPE_ROOM_LAMBDA_NAME!,
    Payload: Buffer.from(reqPayload),
    InvocationType: "RequestResponse",
  });

  const { StatusCode, FunctionError, Payload } =
    await LAMBDA_CLIENT.send(invokeCommand);

  if (StatusCode !== 200) {
    console.error("Lambda invocation failed", { StatusCode, FunctionError });
    return new Response("Failed to generate preview", { status: 500 });
  }

  const responsePayload = Payload ? Buffer.from(Payload).toString() : null;
  if (!responsePayload) {
    console.error("Lambda response payload is empty");
    return new Response("Failed to generate preview", { status: 500 });
  }

  return new Response(JSON.parse(responsePayload).url!, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
