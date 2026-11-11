import BaseNivel from "./BaseNivel.js";

// Nivel 2: otro laberinto del tamaño de la pantalla, con enemigos (Mejora 1 y 3)
export default class Nivel2 extends BaseNivel {
  constructor() {
    super("nivel2", {
      mapa: "nivel2",
      siguiente: "nivel3",
      titulo: "Nivel 2",
    });
  }
}
