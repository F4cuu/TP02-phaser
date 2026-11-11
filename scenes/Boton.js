// Botón simple reutilizable: rectángulo + texto, clickeable y con hover
export function crearBoton(escena, x, y, texto, alHacerClic) {
  const fondo = escena.add
    .rectangle(x, y, 240, 54, 0x6b3e26)
    .setStrokeStyle(3, 0xffd166)
    .setInteractive({ useHandCursor: true });
  const etiqueta = escena.add
    .text(x, y, texto, { fontFamily: "monospace", fontSize: "26px", color: "#ffd166" })
    .setOrigin(0.5);

  fondo.on("pointerover", () => fondo.setFillStyle(0x8a5434));
  fondo.on("pointerout", () => fondo.setFillStyle(0x6b3e26));
  fondo.on("pointerdown", alHacerClic);

  return { fondo, etiqueta };
}
