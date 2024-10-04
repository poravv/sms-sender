# Pasos a Seguir
## Instala una Aplicación SMS Gateway:

Busca e instala una aplicación que funcione como SMS Gateway en tu dispositivo Android. Algunas opciones populares son:
SMS Gateway API
SMS Gateway
Estas aplicaciones generalmente te permiten recibir solicitudes HTTP y enviarlas como SMS.
Configura la Aplicación:

Abre la aplicación y configura los ajustes, como el puerto en el que estará escuchando las solicitudes, la autenticación (si es necesario), y asegúrate de que tenga los permisos necesarios para enviar SMS.
Toma nota de la dirección IP y el puerto que utilizarás para enviar SMS desde tu aplicación Node.js.



# Pasos para Usar tu Android como Módem
## Habilitar la Depuración USB:

Ve a Ajustes > Acerca del teléfono.
Toca varias veces en Número de compilación hasta que veas un mensaje que dice que las opciones de desarrollador están habilitadas.
Regresa a Ajustes, y busca Opciones de desarrollador.
Activa Depuración USB.
Conectar el Teléfono a la Computadora:

Conecta tu teléfono a tu computadora mediante un cable USB.
Usar Aplicaciones para Enviar SMS:

Puedes usar aplicaciones que permitan el envío de SMS desde tu computadora a través de tu teléfono. Algunas de estas aplicaciones permiten recibir comandos a través de un puerto serial, similar a un módem.
Ejemplos de aplicaciones son:
"SMS Gateway": Permite que tu aplicación Node.js envíe mensajes a través de la interfaz de la aplicación.
"KDE Connect" o "Pushbullet": Permiten interacciones con el teléfono, aunque su uso puede variar.

```
brew install --cask android-platform-tools
```

```
adb devices
```