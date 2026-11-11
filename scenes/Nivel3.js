import BaseNivel from "./BaseNivel.js";

// Nivel 3: laberinto más grande que la pantalla, con cámara que sigue al jugador (Mejora 2)
export default class Nivel3 extends BaseNivel {
  constructor() {
    super("nivel3", {
      mapa: "nivel3",
      siguiente: "victoria",
      titulo: "Nivel 3",
    });
  }
}
