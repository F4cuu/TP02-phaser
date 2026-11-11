// Escena base con toda la lógica común a los niveles.
// Cada nivel (Nivel1, Nivel2, Nivel3) solo indica qué mapa usa y a qué escena sigue.
import { ALIENS } from "./Preload.js";

const ESTRELLAS_MINIMAS = 5; // condición para ganar el nivel
const PUNTOS_POR_ESTRELLA = 10;
const VELOCIDAD_JUGADOR = 130;
const VELOCIDAD_ENEMIGO = 70;
const ALTO_HUD = 40;

export default class BaseNivel extends Phaser.Scene {
  /**
   * @param {string} key clave de la escena
   * @param {object} opciones { mapa, siguiente, titulo }
   */
  constructor(key, opciones) {
    super(key);
    this.opciones = opciones;
  }

  // data llega desde this.scene.start(...) del nivel anterior
  init(data) {
    // El puntaje se transporta entre escenas
    this.puntajeInicial = data.puntaje ?? 0;
    this.puntaje = this.puntajeInicial;
    this.recolectadas = 0;
    this.terminado = false;
  }

  create() {
    // ---------- MAPA (tilemap de Tiled) ----------
    const mapa = this.make.tilemap({ key: this.opciones.mapa });
    // "tileset" es el nombre del tileset dentro de Tiled; "tiles" la clave del preload
    const tileset = mapa.addTilesetImage("tileset", "tiles");
    mapa.createLayer("Fondo", tileset, 0, 0);
    this.paredes = mapa.createLayer("Paredes", tileset, 0, 0);
    this.paredes.setCollisionByProperty({ esColisionable: true });

    const ancho = mapa.widthInPixels;
    const alto = mapa.heightInPixels;
    this.physics.world.setBounds(0, 0, ancho, alto);

    const objetos = mapa.getObjectLayer("Objetos").objects;

    // ---------- JUGADOR (spritesheet dude) ----------
    const inicio = objetos.find((o) => o.name === "jugador");
    this.jugador = this.physics.add.sprite(inicio.x, inicio.y, "dude", 4);
    // Se achica para que entre en los pasillos (2 tiles = 36px)
    this.jugador.setScale(0.7);
    // La caja de colisión es solo la parte de abajo del personaje (medidas sin escalar)
    this.jugador.body.setSize(22, 22).setOffset(5, 24);
    this.jugador.setCollideWorldBounds(true);
    this.jugador.setDepth(5);
    this.physics.add.collider(this.jugador, this.paredes);

    // ---------- RECOLECTABLES (estrellas) ----------
    this.estrellas = this.physics.add.group({ allowGravity: false });
    objetos
      .filter((o) => o.type === "estrella")
      .forEach((o) => {
        const estrella = this.estrellas.create(o.x, o.y, "star");
        // pequeño "flote" para que se noten
        this.tweens.add({
          targets: estrella,
          y: o.y - 3,
          duration: 600,
          yoyo: true,
          repeat: -1,
          delay: Phaser.Math.Between(0, 600),
        });
      });
    this.totalEstrellas = this.estrellas.getLength();
    this.physics.add.overlap(this.jugador, this.estrellas, this.juntarEstrella, null, this);

    // ---------- PUNTO DE LLEGADA (puerta) ----------
    // La puerta ocupa 2 tiles de alto: parte de arriba (130) y de abajo (150) del tileset
    const datosLlegada = objetos.find((o) => o.name === "llegada");
    this.puertaArriba = this.add.image(datosLlegada.x, datosLlegada.y - 9, "objetos", 130);
    this.llegada = this.physics.add.staticSprite(datosLlegada.x, datosLlegada.y + 9, "objetos", 150);
    // Candado mientras no se junten los ítems necesarios
    this.candado = this.add.image(datosLlegada.x, datosLlegada.y - 24, "objetos", 28).setScale(0.7);
    this.puertaArriba.setTint(0x8a8a9a);
    this.llegada.setTint(0x8a8a9a);
    this.physics.add.overlap(this.jugador, this.llegada, this.tocarLlegada, null, this);

    // ---------- ENEMIGOS (aliens) ----------
    this.enemigos = this.physics.add.group();
    objetos
      .filter((o) => o.type === "enemigo")
      .forEach((o) => this.crearEnemigo(o));
    this.physics.add.collider(this.enemigos, this.paredes);
    this.physics.add.overlap(this.jugador, this.enemigos, this.perder, null, this);

    // ---------- CÁMARA ----------
    const camara = this.cameras.main;
    const vista = { ancho: this.scale.width, alto: this.scale.height - ALTO_HUD };
    if (ancho > vista.ancho || alto > vista.alto) {
      // Mapa más grande que la pantalla: la cámara sigue al jugador
      camara.setBounds(0, -ALTO_HUD, ancho, alto + ALTO_HUD);
      camara.startFollow(this.jugador, true, 0.12, 0.12);
    } else {
      // Mapa chico: queda fijo y centrado debajo del HUD
      camara.setScroll(-(vista.ancho - ancho) / 2, -ALTO_HUD - (vista.alto - alto) / 2);
    }

    // ---------- CONTROLES ----------
    this.cursores = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys("W,A,S,D");
    this.input.keyboard.on("keydown-R", () =>
      this.scene.restart({ puntaje: this.puntajeInicial })
    );

    this.crearHud();
    this.mostrarCartel(this.opciones.titulo, 1400);
  }

  // Elige si el enemigo se mueve en vertical u horizontal según dónde está ubicado:
  // mira cuánto espacio libre tiene a los lados y arriba/abajo, y usa el eje más largo.
  // (Se puede forzar con una propiedad "movimiento" = "vertical"/"horizontal" en Tiled.)
  crearEnemigo(datos) {
    const forzado = datos.properties?.find((p) => p.name === "movimiento")?.value;
    const libresH = this.espacioLibre(datos.x, datos.y, 1, 0) + this.espacioLibre(datos.x, datos.y, -1, 0);
    const libresV = this.espacioLibre(datos.x, datos.y, 0, 1) + this.espacioLibre(datos.x, datos.y, 0, -1);
    const movimiento = forzado ?? (libresH >= libresV ? "horizontal" : "vertical");

    // Aspecto al azar entre los aliens del spritesheet
    const tipo = Phaser.Math.Between(0, ALIENS.length - 1);
    const enemigo = this.enemigos.create(datos.x, datos.y, "aliens", ALIENS[tipo][0]);
    enemigo.play({ key: `alien${tipo}`, startFrame: Phaser.Math.Between(0, 1) });
    enemigo.body.setSize(16, 16).setOffset(4, 6);
    enemigo.setBounce(1); // al chocar con una pared invierte la dirección
    enemigo.setCollideWorldBounds(true);
    enemigo.movimiento = movimiento;

    const sentido = Phaser.Math.RND.sign();
    if (movimiento === "horizontal") {
      enemigo.setVelocity(VELOCIDAD_ENEMIGO * sentido, 0);
    } else {
      enemigo.setVelocity(0, VELOCIDAD_ENEMIGO * sentido);
    }
  }

  // Cantidad de tiles libres desde (x, y) en una dirección hasta encontrar pared
  espacioLibre(x, y, dx, dy) {
    const paso = this.paredes.tilemap.tileWidth;
    let libres = 0;
    for (let i = 1; i < 40; i++) {
      // con nonNull=true devuelve un tile vacío (index -1) en espacio libre y null fuera del mapa
      const tile = this.paredes.getTileAtWorldXY(x + dx * paso * i, y + dy * paso * i, true);
      if (!tile || tile.collides) break; // fuera del mapa o pared
      libres++;
    }
    return libres;
  }

  crearHud() {
    const estilo = { fontFamily: "monospace", fontSize: "18px", color: "#ffffff" };
    this.add
      .rectangle(0, 0, this.scale.width, ALTO_HUD, 0x16141c, 0.92)
      .setOrigin(0)
      .setScrollFactor(0) // queda fijo aunque la cámara se mueva
      .setDepth(20);
    // Contador de ítems en la esquina superior izquierda (GDD 6.1)
    this.add.image(22, 20, "star").setScrollFactor(0).setDepth(21);
    this.textoEstrellas = this.add.text(40, 11, "", estilo).setScrollFactor(0).setDepth(21);
    this.add
      .text(this.scale.width / 2, 11, this.opciones.titulo, { ...estilo, color: "#ffd166" })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(21);
    this.textoPuntaje = this.add
      .text(this.scale.width - 12, 11, "", estilo)
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(21);
    this.actualizarHud();
  }

  actualizarHud() {
    const ok = this.recolectadas >= ESTRELLAS_MINIMAS;
    this.textoEstrellas.setText(
      `${this.recolectadas}/${this.totalEstrellas}  (mín. ${ESTRELLAS_MINIMAS})`
    );
    this.textoEstrellas.setColor(ok ? "#9be7a0" : "#ffffff");
    this.textoPuntaje.setText(`Puntaje: ${this.puntaje}`);
  }

  // Cartel centrado en la pantalla (independiente de la cámara)
  mostrarCartel(texto, duracion = 1500) {
    if (this.cartel) this.cartel.destroy();
    this.cartel = this.add
      .text(this.scale.width / 2, this.scale.height / 2, texto, {
        fontFamily: "monospace",
        fontSize: "32px",
        color: "#ffffff",
        stroke: "#16141c",
        strokeThickness: 6,
        align: "center",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(30);
    if (duracion) {
      const cartel = this.cartel;
      this.time.delayedCall(duracion, () => {
        if (cartel.active) cartel.destroy();
        if (this.cartel === cartel) this.cartel = null;
      });
    }
  }

  juntarEstrella(jugador, estrella) {
    estrella.disableBody(true, true);
    this.recolectadas++;
    this.puntaje += PUNTOS_POR_ESTRELLA;
    this.actualizarHud();
    if (this.recolectadas === ESTRELLAS_MINIMAS) {
      this.abrirPuerta();
    }
  }

  // Al juntar los ítems necesarios la puerta se destraba
  abrirPuerta() {
    this.candado.destroy();
    this.puertaArriba.clearTint();
    this.llegada.clearTint();
    this.tweens.add({
      targets: [this.puertaArriba, this.llegada],
      alpha: 0.6,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
    this.mostrarCartel("¡La puerta se abrió!", 1500);
  }

  // Condición para ganar: tocar la puerta habiendo juntado al menos 5 ítems
  tocarLlegada() {
    if (this.terminado) return;

    if (this.recolectadas < ESTRELLAS_MINIMAS) {
      // Avisar sin repetir el cartel en cada frame que se está tocando la puerta
      if (!this.avisoActivo) {
        this.avisoActivo = true;
        const faltan = ESTRELLAS_MINIMAS - this.recolectadas;
        this.mostrarCartel(`La puerta está cerrada.\nTe faltan ${faltan} ítem${faltan === 1 ? "" : "s"}`, 1200);
        this.time.delayedCall(1500, () => (this.avisoActivo = false));
      }
      return;
    }

    this.terminado = true;
    this.physics.pause();
    this.jugador.anims.play("turn");
    const final = this.opciones.siguiente === "victoria";
    this.mostrarCartel(final ? "¡Saliste de la mazmorra!" : "¡Nivel completado!", 0);
    // Pasar al siguiente nivel llevando el puntaje acumulado
    this.time.delayedCall(1300, () =>
      this.scene.start(this.opciones.siguiente, { puntaje: this.puntaje })
    );
  }

  // Si un enemigo toca al jugador se reinicia el nivel con el puntaje con el que se entró
  perder() {
    if (this.terminado) return;
    this.terminado = true;
    this.physics.pause();
    this.jugador.anims.play("turn");
    this.jugador.setTint(0xff4d4d);
    this.cameras.main.shake(250, 0.01);
    this.mostrarCartel("¡Te atraparon!", 0);
    this.time.delayedCall(1200, () => this.scene.restart({ puntaje: this.puntajeInicial }));
  }

  update() {
    if (this.terminado) return;

    const izq = this.cursores.left.isDown || this.wasd.A.isDown;
    const der = this.cursores.right.isDown || this.wasd.D.isDown;
    const arr = this.cursores.up.isDown || this.wasd.W.isDown;
    const aba = this.cursores.down.isDown || this.wasd.S.isDown;

    const vx = (der ? 1 : 0) - (izq ? 1 : 0);
    const vy = (aba ? 1 : 0) - (arr ? 1 : 0);
    // normalizar para que en diagonal no vaya más rápido
    const largo = Math.hypot(vx, vy) || 1;
    this.jugador.setVelocity((vx / largo) * VELOCIDAD_JUGADOR, (vy / largo) * VELOCIDAD_JUGADOR);

    // Animaciones del spritesheet dude: izquierda, derecha o de frente
    if (vx < 0) {
      this.jugador.anims.play("left", true);
    } else if (vx > 0) {
      this.jugador.anims.play("right", true);
    } else if (vy !== 0) {
      // en vertical sigue la última animación de caminar (o "right" si venía quieto)
      const actual = this.jugador.anims.currentAnim?.key;
      this.jugador.anims.play(actual === "left" ? "left" : "right", true);
    } else {
      this.jugador.anims.play("turn");
    }

    // Los aliens que van en horizontal miran hacia donde caminan
    this.enemigos.children.iterate((e) => {
      if (e.movimiento === "horizontal") e.setFlipX(e.body.velocity.x < 0);
    });
  }
}
