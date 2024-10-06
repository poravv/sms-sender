const express = require('express');
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

let port;
let modemDetected = false;
let modemPath = null;

// Función para detectar el módem
const detectModem = async () => {
    try {
        const ports = await SerialPort.list();
        const modemPorts = ports.filter(port => 
            port.manufacturer && port.manufacturer.includes('HUAWEI') && port.friendlyName.includes('PC')
        );

        if (modemPorts.length === 0) {
            if (modemDetected) {
                console.log('El módem fue desconectado.');
                modemDetected = false;
                if (port && port.isOpen) {
                    port.close(err => {
                        if (err) {
                            console.error('Error al cerrar el puerto:', err.message);
                        } else {
                            console.log('Puerto cerrado correctamente.');
                        }
                    });
                }
            }
            return;
        }

        if (!modemDetected || modemPath !== modemPorts[0].path) {
            modemPath = modemPorts[0].path;
            console.log(`Módem Huawei detectado en el puerto: ${modemPath}`);

            try {
                port = new SerialPort({ path: modemPath, baudRate: 9600, autoOpen: false });

                port.open((err) => {
                    if (!err) {
                        modemDetected = true;
                        console.log(`Módem conectado y abierto en el puerto: ${modemPath}`);

                        const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

                        port.on('error', (err) => {
                            console.error('Error en el puerto serial:', err.message);
                            modemDetected = false;
                        });

                        parser.on('data', (data) => {
                            console.log('Datos recibidos del módem: ', data);
                        });
                    } else {
                        console.error(`No se pudo abrir el puerto: ${modemPath}, error: ${err.message}`);
                    }
                });
            } catch (err) {
                console.error(`Error al intentar abrir el puerto: ${modemPath}, error: ${err.message}`);
            }
        }
    } catch (err) {
        console.error('Error al listar puertos seriales:', err.message);
    }
};

// Función para enviar SMS
const sendSMS = (phoneNumber, message) => {
    return new Promise((resolve, reject) => {
        console.log(`Iniciando envío de SMS al número ${phoneNumber}...`);

        if (!port || !modemDetected) {
            console.error('Error: No se ha detectado un módem activo.');
            return reject(new Error('No modem detected'));
        }

        port.write('AT+CMGF=1\r', (err) => {
            if (err) {
                console.error('Error al configurar el módem en modo SMS:', err.message);
                return reject(err);
            }
            console.log('Módem configurado en modo SMS.');

            setTimeout(() => {
                port.write(`AT+CMGS="${phoneNumber}"\r`, (err) => {
                    if (err) {
                        console.error(`Error al enviar comando CMGS: ${err.message}`);
                        return reject(err);
                    }

                    setTimeout(() => {
                        port.write(`${message}\x1A`, (err) => {
                            if (err) {
                                console.error(`Error al enviar el mensaje: ${err.message}`);
                                return reject(err);
                            }

                            console.log(`SMS enviado correctamente a ${phoneNumber}`);
                            resolve();
                        });
                    }, 1000);
                });
            }, 500);
        });
    });
};

// Endpoint para verificar el estado del módem
app.get('/modem-status', (req, res) => {
    const modemStatusMessage = modemDetected
        ? 'Módem detectado. Listo para enviar SMS.'
        : 'No se detectó el módem. Por favor, verifica la conexión.';

    res.json({ message: modemStatusMessage });
});

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint para enviar SMS desde un archivo CSV
app.post('/send-sms', upload.single('csvFile'), (req, res) => {
    console.log('Solicitud recibida para enviar SMS');
    if (!modemDetected) {
        return res.status(500).json({ message: 'No se puede enviar SMS porque no se detectó el módem.' });
    }

    const message = req.body.message; // Mensaje desde el formulario
    const csvFilePath = req.file.path; // Ruta del archivo CSV
    const includeMessageInCSV = req.body.includeMessageInCSV === 'on'; // Obtener el valor del checkbox

    console.log(`Procesando archivo CSV: ${csvFilePath}`);

    const phoneNumbers = [];

    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
            if (row.phone) {
                const phoneNumber = row.phone.trim(); // Limpiar el número
                phoneNumbers.push(phoneNumber);
                console.log(`Número detectado: ${phoneNumber}`);

                // Enviar SMS con el mensaje del CSV si se incluye
                if (includeMessageInCSV) {
                    const messageFromCSV = row.message ? row.message.trim() : message; // Usar el mensaje del CSV o el del formulario si no hay mensaje en el CSV
                    console.log(`Enviando mensaje a ${phoneNumber}: ${messageFromCSV}`);
                    sendSMS(phoneNumber, messageFromCSV)
                        .catch(err => console.error(`Error al enviar SMS a ${phoneNumber}:`, err.message));
                }
            }
        })
        .on('end', async () => {
            // Enviar SMS con el mensaje del formulario para aquellos que no tenían mensaje en el CSV
            if (!includeMessageInCSV) {
                for (const phoneNumber of phoneNumbers) {
                    try {
                        await sendSMS(phoneNumber, message);
                    } catch (err) {
                        console.error(`Error al enviar SMS a ${phoneNumber}:`, err.message);
                    }
                }
            }
            res.send('SMS enviados.');
        });
});




// Detectar el módem en intervalos regulares
setInterval(detectModem, 5000);  // Verifica cada 5 segundos

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
