import { crearBoton } from "./Boton.js";

// Escena de victoria: el explorador salió de la mazmorra con los tesoros
export default class Victoria extends Phaser.Scene {
  constructor() {
    super("victoria");
  }

  init(data) {
    this.puntaje = data.puntaje ?? 0;
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#2a2733");

    const titulo = this.add
      .text(width / 2, height / 2 - 140, "¡GANASTE!", {
        fontFamily: "monospace",
        fontSize: "64px",
        color: "#ffd166",
        stroke: "#16141c",
        strokeThickness: 8,
      })
      .setOrigin(0.5);
    this.tweens.add({ targets: titulo, scale: 1.08, duration: 600, yoyo: true, repeat: -1 });

    this.add
      .text(width / 2, height / 2 - 70, "El explorador salió de la mazmorra con sus tesoros", {
        fontFamily: "monospace",
        fontSize: "17px",
        color: "#e8e4f0",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 10, `Puntaje total: ${this.puntaje}`, {
        fontFamily: "monospace",
        fontSize: "32px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Estrellas girando a los costados del título
    [-230, 230].forEach((dx) => {
      const estrella = this.add.image(width / 2 + dx, height / 2 - 140, "star").setScale(2.5);
      this.tweens.add({ targets: estrella, angle: 360, duration: 3000, repeat: -1 });
    });

    // El personaje festeja
    this.add.sprite(width / 2, height / 2 + 75, "dude", 4).setScale(2);

    const reiniciar = () => this.scene.start("menu");
    crearBoton(this, width / 2, height / 2 + 175, "Volver a jugar", reiniciar);
    this.input.keyboard.once("keydown-ENTER", reiniciar);
  }
}
