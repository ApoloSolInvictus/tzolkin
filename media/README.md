# Álbum de Tzolkin

Coloca aquí las fotos y los videos que quieres que aparezcan para todas las personas que abran el sitio. Luego agrega cada archivo a `manifest.json`.

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
      "alt": "Tzolkin jugando en el jardín",
      "label": "EN SERVICIO",
      "caption": ""
    }
  ]
}
```

La selección desde el botón de la página solo crea una vista previa en el teléfono que la hizo; no envía los archivos a internet. Para que el álbum del QR muestre una imagen, debe quedar dentro de esta carpeta y añadirse al manifiesto.
