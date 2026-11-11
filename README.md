# La Mazmorra del Explorador – TP-02 Phaser 3

Juego de aventura en pixel art hecho con **Phaser 3** para practicar **tilemaps** y **cámaras**.

**Jugar online:** https://f4cuu.github.io/TP02-phaser/

> Un joven explorador, cuyo sueño es convertirse en el mejor explorador del mundo, se aventura en una legendaria y peligrosa mazmorra para probar su valentía y conseguir los tesoros que allí se ocultan.

Recorré la mazmorra, juntá ítems y llegá a la puerta. La puerta tiene candado hasta que juntes **al menos 5 ítems**.

## Cómo jugar

| Tecla | Acción |
| --- | --- |
| Flechas (o WASD) | Moverse |
| R | Reiniciar el nivel |
| Enter | Jugar / volver a jugar (también con el botón) |

- Cada ítem (estrella) suma **10 puntos**. El contador está arriba a la izquierda.
- Al tocar la puerta con 5 o más ítems pasás al siguiente nivel **conservando el puntaje**.
- Si un enemigo te toca, el nivel se reinicia con el puntaje que tenías al entrar.

## Niveles

| Nivel | Mapa | Qué agrega |
| --- | --- | --- |
| 1 | 43×31 tiles (entra en pantalla) | Laberinto, ítems y puerta de llegada |
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
  Menu.js                  escena de inicio con la premisa y el botón Jugar
  Boton.js                 botón reutilizable
  BaseNivel.js             lógica común: mapa, jugador, ítems, puerta, enemigos, cámara, HUD
  Nivel1.js, Nivel2.js, Nivel3.js   cada nivel indica su mapa y la escena siguiente
  Victoria.js              escena de victoria con el puntaje total y botón para volver a jugar
public/assets/
  dude.png                 spritesheet del jugador (animaciones left / turn / right)
  star.png                 estrella recolectable
  tilemap-characters_packed.png   aliens de los enemigos (Kenney – Pixel Platformer, CC0)
  tilemap_packed.png       tileset de los mapas y spritesheet de la puerta y el candado (Kenney – Pixel Platformer, CC0)
  tilemap/nivel1.json, nivel2.json, nivel3.json   mapas de Tiled
```

## Editar los mapas en Tiled

Cada mapa tiene tres capas:

- **Fondo**: capa de decoración sin colisión (vacía por ahora).
- **Paredes**: los tiles con la propiedad `esColisionable = true` bloquean al jugador y a los enemigos.
- **Objetos**: puntos con nombre `jugador` (inicio) y `llegada` (puerta), y puntos de tipo `estrella` y `enemigo`.

## Correr el juego

Abrí la carpeta en VS Code y usá **Live Server** (puerto 5501, ya configurado en `.vscode/settings.json`), o cualquier servidor local. Abrir el `index.html` con doble clic no funciona, porque el navegador bloquea la carga de los mapas.

## GDD

| Sección | Cómo se implementa |
| --- | --- |
| Concepto | El personaje recolecta ítems en un laberinto |
| 6. Escena de juego | El personaje aparece en la esquina superior izquierda del laberinto |
| 6.1 | Contador de ítems en la esquina superior izquierda |
| 6.2 | Al tocar la salida con al menos 5 ítems se pasa al siguiente nivel |
| 7. Escena de victoria | Muestra el puntaje total y un botón para volver a jugar |
| 8. Controles | Flechas del teclado |
| 9. Elementos | Paredes, llegada (puerta), ítems (estrellas), personaje (dude) y enemigos (aliens) |
