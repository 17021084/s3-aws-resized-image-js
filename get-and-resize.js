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

const perform = async () => {
  try {

    const commandGET = new GetObjectCommand({
      Bucket: "demo-pre-resize-image",
      Key: "TEST SHARP.JPG",
    });
    const {Body, ContentType} = await S3.send(commandGET);
    // transform to bytes array
    const image = await Body.transformToByteArray();

    //Resize images
    const imageBuffer = await Sharp(image)
      .resize({
        height: 100,
        width: 100,
      })
      .toBuffer();

    const commandPUT = new PutObjectCommand({
      Bucket: "resized-image-bucket",
      Key: "resized-image.png",
      Body: imageBuffer,
      ContentType
    });
    const updateImage = await S3.send(commandPUT);
    console.log(updateImage)

  } catch (error) {
    console.error(error);
  }
};


perform();
