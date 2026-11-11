// Cuadros de cada alien dentro de tilemap-characters_packed.png
export const ALIENS = [
  [0, 1],
  [2, 3],
  [4, 5],
  [6, 7],
  [9, 10],
];

// Carga todos los recursos una sola vez y crea las animaciones compartidas
export default class Preload extends Phaser.Scene {
  constructor() {
    super("preload");
  }

  preload() {
    this.add
      .text(400, 300, "Cargando...", { fontSize: "24px", color: "#ffd166" })
      .setOrigin(0.5);

    // Mapas hechos en Tiled
    this.load.tilemapTiledJSON("nivel1", "public/assets/tilemap/nivel1.json");
    this.load.tilemapTiledJSON("nivel2", "public/assets/tilemap/nivel2.json");
    this.load.tilemapTiledJSON("nivel3", "public/assets/tilemap/nivel3.json");

    // El mismo PNG se usa como tileset del mapa y como spritesheet (puerta de llegada y candado)
    this.load.image("tiles", "public/assets/tilemap_packed.png");
    this.load.spritesheet("objetos", "public/assets/tilemap_packed.png", {
      frameWidth: 18,
      frameHeight: 18,
    });

    // Sprites del proyecto
    this.load.spritesheet("dude", "public/assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
    this.load.image("star", "public/assets/star.png");
    // Aliens para los enemigos (cada uno tiene 2 cuadros de animación)
    this.load.spritesheet("aliens", "public/assets/tilemap-characters_packed.png", {
      frameWidth: 24,
      frameHeight: 24,
    });
  }

  create() {
    // Las animaciones son globales: se crean acá y se usan en todos los niveles
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 20,
    });
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });
    // Una animación por alien: verde, azul, rosa, amarillo y beige
    ALIENS.forEach(([a, b], i) => {
      this.anims.create({
        key: `alien${i}`,
        frames: this.anims.generateFrameNumbers("aliens", { frames: [a, b] }),
        frameRate: 6,
        repeat: -1,
      });
    });

    this.scene.start("menu");
  }
}
