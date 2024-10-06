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


## En caso de que aplique
### Pasos para habilitar la ejecución de scripts en PowerShell
- Abrir PowerShell como administrador:

- Busca "PowerShell" en el menú de inicio, haz clic derecho sobre él y selecciona "Ejecutar como administrador".
Verificar la política de ejecución actual:

Copiar código
```
Get-ExecutionPolicy
```

Cuando habiliten los comandos introducir los siguientes.

- Cambiar la política de ejecución:

Para permitir la ejecución de scripts, puedes cambiar la política a RemoteSigned o Unrestricted. Usa uno de los siguientes comandos:
powershell
Copiar código
```
Set-ExecutionPolicy RemoteSigned
```

powershell
Copiar código
```
Set-ExecutionPolicy Unrestricted
```
Se te pedirá confirmar el cambio. Escribe Y y presiona Enter.
Cerrar PowerShell:

Después de cambiar la política, cierra la ventana de PowerShell.
Volver a intentar el comando:

Ahora intenta ejecutar tu comando pm2 nuevamente:
powershell
Copiar código
pm2 start index.js