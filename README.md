# Tzolkin Forever

Homenaje móvil a Tzolkin, Labrador Retriever rubio y gran compañero durante 13 años. Sitio estático, sin cuentas ni dependencias externas.

## Añadir fotos y videos al álbum del QR

Coloca los archivos dentro de `media/` y añádelos a `media/manifest.json`. La página también permite previsualizar archivos desde un teléfono; esa selección es temporal y no se comparte con otros visitantes.

## Subtítulos sincronizados

El reproductor acepta un archivo JSON con frases autorizadas y marcas de tiempo en segundos. Edita `captions.json` para la versión publicada, o carga un JSON desde el botón **Subtítulos** para una vista previa local.

```json
{
  "version": 1,
  "cues": [
    { "start": 0, "end": 4.2, "en": "Authorized English line", "es": "Traducción autorizada al español" }
  ]
}
```

El texto aparece arriba del reproductor mientras la pista está en el intervalo indicado. La plantilla inicial está vacía.

## Música

El reproductor busca `assets/kiss-and-say-goodbye.mp3`. La copia local del MP3 compartido se excluye de Git para no redistribuir la grabación en el repositorio público. El sitio publicado necesita una pista que el responsable tenga permiso de publicar.
