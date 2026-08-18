import express from 'express';
import cors from 'cors';
import { fal } from '@fal-ai/client'; // Importación oficial corregida para entornos Node.js

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS y soporte para imágenes grandes en base64
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/api/generate-video', async (req, res) => {
  try {
    const { userImageBase64 } = req.body;
    
    if (!userImageBase64) {
      return res.status(400).json({ error: 'Falta la foto del usuario.' });
    }

    console.log("Iniciando petición al modelo Kling v1.5 en FAL.AI...");

    // Ejecución utilizando el cliente estándar y estructurado de FAL
    const result = await fal.run("fal-ai/kling/v1.5/image-to-video", {
      input: {
        image_url: "https://githubusercontent.com",
        image_tail_url: userImageBase64,
        prompt: "Cinematic dance video. A smooth high-quality transition from the professional dancer in the reference image into the user's face, performing an energetic contemporary dance choreography on stage. Realistic motion, 4k, cinematic lighting.",
        duration: "5"
      }
    });

    console.log("Respuesta cruda de FAL.AI recibida:", JSON.stringify(result));

    // Captura dinámica de cualquier variante de respuesta de video de FAL
    const finalVideoUrl = result?.video?.url || result?.video_url || (result?.outputs && result?.outputs[0]?.video_url);

    if (!finalVideoUrl) {
      throw new Error("FAL.AI procesó la solicitud pero no retornó un parámetro de video válido.");
    }

    res.json({ videoUrl: finalVideoUrl });

  } catch (error) {
    console.error("Error detectado en el flujo del backend:", error.message);
    res.status(500).json({ error: `Error en Kling/FAL.AI: ${error.message}` });
  }
});

// Escucha en interfaz de red universal requerida por Render
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor activo en red global en puerto ${PORT}`);
});
