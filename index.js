const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Para permitir imágenes pesadas

const FOLDER = path.join(__dirname, 'cartas_recibidas');
if (!fs.existsSync(FOLDER)) fs.mkdirSync(FOLDER);

app.post('/enviar-carta', (req, res) => {
    const { nombre, imagen } = req.body;
    const base64Data = imagen.replace(/^data:image\/png;base64,/, "");
    const fileName = `carta_${nombre}_${Date.now()}.png`;

    fs.writeFile(path.join(FOLDER, fileName), base64Data, 'base64', (err) => {
        if (err) return res.status(500).send("Error al guardar");
        res.send("¡Carta recibida por los Snoppys!");
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
