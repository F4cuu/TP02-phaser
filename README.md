# Laberinto – TP-02 Phaser 3

Juego de laberinto visto desde arriba hecho con **Phaser 3** para practicar **tilemaps** y **cámaras**.

**Jugar online:** https://f4cuu.github.io/TP02-phaser/

Recorré el laberinto, juntá estrellas y llegá a la bandera. La bandera solo te deja pasar si juntaste **al menos 5 estrellas**.

## Cómo jugar

| Tecla | Acción |
| --- | --- |
| Flechas / WASD | Moverse |
| R | Reiniciar el nivel |
| Espacio | Volver a jugar (en la pantalla de victoria) |

- Cada estrella suma **10 puntos**.
- Al tocar la bandera con 5 o más estrellas pasás al siguiente nivel **conservando el puntaje**.
- Si un enemigo te toca, el nivel se reinicia con el puntaje que tenías al entrar.

## Niveles

| Nivel | Mapa | Qué agrega |
| --- | --- | --- |
| 1 | 43×31 tiles (entra en pantalla) | Laberinto, estrellas y bandera de llegada |
| 2 | 43×31 tiles (entra en pantalla) | Nuevo mapa, puntaje transportado (Mejora 1) y enemigos (Mejora 3) |
| 3 | 100×76 tiles (1800×1368 px) | Mapa más grande que la pantalla, la cámara sigue al jugador (Mejora 2) |

### Enemigos (Mejora 3)

Los enemigos se colocan en Tiled como objetos de tipo `enemigo`. Al empezar el nivel, cada uno mira cuánto espacio libre tiene a los costados y arriba/abajo, y se mueve en el eje con más lugar:

- **Horizontal**: va y viene de izquierda a derecha.
- **Vertical**: va y viene de arriba a abajo.

Cada enemigo toma al azar el aspecto de uno de los 5 aliens de `tilemap-characters_packed.png`.

Se puede forzar la dirección agregándole al objeto la propiedad `movimiento` = `horizontal` o `vertical`.

## Estructura

```
index.html
main.js                    configuración del juego y lista de escenas
scenes/
  Preload.js               carga de recursos y animaciones
  BaseNivel.js             lógica común: mapa, jugador, estrellas, llegada, enemigos, cámara, HUD
  Nivel1.js, Nivel2.js, Nivel3.js   cada nivel indica su mapa y la escena siguiente
  Victoria.js              pantalla final con el puntaje total
public/assets/
  dude.png                 spritesheet del jugador (animaciones left / turn / right)
  star.png                 estrella recolectable
  tilemap-characters_packed.png   aliens de los enemigos (Kenney – Pixel Platformer, CC0)
  tilemap_packed.png       tileset de los mapas y spritesheet de la bandera (Kenney – Pixel Platformer, CC0)
  tilemap/nivel1.json, nivel2.json, nivel3.json   mapas de Tiled
```

## Editar los mapas en Tiled

Cada mapa tiene tres capas:

- **Fondo**: decoración sin colisión.
- **Paredes**: los tiles con la propiedad `esColisionable = true` bloquean al jugador y a los enemigos.
- **Objetos**: puntos con nombre `jugador` (inicio) y `llegada` (bandera), y puntos de tipo `estrella` y `enemigo`.

## Correr el juego

Abrí la carpeta en VS Code y usá **Live Server** (puerto 5501, ya configurado en `.vscode/settings.json`), o cualquier servidor local. Abrir el `index.html` con doble clic no funciona, porque el navegador bloquea la carga de los mapas.
