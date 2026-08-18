import express from 'express';
import cors from 'cors';
import fal from '@fal-ai/serverless-client';

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de seguridad y límites de tamaño de imagen
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Vinculación de tu clave de FAL.AI
fal.config({
  credentials: process.env.FAL_KEY,
});

app.post('/api/generate-video', async (req, res) => {
  try {
    const { userImageBase64 } = req.body;
    
    if (!userImageBase64) {
      return res.status(400).json({ error: 'Falta la foto del usuario.' });
    }

    console.log("Iniciando procesamiento con Kling en FAL.AI...");

    // Llamada oficial estructurada para el modelo Kling v1.5
    const result = await fal.subscribe("fal-ai/kling/v1.5/image-to-video", {
      input: {
        image_url: "https://githubusercontent.com",
        image_tail_url: userImageBase64,
        prompt: "Cinematic dance video. A smooth high-quality transition from the professional dancer in the reference image into the user's face, performing an energetic contemporary dance choreography on stage. Realistic motion, 4k, cinematic lighting.",
        duration: "5"
      },
      logs: true
    });

    console.log("Video generado con éxito:", result.video?.url || result.video_url);
    
    const finalVideoUrl = result.video?.url || result.video_url || (result.outputs && result.outputs[0]?.video_url);

    if (!finalVideoUrl) {
      throw new Error("La API procesó la solicitud pero no devolvió ninguna URL de video.");
    }

    res.json({ videoUrl: finalVideoUrl });

  } catch (error) {
    console.error("Error crítico en el servidor:", error.message);
    res.status(500).json({ error: `Error en Kling/FAL.AI: ${error.message}` });
  }
});

// Forzar escucha en red global para Render
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor activo en red global en el puerto ${PORT}`);
});
