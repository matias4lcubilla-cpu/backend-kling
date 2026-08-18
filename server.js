import express from 'express';
import cors from 'cors';
import fal from "@fal-ai/serverless-client"; // <-- Importación corregida sin llaves

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

fal.config({
  credentials: process.env.FAL_KEY,
});

app.post('/api/generate-video', async (req, res) => {
  try {
    const { userImageBase64 } = req.body;
    if (!userImageBase64) return res.status(400).json({ error: 'Falta la foto.' });

    console.log("Enviando a FAL.AI con Kling...");

    // Llamada directa usando fal.subscribe
    const result = await fal.subscribe("fal-ai/kling/v1.5/image-to-video", {
      input: {
        image_url: "https://githubusercontent.com", 
        image_tail_url: userImageBase64, 
        prompt: "A smooth cinematic transition to the user's face, high quality, 4k",
        duration: "4",
      }
    });

    res.json({ videoUrl: result.video.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en Kling/FAL.AI" });
  }
});

app.listen(PORT, () => console.log(`Servidor activo`));
