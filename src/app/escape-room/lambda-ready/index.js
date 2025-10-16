const s3 = require("@aws-sdk/client-s3");

const BUCKET_NAME = "cwa-assignment-2";
const S3_ESCAPE_ROOM_HTML_TEMPLATE_KEY = "res/escape-room.template.html";
const S3_ESCAPE_ROOM_HTML_KEY_TEMPLATE = "finished/escape-room-{{roomId}}.html";
const QUESTIONS_REGEX = /{{questions}}/g;
const IMAGE_MIME_TYPE_REGEX = /{{bgImgMimeType}}/g;
const IMAGE_SRC_REGEX = /{{bgImgBase64}}/g;
const IMAGE_WIDTH_REGEX = /{{bgImgWidth}}/g;
const IMAGE_HEIGHT_REGEX = /{{bgImgHeight}}/g;
const TIME_LIMIT_MINUTES_REGEX = /{{timeLimitMinutes}}/g;

const S3_CLIENT = new s3.S3Client({});
const GET_ESCAPE_ROOM_HTML_TEMPLATE_COMMAND = new s3.GetObjectCommand({
  Bucket: BUCKET_NAME,
  Key: S3_ESCAPE_ROOM_HTML_TEMPLATE_KEY,
});

function parseBody(event) {
  const {
    roomId,
    questions,
    bgImgBase64,
    bgImgSize,
    bgImgMimeType,
    timeLimitMinutes,
  } = event;
  if (!roomId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid room ID" }),
    };
  }
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid questions data" }),
    };
  }
  if (!bgImgBase64 || typeof bgImgBase64 !== "string") {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid background image URL" }),
    };
  }
  if (!bgImgSize || !bgImgSize.width || !bgImgSize.height) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid background image size" }),
    };
  }
  if (!bgImgMimeType || typeof bgImgMimeType !== "string") {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid background image MIME type" }),
    };
  }
  if (timeLimitMinutes == null) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid time limit" }),
    };
  }

  return {
    roomId,
    questions,
    bgImgBase64,
    bgImgSize,
    bgImgMimeType,
    timeLimitMinutes,
  };
}

exports.handler = async (event, context) => {
  const parsedBody = parseBody(event);

  if (parsedBody.statusCode >= 400) {
    return parsedBody;
  }

  const {
    roomId,
    questions,
    bgImgBase64,
    bgImgSize,
    bgImgMimeType,
    timeLimitMinutes,
  } = parsedBody;
  const htmlTemplate = await S3_CLIENT.send(
    GET_ESCAPE_ROOM_HTML_TEMPLATE_COMMAND,
  ).then((data) => data.Body.transformToString());
  const html = htmlTemplate
    .replace(QUESTIONS_REGEX, JSON.stringify(questions, null, 2))
    .replace(IMAGE_SRC_REGEX, bgImgBase64)
    .replace(IMAGE_MIME_TYPE_REGEX, bgImgMimeType)
    .replace(IMAGE_WIDTH_REGEX, bgImgSize.width)
    .replace(IMAGE_HEIGHT_REGEX, bgImgSize.height)
    .replace(TIME_LIMIT_MINUTES_REGEX, timeLimitMinutes);

  await S3_CLIENT.send(
    new s3.PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: S3_ESCAPE_ROOM_HTML_KEY_TEMPLATE.replace("{{roomId}}", roomId),
      Body: html,
      ContentType: "text/html",
    }),
  );

  return {
    url: `https://${BUCKET_NAME}.s3.ap-southeast-2.amazonaws.com/${S3_ESCAPE_ROOM_HTML_KEY_TEMPLATE.replace(
      "{{roomId}}",
      roomId,
    )}`,
  };
};
