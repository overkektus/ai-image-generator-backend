import express, { Request, Response } from "express";
import * as dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";
dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

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

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});
