// Escena final: muestra el puntaje acumulado en los tres niveles
export default class Victoria extends Phaser.Scene {
  constructor() {
    super("victoria");
  }

  init(data) {
    this.puntaje = data.puntaje ?? 0;
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#1b4332");

    const titulo = this.add
      .text(width / 2, height / 2 - 90, "¡GANASTE!", {
        fontFamily: "monospace",
        fontSize: "64px",
        color: "#ffd166",
        stroke: "#081c15",
        strokeThickness: 8,
      })
      .setOrigin(0.5);
    this.tweens.add({ targets: titulo, scale: 1.08, duration: 600, yoyo: true, repeat: -1 });

    this.add
      .text(width / 2, height / 2 + 10, `Puntaje total: ${this.puntaje}`, {
        fontFamily: "monospace",
        fontSize: "32px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Estrellas girando a los costados del título
    [-230, 230].forEach((dx) => {
      const estrella = this.add.image(width / 2 + dx, height / 2 - 90, "star").setScale(2.5);
      this.tweens.add({ targets: estrella, angle: 360, duration: 3000, repeat: -1 });
    });
    // El personaje festeja
    this.add.sprite(width / 2, height / 2 + 190, "dude", 4).setScale(2);

    this.add
      .text(width / 2, height / 2 + 100, "Presioná ESPACIO para jugar de nuevo", {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#95d5b2",
      })
      .setOrigin(0.5);

    this.input.keyboard.once("keydown-SPACE", () => this.scene.start("nivel1", { puntaje: 0 }));
  }
}
