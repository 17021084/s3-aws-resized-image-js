const Sharp = require("sharp");
const fs = require("fs");

Sharp("./test.JPG")
  .resize({
    height: 100,
    width: 100,
  })
  .toFile("./resized-image.jpeg", (err, info) => {
    console.log(err, info);
  });


// Buffer
async function bufferedImage() {
  try {
    const bufferImage = await Sharp("./test.JPG")
      .resize({
        height: 100,
        width: 100,
      })
      .toBuffer();
    await fs.writeFileSync("./buffer-way.png", bufferImage);
  } catch (error) {
    console.log(error);
  }
}
bufferedImage()
