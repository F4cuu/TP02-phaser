import Preload from "./scenes/Preload.js";
import Menu from "./scenes/Menu.js";
import Nivel1 from "./scenes/Nivel1.js";
import Nivel2 from "./scenes/Nivel2.js";
import Nivel3 from "./scenes/Nivel3.js";
import Victoria from "./scenes/Victoria.js";

// Configuración del juego
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  pixelArt: true, // evita que el pixel art se vea borroso al escalar
  backgroundColor: "#2a2733",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 }, // juego visto desde arriba: sin gravedad
      debug: false,
    },
  },
  // La primera escena de la lista es la que arranca
  scene: [Preload, Menu, Nivel1, Nivel2, Nivel3, Victoria],
};

window.game = new Phaser.Game(config);
