# Álbum de Tzolkin

El álbum ya está ordenado por el número de cada archivo. Los videos se muestran a su duración original; las fotos comparten por igual el tiempo restante de la canción para que la última imagen y la música terminen juntas.

El MP3 dura 272.562 segundos (4:32 en el reproductor). Con los 3 videos medidos y las 21 fotos, a cada fotografía le corresponden aproximadamente 12.05 segundos.

Ejemplo:

```json
{
  "items": [
    {
      "type": "image",
      "src": "media/tzolkin-en-la-playa.jpg",
      "alt": "Tzolkin junto al mar",
      "label": "UN DÍA JUNTOS",
      "caption": "Una frase breve para acompañar este recuerdo."
    },
    {
      "type": "video",
      "src": "media/tzolkin-jugando.mp4",
      "durationSec": 9.7,
      "alt": "Tzolkin jugando en el jardín",
      "label": "EN SERVICIO",
      "caption": ""
    }
  ]
}
```

La selección desde el botón de la página solo crea una vista previa en el teléfono que la hizo; no envía los archivos a internet. Para que el álbum del QR muestre un recuerdo, el archivo debe quedar dentro de esta carpeta y añadirse al manifiesto.
