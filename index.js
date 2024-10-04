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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let port;
let modemDetected = false;

// Función para detectar el módem Huawei Mobile Connect
const detectModem = async () => {
    try {
        const ports = await SerialPort.list();
        const modemPorts = ports.filter(port => 
            port.manufacturer && port.manufacturer.includes('Huawei') &&
            port.path.includes('COM')
        );

        if (modemPorts.length === 0) {
            console.error('No se detectó ningún módem Huawei.');
            return;
        }

        for (const portInfo of modemPorts) {
            console.log(`Probing port: ${portInfo.path}`);

            try {
                port = new SerialPort({ path: portInfo.path, baudRate: 9600, autoOpen: false });
                
                port.open((err) => {
                    if (!err) {
                        modemDetected = true;
                        console.log(`Módem Huawei detectado en el puerto: ${portInfo.path}`);

                        const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

                        port.on('error', (err) => {
                            console.error('Error en el puerto serial:', err.message);
                            modemDetected = false;
                        });

                        parser.on('data', (data) => {
                            console.log('Data from modem: ', data);
                        });
                    } else {
                        console.error(`No se pudo abrir el puerto: ${portInfo.path}, error: ${err.message}`);
                    }
                });

                if (modemDetected) break;
            } catch (err) {
                console.error(`Error al intentar abrir el puerto: ${portInfo.path}, error: ${err.message}`);
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
                console.log('Chequeando señal con AT+CSQ...');
                port.write('AT+CSQ\r', (err) => {
                    if (err) {
                        console.error('Error al verificar señal:', err.message);
                        return reject(err);
                    }

                    setTimeout(() => {
                        console.log('Verificando estado de registro con AT+CREG?...');
                        port.write('AT+CREG?\r', (err) => {
                            if (err) {
                                console.error('Error al verificar estado de registro:', err.message);
                                return reject(err);
                            }

                            setTimeout(() => {
                                console.log(`Preparando para enviar SMS a ${phoneNumber}...`);
                                port.write(`AT+CMGS="${phoneNumber}"\r`, (err) => {
                                    if (err) {
                                        console.error(`Error al enviar comando CMGS: ${err.message}`);
                                        return reject(err);
                                    }

                                    setTimeout(() => {
                                        console.log(`Enviando mensaje: "${message}" a ${phoneNumber}`);
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
                    }, 500);
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
        console.log('No se detectó el módem, no se puede enviar SMS.');
        return res.status(500).json({ message: 'No se puede enviar SMS porque no se detectó el módem.' });
    }

    const message = req.body.message;
    const csvFilePath = req.file.path;

    console.log(`Procesando archivo CSV: ${csvFilePath}`);

    const phoneNumbers = [];

    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
            if (row.phone) {
                phoneNumbers.push(row.phone);
                console.log(`Número detectado: ${row.phone}`);
            }
        })
        .on('end', async () => {
            console.log('Todos los números de teléfono han sido leídos del archivo CSV.');
            for (const phoneNumber of phoneNumbers) {
                try {
                    await sendSMS(phoneNumber, message);
                } catch (err) {
                    console.error(`Error al enviar SMS a ${phoneNumber}:`, err.message);
                }
            }
            res.send('SMS enviados.');
        });
});

// Detectar el módem al iniciar la aplicación
detectModem();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
