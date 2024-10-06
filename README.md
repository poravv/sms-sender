# Levantar App

```
docker-compose up -d
```

# Paso a Paso para Configurar un Host en Windows y Redirigir a localhost:3000

## 1. Abrir el archivo `hosts`

### Ubicación del archivo `hosts`:
El archivo `hosts` en Windows se encuentra en la siguiente ruta:

### Cómo editar el archivo:

1. Abre el **Bloc de notas** como administrador:
   - Haz clic en el botón de **Inicio** y escribe `Bloc de notas`.
   - Haz clic derecho en el resultado y selecciona **Ejecutar como administrador**.
   
2. Dentro del Bloc de notas, ve a **Archivo** > **Abrir**.

3. Navega a la ruta:

4. En el campo de tipo de archivo, selecciona **Todos los archivos** para poder ver el archivo `hosts`.

5. Selecciona el archivo `hosts` y haz clic en **Abrir**.

---

## 2. Editar el archivo `hosts`

1. Una vez abierto el archivo `hosts`, agrega la siguiente línea al final del archivo:
```
127.0.0.1   sms.sender.net
```

3. Guardar el archivo
Guarda el archivo (asegúrate de estar en el modo de administrador, o no podrás guardarlo).
4. Configurar el puerto 3000
Si tu aplicación está corriendo en el puerto 3000 de localhost, no necesitas hacer ningún cambio adicional en la configuración del puerto.

Sin embargo, si tu aplicación no está corriendo, asegúrate de que la aplicación esté ejecutándose en el puerto 3000.

5. Probar la configuración
Abre un navegador y escribe:
```
http://sms.sender.net:3000
```

