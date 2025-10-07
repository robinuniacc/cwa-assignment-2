const s3 = require("@aws-sdk/client-s3");

const S3_ESCAPE_ROOM_HTML_TEMPLATE_KEY = "res/escape-room-template.html";
const QUESTIONS_REGEX = /{{questions}}/g;
const IMAGE_MIME_TYPE_REGEX = /{{bgImgMimeType}}/g;
const IMAGE_SRC_REGEX = /{{bgImgBase64}}/g;
const IMAGE_WIDTH_REGEX = /{{bgImgWidth}}/g;
const IMAGE_HEIGHT_REGEX = /{{bgImgHeight}}/g;

const S3_CLIENT = new s3.S3Client({});
const GET_ESCAPE_ROOM_HTML_TEMPLATE_COMMAND = new s3.GetObjectCommand({
  Bucket: process.env.BUCKET_NAME,
  Key: S3_ESCAPE_ROOM_HTML_TEMPLATE_KEY,
});

function parseBody(event) {
  const { questions, bgImgBase64, bgImgSize, bgImgMimeType } = event;
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

  return { questions, bgImgBase64, bgImgSize, bgImgMimeType };
}

exports.handler = async (event, context) => {
  const parsedBody = parseBody(event);

  if (parsedBody.statusCode >= 400) {
    return parsedBody;
  }

  const { questions, bgImgBase64, bgImgSize, bgImgMimeType } = parsedBody;
  const htmlTemplate = await S3_CLIENT.send(
    GET_ESCAPE_ROOM_HTML_TEMPLATE_COMMAND,
  ).then((data) => data.Body.transformToString());
  const html = htmlTemplate
    .replace(QUESTIONS_REGEX, JSON.stringify(questions, null, 2))
    .replace(IMAGE_SRC_REGEX, bgImgBase64)
    .replace(IMAGE_MIME_TYPE_REGEX, bgImgMimeType)
    .replace(IMAGE_WIDTH_REGEX, bgImgSize.width)
    .replace(IMAGE_HEIGHT_REGEX, bgImgSize.height);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/html",
    },
    body: html,
    isBase64Encoded: false,
  };
};
