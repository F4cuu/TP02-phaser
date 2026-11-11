import { crearBoton } from "./Boton.js";

// Escena de inicio: título, premisa, controles y botón para jugar
export default class Menu extends Phaser.Scene {
  constructor() {
    super("menu");
  }

  create() {
    const { width } = this.scale;
    this.cameras.main.setBackgroundColor("#2a2733");

    // Marco de ladrillos arriba y abajo, con el mismo tile de las paredes
    for (let x = 9; x < width; x += 18) {
      this.add.image(x, 9, "objetos", 6);
      this.add.image(x, 591, "objetos", 6);
    }

    this.add
      .text(width / 2, 110, "La Mazmorra\ndel Explorador", {
        fontFamily: "monospace",
        fontSize: "52px",
        color: "#ffd166",
        stroke: "#16141c",
        strokeThickness: 8,
        align: "center",
      })
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        240,
        "Un joven explorador entra en una mazmorra legendaria\n" +
          "para probar su valentía y conseguir sus tesoros.\n\n" +
          "Juntá al menos 5 ítems para abrir la puerta\n" +
          "y esquivá a los enemigos que custodian cada nivel.",
        { fontFamily: "monospace", fontSize: "17px", color: "#e8e4f0", align: "center", lineSpacing: 6 }
      )
      .setOrigin(0.5, 0);

    // Personaje e ítem de ejemplo
    this.add.sprite(width / 2 - 70, 400, "dude").setScale(1.4).play("right");
    this.add.image(width / 2 + 70, 410, "star").setScale(1.6);

    this.add
      .text(width / 2, 455, "Moverse: flechas del teclado", {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#b8b2c8",
      })
      .setOrigin(0.5);

    const empezar = () => this.scene.start("nivel1", { puntaje: 0 });
    crearBoton(this, width / 2, 520, "Jugar", empezar);
    this.input.keyboard.once("keydown-ENTER", empezar);
  }
}
