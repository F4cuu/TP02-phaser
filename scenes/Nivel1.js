import BaseNivel from "./BaseNivel.js";

// Nivel 1: laberinto del tamaño de la pantalla, sin enemigos
export default class Nivel1 extends BaseNivel {
  constructor() {
    super("nivel1", {
      mapa: "nivel1",
      siguiente: "nivel2",
      titulo: "Nivel 1",
    });
  }
}
