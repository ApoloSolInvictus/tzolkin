# Tzolkin Forever

Homenaje móvil a Tzolkin, Labrador Retriever rubio y gran compañero durante 13 años. Sitio estático, sin cuentas ni dependencias externas.

## Añadir fotos y videos al álbum del QR

El álbum incluye 21 fotos y 3 videos en el orden numérico enviado. Los videos duran 9.734 s, 4.767 s y 4.962 s. Cada foto ocupa el mismo tramo del tiempo restante de la pista; así, la última foto termina junto con la canción. La página también permite previsualizar otros archivos desde un teléfono; esa selección es temporal y no se comparte con otros visitantes.

## Subtítulos sincronizados

`captions.json` contiene los subtítulos bilingües y sus marcas de tiempo. El texto que compartiste está sincronizado con la pista; también puedes cargar otro archivo JSON desde **Subtítulos** para una vista previa local.

```json
{
  "version": 1,
  "cues": [
    { "start": 0, "end": 4.2, "en": "Authorized English line", "es": "Traducción autorizada al español" }
  ]
}
```

El texto aparece arriba del reproductor durante cada intervalo. Los tiempos de entrada se basan en una referencia LRC; el álbum se ajusta a la duración real del MP3.

## Música

El reproductor usa `assets/kiss-and-say-goodbye.mp3`, la copia proporcionada por el responsable del homenaje. La reproducción comienza cuando se toca el botón; las fotos y los videos avanzan con la canción y terminan al mismo tiempo.
