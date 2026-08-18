import express from 'express';
import cors from 'cors';
import fal from '@fal-ai/serverless-client';

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración CORS explícita para evitar bloqueos del navegador del celular
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Soporte robusto para recibir imágenes en alta definición desde la cámara del celular
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

fal.config({
  credentials: process.env.FAL_KEY,
});

app.post('/api/generate-video', async (req, res) => {
  try {
    const { userImageBase64 } = req.body;
    
    if (!userImageBase64) {
      return res.status(400).json({ error: 'Falta la foto del usuario.' });
    }

    console.log("Iniciando petición al modelo Kling v1.5 en FAL.AI...");

    // Enlace corregido y estabilizado de la imagen de referencia del bailarín en GitHub
    const result = await fal.run("fal-ai/kling/v1.5/image-to-video", {
      input: {
        image_url: "https://githubusercontent.com",
        image_tail_url: userImageBase64,
        prompt: "Cinematic dance video. A smooth high-quality transition from the professional dancer in the reference image into the user's face, performing an energetic contemporary dance choreography on stage. Realistic motion, 4k, cinematic lighting.",
        duration: "5"
      }
    });

    console.log("Respuesta cruda de FAL.AI recibida con éxito.");

    const finalVideoUrl = result?.video?.url || result?.video_url || (result?.outputs && result?.outputs?.video_url);

    if (!finalVideoUrl) {
      throw new Error("FAL.AI no devolvió una URL de video válida.");
    }

    res.json({ videoUrl: finalVideoUrl });

  } catch (error) {
    console.error("Error en el flujo del backend:", error.message);
    res.status(500).json({ error: `Error en Kling/FAL.AI: ${error.message}` });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor activo en red global en puerto ${PORT}`);
});
