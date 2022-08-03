import express from "express";
import dotenv from "dotenv";
import { createClient } from "redis";
import axios from "axios";

dotenv.config();

const app = express();
app.use(express.json());

const client = createClient();

client.on("error", (err) => console.log("Redis Client Error", err));

await client.connect();

const PORT = process.env.PORT || 50008;

app.post("/", async (req, res) => {
  const { key, value } = req.body;
  const response = await client.set(key, value);
  const output = await client.get(key);
  res.json(output);
});

app.get("/posts/:id", async (req, res) => {
  const { id } = req.params;

  const cachedPost = await client.get(`post-${id}`);

  if (cachedPost){return res.json(JSON.parse(cachedPost));}

  const response = await axios.get(
    `https://jsonplaceholder.typicode.com/posts/${id}`
  );

  client.set(`post-${id}`, JSON.stringify(response.data))
  res.json(response.data);
});

app.listen(PORT, () => {
  console.log(`Listening to ${PORT}`);
});
