import express from 'express';
import cors from 'cors';
import fal from '@fal-ai/serverless-client';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Servir la carpeta public de forma estática (El Proxy unificado)
app.use(express.static(path.join(__dirname, 'public')));

fal.config({
  credentials: process.env.FAL_KEY,
});

// Ruta de procesamiento interno de la IA
app.post('/api/generate-video', async (req, res) => {
  try {
    const { userImageBase64 } = req.body;
    
    if (!userImageBase64) {
      return res.status(400).json({ error: 'Falta la foto del usuario.' });
    }

    console.log("Iniciando petición al modelo Kling v1.5 en FAL.AI...");

    const result = await fal.subscribe("fal-ai/kling/v1.5/image-to-video", {
      input: {
        image_url: userImageBase64,
        prompt: "Cinematic performance video. The person in the image is transformed into a spectacular vedette dancer, wearing an exquisite professional carnival costume with massive colorful feathers and sparkling sequins. Performing an energetic and glamorous choreography on a theater stage with dramatic cinematic lighting, 4k, realistic movement.",
        duration: "5"
      },
      logs: true
    });

    const finalVideoUrl = result?.video?.url || result?.video_url || (result?.outputs && result?.outputs?.video_url);

    if (!finalVideoUrl) {
      throw new Error("La IA no devolvió un archivo de video válido.");
    }

    res.json({ videoUrl: finalVideoUrl });

  } catch (error) {
    console.error("Error en el backend:", error.message);
    res.status(500).json({ error: `Error en Kling/FAL.AI: ${error.message}` });
  }
});

// Ruta comodín para que siempre sirva el index.html en la raíz
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor unificado corriendo en puerto ${PORT}`);
});
