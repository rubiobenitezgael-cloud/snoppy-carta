const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const https = require('https'); // Para hablar con Telegram

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- CONFIGURACIÓN DE TELEGRAM ---
const TELEGRAM_TOKEN = "8514200391:AAH8G53x4pVBnUw96l3xFPO4P8RbQVLpSPQ";
const TELEGRAM_CHAT_ID = "7083988483";

app.post('/enviar-carta', (req, res) => {
    const { nombre, imagen } = req.body;
    const base64Data = imagen.replace(/^data:image\/png;base64,/, "");
    const fileName = `carta_${nombre}_${Date.now()}.png`;
    const filePath = path.join(__dirname, fileName);

    // 1. Guardar temporalmente para poder enviarla
    fs.writeFile(filePath, base64Data, 'base64', (err) => {
        if (err) return res.status(500).send("Error");

        // 2. ENVIAR A TELEGRAM (Como foto)
        enviarATelegram(filePath, nombre);

        res.send("¡Recibida por los Snoppys!");
    });
});

function enviarATelegram(pathImagen, nombrePersona) {
    const formDataBoundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const filename = path.basename(pathImagen);
    
    const options = {
        method: 'POST',
        host: 'api.telegram.org',
        path: `/bot${TELEGRAM_TOKEN}/sendPhoto`,
        headers: { 'Content-Type': `multipart/form-data; boundary=${formDataBoundary}` }
    };

    const req = https.request(options, (res) => {
        res.on('data', () => {
            // Borrar archivo después de enviar para no llenar el servidor
            fs.unlinkSync(pathImagen);
        });
    });

    // Construir el cuerpo del mensaje para Telegram
    req.write(`--${formDataBoundary}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n${TELEGRAM_CHAT_ID}\r\n`);
    req.write(`--${formDataBoundary}\r\nContent-Disposition: form-data; name="caption"\r\n\r\n¡Nueva carta de ${nombrePersona}! 🐶🎄\r\n`);
    req.write(`--${formDataBoundary}\r\nContent-Disposition: form-data; name="photo"; filename="${filename}"\r\nContent-Type: image/png\r\n\r\n`);
    
    const fileStream = fs.createReadStream(pathImagen);
    fileStream.pipe(req, { end: false });
    fileStream.on('end', () => {
        req.write(`\r\n--${formDataBoundary}--\r\n`);
        req.end();
    });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor listo`));
