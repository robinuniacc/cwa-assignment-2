"use server";
import prisma, { DBQuestionType } from "../lib/prisma";
import {
  FillInTheBlanksQuestion,
  MultipleChoiceQuestion,
  Question,
  ShortAnswerQuestion,
  TrueFalseQuestion,
} from "@/app/escape-room/typings";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  NoSuchKey,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const S3_CLIENT = new S3Client({});
const getRoomBgImgKey = (roomId: string) =>
  `${process.env.NEXT_PUBLIC_S3_PREFIX_UNFINISHED_ROOMS!}/${roomId}/bgimg`;

function makeS3GetbgImgForRoom(roomId: string) {
  return new GetObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
    Key: getRoomBgImgKey(roomId),
  });
}

function convertTSQuestionTypeToDBType(type: Question["type"]): DBQuestionType {
  return type.replace(/-/g, "_") as DBQuestionType;
}

async function deleteAllQuestionsInRoomInDB(roomId: string) {
  await prisma.questions.deleteMany({
    where: { room_id: roomId },
  });
}

async function deleteRoom(roomId: string) {
  // Remove room resources from S3
  const listObjsUnfin = await S3_CLIENT.send(
    new ListObjectsV2Command({
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Prefix: process.env.NEXT_PUBLIC_S3_PREFIX_UNFINISHED_ROOMS,
    }),
  );
  const listObjsFin = await S3_CLIENT.send(
    new ListObjectsV2Command({
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Prefix: process.env.NEXT_PUBLIC_S3_PREFIX_FINISHED_ROOMS,
    }),
  );

  const objs = [
    ...(listObjsUnfin.Contents || []),
    ...(listObjsFin.Contents || []),
  ];

  for (const obj of objs) {
    if (!obj.Key) continue;
    await S3_CLIENT.send(
      new DeleteObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
        Key: obj.Key,
      }),
    );
  }

  // Remove room and all its questions from db
  await prisma.rooms.delete({
    where: { id: roomId },
  });
}

async function addOrUpdateRoom(room: { id: string; name: string }) {
  await prisma.rooms.upsert({
    where: { id: room.id },
    create: {
      id: room.id,
      name: room.name,
      bgImgWidth: 0,
      bgImgHeight: 0,
    },
    update: {
      name: room.name,
    },
  });
}

function extractCriticalDBQIntoTSQ<T>(
  q: T & {
    question: {
      id: string;
      center_x: number;
      center_y: number;
      prompts: { type: string; prompt: string }[];
    };
  },
) {
  return {
    id: q.question.id,
    position: {
      centerX: q.question.center_x,
      centerY: q.question.center_y,
    },
    prompt: q.question.prompts,
  };
}

async function loadData(roomId: string | null) {
  const rooms = await prisma.rooms.findMany({});

  const room = roomId
    ? await prisma.rooms.findFirst({
        where: { id: roomId },
        include: { questions: true },
      })
    : null;

  if (!room) {
    return {
      questions: [],
      bgImgBlob: null,
      imgSize: { width: 0, height: 0 },
      rooms: rooms,
      timeLimitMinutes: 5,
    };
  }

  const questionIds = room.questions.map((q) => q.id);

  const stdQuery = {
    omit: { question_id: true },
    include: {
      question: {
        include: {
          prompts: {
            select: { type: true, prompt: true },
            orderBy: { position: "asc" as "asc" | "desc" },
          },
        },
      },
    },
    where: {
      question_id: {
        in: questionIds,
      },
    },
  };

  const shortAnsQs = (
    await prisma.short_answer_questions.findMany({
      ...stdQuery,
    })
  ).map((q) => {
    return {
      ...extractCriticalDBQIntoTSQ(q),
      type: "short-answer",
      answer: q.answer,
    } as ShortAnswerQuestion;
  });

  const mcQs = (
    await prisma.multiple_choice_questions.findMany({
      ...stdQuery,
      include: {
        ...stdQuery.include,
        choices: {
          select: { is_correct: true, text: true },
        },
      },
    })
  ).map(
    (q) =>
      ({
        ...extractCriticalDBQIntoTSQ(q),
        type: "multiple-choice",
        choices: q.choices.map((c) => ({
          text: c.text,
          isCorrect: c.is_correct,
        })),
      }) as MultipleChoiceQuestion,
  );

  const fitbQs = (
    await prisma.fill_in_the_blanks_questions.findMany({
      ...stdQuery,
      include: {
        ...stdQuery.include,
        answers: {
          select: { answer: true },
          orderBy: { position: "asc" },
        },
      },
    })
  ).map(
    (q) =>
      ({
        ...extractCriticalDBQIntoTSQ(q),
        type: "fill-in-the-blanks",
        answer: q.answers.map((a) => a.answer),
      }) as FillInTheBlanksQuestion,
  );
  const tfQs = (
    await prisma.true_false_questions.findMany({
      ...stdQuery,
    })
  ).map(
    (q) =>
      ({
        ...extractCriticalDBQIntoTSQ(q),
        type: "true-false",
        answer: q.answer,
      }) as TrueFalseQuestion,
  );

  let obj;
  try {
    obj = await S3_CLIENT.send(makeS3GetbgImgForRoom(room.id));
  } catch (e) {
    if (e instanceof NoSuchKey) {
      obj = {};
    } else {
      throw e;
    }
  }

  let bgImgBlob;
  if (obj.Body) {
    const arr = await obj.Body.transformToByteArray();
    bgImgBlob = new Blob([new Uint8Array(arr)], {
      type: obj.ContentType || undefined,
    });
  }

  return {
    room,
    rooms,
    questions: [...shortAnsQs, ...mcQs, ...fitbQs, ...tfQs],
    timeLimitMinutes: room.timeLimitMinutes,
    bgImgBlob: bgImgBlob,
    imgSize: { width: room.bgImgWidth, height: room.bgImgHeight },
  };
}

async function saveData(latestData: {
  room: { id: string; name: string };
  timeLimitMinutes: number;
  bgImgBlob: Blob | null;
  questions: Question[];
  imgSize: { width: number; height: number };
}) {
  // Save image to S3 and image size to db
  if (latestData.bgImgBlob) {
    await S3_CLIENT.send(
      new PutObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
        Key: getRoomBgImgKey(latestData.room.id),
        Body: Buffer.from(await latestData.bgImgBlob.arrayBuffer()),
        ContentType: latestData.bgImgBlob.type || "",
      }),
    );
  }

  await prisma.rooms.upsert({
    where: { id: latestData.room.id },
    create: {
      id: latestData.room.id,
      name: latestData.room.name,
      bgImgWidth: latestData.imgSize.width,
      bgImgHeight: latestData.imgSize.height,
      timeLimitMinutes: latestData.timeLimitMinutes,
    },
    update: {
      name: latestData.room.name,
      bgImgWidth: latestData.imgSize.width,
      bgImgHeight: latestData.imgSize.height,
      timeLimitMinutes: latestData.timeLimitMinutes,
    },
  });

  // Save questions to postgres
  await deleteAllQuestionsInRoomInDB(latestData.room.id);

  for (const q of latestData.questions) {
    await prisma.questions.create({
      data: {
        id: q.id,
        center_x: q.position.centerX,
        center_y: q.position.centerY,
        type: convertTSQuestionTypeToDBType(q.type),
        room_id: latestData.room.id,
      },
    });

    // Add prompts
    for (let idx = 0; idx < q.prompt.length; idx++) {
      const p = q.prompt[idx];
      await prisma.prompts.create({
        data: {
          question_id: q.id,
          type: p.type,
          prompt: p.prompt,
          position: idx + 1,
        },
      });
    }

    if (q.type === "short-answer") {
      const saq = q as ShortAnswerQuestion;
      await prisma.short_answer_questions.create({
        data: {
          question_id: q.id,
          answer: saq.answer,
        },
      });
    } else if (q.type === "multiple-choice") {
      const mcq = q as MultipleChoiceQuestion;
      await prisma.multiple_choice_questions.create({
        data: {
          question_id: q.id,
        },
      });

      for (const c of mcq.choices) {
        await prisma.multiple_choice_choices.create({
          data: {
            question_id: q.id,
            text: c.text,
            is_correct: c.isCorrect,
          },
        });
      }
    } else if (q.type === "fill-in-the-blanks") {
      const fitbq = q as FillInTheBlanksQuestion;
      await prisma.fill_in_the_blanks_questions.create({
        data: { question_id: q.id },
      });

      for (let idx = 0; idx < fitbq.answer.length; idx++) {
        const a = fitbq.answer[idx];
        await prisma.fill_in_the_blanks_answers.create({
          data: {
            question_id: q.id,
            answer: a,
            position: idx + 1,
          },
        });
      }
    } else if (q.type === "true-false") {
      const tfq = q as TrueFalseQuestion;
      await prisma.true_false_questions.create({
        data: { question_id: q.id, answer: tfq.answer },
      });
    }
  }
}

export { loadData, saveData, deleteRoom, addOrUpdateRoom };
