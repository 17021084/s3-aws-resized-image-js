const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3"); // AWSのS3用ライブラリ
const fs = require("fs"); // ファイルを読み込むのため
require("dotenv").config();

const DEMO_BUCKET = "demo-pre-resize-image";

// 認証の設定
//こちらの仕方はベストプラクティスではない
const S3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// ローカルのファイルを読み込んでS3にアップロードします
// *srcPath: ローカルに保存しているファイルのパス
// *fileName: S3でファイル名を決める
// *バッケット名

const uploadLocalFileToS3 = async (srcPath, fileName, bucketName) => {
  //ストリームを開ける
  const readStream = fs.createReadStream(srcPath);
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: readStream,
    });
    await S3.send(command);
  } catch (error) {
    console.log(error);
  } finally {
    //ストリームを閉める
    readStream.close();
  }
};

// uploadLocalFileToS3('./for-demo.png','test1.png',DEMO_BUCKET)



// S3に保存してるファイルをダウンロード
// *desPath: ローカルに保存する予定のファイルのパス
// *fileName: S3でファイル名
// *バッケット名

const downloadFileFromS3ToLocal = async (desPath, fileName, bucketName) => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileName,
    });
    const response = await S3.send(command);
    response.Body.pipe(fs.createWriteStream(desPath))
      .on("error", (error) => {
        throw error;
      })
      .on("close", () => {
        console.log("completed");
      });
  } catch (error) {
    console.log("error", error);
  }
};

downloadFileFromS3ToLocal("./downloaded/image_s3.png", "test1.png", DEMO_BUCKET);










// Body is StreamingBlob
// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/command/GetObjectCommand/#:~:text=Body-,StreamingBlobPayloadOutputTypes,-Throws
