import express from 'express';
import cors from 'cors';
import fal from '@fal-ai/serverless-client';

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración explícita de CORS y límites para Base64 pesados
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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

    console.log("Iniciando petición asincrónica al modelo Kling v1.5...");

    // Se codifica el espacio con '%20' para que internet lea la imagen del bailarín perfectamente
    // Se usa 'subscribe' que es el método nativo oficial de tu paquete para procesos largos
    const result = await fal.subscribe("fal-ai/kling/v1.5/image-to-video", {
      input: {
        image_url: "https://githubusercontent.com",
        image_tail_url: userImageBase64,
        prompt: "Cinematic dance video. A smooth high-quality transition from the professional dancer in the reference image into the user's face, performing an energetic contemporary dance choreography on stage. Realistic motion, 4k, cinematic lighting.",
        duration: "5"
      },
      logs: true
    });

    console.log("Petición completada con éxito en la IA.");

    const finalVideoUrl = result?.video?.url || result?.video_url || (result?.outputs && result?.outputs?.video_url);

    if (!finalVideoUrl) {
      throw new Error("La IA procesó correctamente pero el parámetro de video retornó vacío.");
    }

    res.json({ videoUrl: finalVideoUrl });

  } catch (error) {
    console.error("Error capturado en el backend:", error.message);
    res.status(500).json({ error: `Error en Kling/FAL.AI: ${error.message}` });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor activo en red global en puerto ${PORT}`);
});
