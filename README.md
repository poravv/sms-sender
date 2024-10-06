# Pasos para activar el programa
1. Descargar e instalar nodejs
2. Instalar controlador del modem
3. Copiar repositorio
4. Instalar dependencias
5. Instalar pm2
```
npm install pm2 -g
``` 
- Para que arranque pm2 de manera automatica.
```
npm install pm2-windows-startup -g
```

```
pm2-startup install
```
- Iniciar la app con pm2
```
pm2 start index.js
```
- Guardar
```
pm2 save
```