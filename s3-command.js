// document https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/command/GetObjectCommand/
// import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";  // must change file .js -> .mjs
const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");
require("dotenv").config();
const fs = require("fs");
const Sharp = require("sharp");

// This is bad practices.  Just for testing purposes. in real world, we use the we role instead
const S3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const input = {
  Bucket: "demo-pre-resize-image",
  Key: "TEST SHARP.JPG",
};

//get command
const getObjectFromS3AndSaveToLocal = async (desPath) => {
  try {
    const command = new GetObjectCommand(input);
    const response = await S3.send(command);
    // Body is StreamingBlob
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/command/GetObjectCommand/#:~:text=Body-,StreamingBlobPayloadOutputTypes,-Throws
    await new Promise((resolve, reject) => {
      response.Body.pipe(fs.createWriteStream(desPath))
        .on("error", (error) => reject(error))
        .on("close", () => resolve());
    });
  } catch (error) {
    console.log(error);
  }
};

// getObjectFromS3AndSaveToLocal("downloaded-image-s3.png");

const imageResizer = Sharp().resize({ height: 100, width: 100 });
const getObjectFromS3AndReSizeToLocal = async (desPath) => {
  try {
    const command = new GetObjectCommand(input);
    const response = await S3.send(command);
    await new Promise((resolve, reject) => {
      response.Body.pipe(imageResizer)
        .pipe(fs.createWriteStream(desPath))
        .on("error", (error) => reject(error))
        .on("close", () => resolve());
    });
  } catch (error) {
    console.log(error);
  }
};

// getObjectFromS3AndReSizeToLocal("downloaded-image-s3-resized.png");

// ================================================================
// Read file from local and put it in s3
//https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/command/PutObjectCommand/

const uploadLocalFileToS3 = async (srcPath) => {
  const stream = fs.createReadStream(srcPath);
  try {
    const command = new PutObjectCommand({
      Bucket: "demo-pre-resize-image",
      Key: "test update by put.JPG",
      Body: stream,
    });
    const response = await S3.send(command);
  } catch (error) {
    console.log(error);
  } finally {
    stream.close();
  }
};

// uploadLocalFileToS3("./test.jpg");



const resizeImageUploadToS3 = async (srcPath) => {
  const stream = fs.createReadStream(srcPath).pipe(imageResizer);

  try {
    const imageData = await new Promise((resolve, reject) => {
      const stream = fs.createReadStream(srcPath).pipe(imageResizer);
      stream.on("error", function (error) {
        reject(error);
      });
      stream.on("close", () => {});
      resolve(stream);
    });
    console.log("size", imageData)
    const command = new PutObjectCommand({
      Bucket: "demo-pre-resize-image",
      Key: "test 2.JPG",
      Body: imageData,
    });
    // const response = await S3.send(command);
  } catch (error) {
    console.log(error);
  }
};

resizeImageUploadToS3("./test.jpg");
