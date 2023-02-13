import express from "express";
import { Configuration, OpenAIApi } from "openai";
import { config } from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";

config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI,
});
const openai = new OpenAIApi(configuration);

async function getUrls(prompt: string) {
  const response = await openai.createImage({
    prompt,
    n: 10,
    size: "512x512",
  });
  return response.data.data;
}

const app = express();

app.set("trust proxy", 1);
app.use(cors({ origin: "*" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.post("/", async (req, res) => {
  const prompt = req.body?.text || "Tiny sweet cat";
  console.log(req.body);

  res.send(await getUrls(prompt));
});

app.listen(8080, () => {
  console.log("The application is listening on port 3000!");
});
