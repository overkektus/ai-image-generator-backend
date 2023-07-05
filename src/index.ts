import express, { Request, Response } from "express";
import { Configuration, OpenAIApi } from "openai";
import axios from "axios";
import * as dotenv from "dotenv";
import fs from "fs/promises";
dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use("/images", express.static("images"));

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.get("/api/getChatGPTSuggestion", async (req: Request, res: Response) => {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt:
      "Write a random text prompt for DALL•E to generate an image, this prompt will be shown to the user, include details such as the genre and what type of painting it should be options can include: oil painting. watercolor, photo-realistic, 4k, abstract, modern, black and white etc. Do not wrap the answer in quotes.",
    max_tokens: 100,
    temperature: 0.8,
  });
  const responseText = response.data.choices[0].text;

  return res.send(responseText);
});

app.post("/api/generateImage", async (req: Request, res: Response) => {
  console.log(req.body);
  const { prompt } = req.body;

  const response = await openai.createImage({
    prompt,
    n: 1,
    size: "1024x1024",
  });

  const imageUrl = response.data.data[0].url!;
  const imageResponse = await axios.get(imageUrl, {
    responseType: "arraybuffer",
  });

  const arrayBuffer: ArrayBuffer = imageResponse.data;

  const timestamp = new Date().getTime();
  const fileName = `${prompt}_${timestamp}.png`;
  const buffer = Buffer.from(arrayBuffer);

  await fs.writeFile(`images/${fileName}`, buffer);

  return res.send({ body: "Successfully Uploaded Image" });
});

app.get("/api/getImages", async (req: Request, res: Response) => {
  const files = await fs.readdir("images");
  const imageUrls = files.map((fileName) => {
    const url = `${req.protocol}://${req.hostname}${
      process.env.NODE_ENV === "production" ? "" : `:${PORT}`
    }/images/${fileName}`;
    return {
      url,
      name: fileName,
    };
  });

  const sortedImageUrls = imageUrls.sort((a, b) => {
    const aName = Number(
      a.name.split("_").pop()?.toString().split(".").shift()
    );
    const bName = Number(
      b.name.split("_").pop()?.toString().split(".").shift()
    );
    return bName - aName;
  });

  return res.send({
    imageUrls: sortedImageUrls,
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});
