import { NIVELES } from "./NivelesData.js";

export class JuegoScene extends Phaser.Scene {
    constructor() {
        super("JuegoScene");
    }

    init(data) {
        this.nivelActual = data.nivel || 1;
        this.puntaje = data.puntaje || 0;
        this.datosNivel = NIVELES[this.nivelActual];
        this.cantidadRecolectados = 0;
    }

    preload() {
        this.load.image("fondo", "./public/assets/space3.png");
        this.load.image("jugador", "./public/assets/phaser3-logo.png");
        this.load.image("item", "./public/assets/particles/red.png");
        
        let canvasMosaico = this.textures.createCanvas("baldosaPared", 32, 32);
        let ctx = canvasMosaico.context;
        ctx.fillStyle = "#3b5998"; 
        ctx.fillRect(0, 0, 32, 32);
        ctx.strokeStyle = "#ffffff";
        ctx.strokeRect(0, 0, 32, 32);
        canvasMosaico.refresh();

        let canvasLlegada = this.textures.createCanvas("llegada", 40, 40);
        let ctxL = canvasLlegada.context;
        ctxL.fillStyle = "#00ff00";
        ctxL.fillRect(0, 0, 40, 40);
        canvasLlegada.refresh();
    }

    create() {
        let anchoMundo = this.datosNivel.mapa[0].length * 32;
        let altoMundo = this.datosNivel.mapa.length * 32;
        this.add.tileSprite(0, 0, anchoMundo, altoMundo, "fondo").setOrigin(0, 0).setAlpha(0.4);

        const map = this.make.tilemap({
            data: this.datosNivel.mapa,
            tileWidth: this.datosNivel.anchoBaldosa,
            tileHeight: this.datosNivel.altoBaldosa
        });
        
        const tileset = map.addTilesetImage("baldosaPared");
        const capaParedes = map.createLayer(0, tileset, 0, 0);
        
        capaParedes.setCollision(1);

        this.llegada = this.physics.add.sprite(this.datosNivel.llegadaX, this.datosNivel.llegadaY, "llegada");

        this.jugador = this.physics.add.sprite(this.datosNivel.jugadorX, this.datosNivel.jugadorY, "jugador");
        this.jugador.setScale(0.3); 
        this.jugador.setCollideWorldBounds(true);

        this.physics.add.collider(this.jugador, capaParedes);

        this.items = this.physics.add.group();
        this.datosNivel.recolectables.forEach(pos => {
            let item = this.items.create(pos.x, pos.y, "item");
            item.setScale(0.8);
        });

        this.physics.add.overlap(this.jugador, this.items, this.recolectarItem, null, this);

        this.enemigos = this.physics.add.group();
        this.datosNivel.enemigos.forEach(info => {
            let ene = this.enemigos.create(info.x, info.y, "item").setTint(0xff0000); 
            ene.setScale(1.2);
            ene.datosMovimiento = {
                tipo: info.tipo,
                inicioX: info.x,
                inicioY: info.y,
                rango: info.rango,
                velocidad: 100,
                direccion: 1
            };
        });

        this.physics.add.overlap(this.jugador, this.enemigos, this.recibirDanio, null, this);

        this.textoUI = this.add.text(16, 16, `Nivel: ${this.nivelActual}   |   Items: ${this.cantidadRecolectados}/5   |   Puntaje Total: ${this.puntaje}`, {
            fontSize: "20px",
            fill: "#ffffff",
            backgroundColor: "#00000088",
            padding: { x: 10, y: 5 }
        });
        this.textoUI.setScrollFactor(0); 

        this.cameras.main.setBounds(0, 0, anchoMundo, altoMundo);
        this.cameras.main.startFollow(this.jugador, true, 0.1, 0.1);
        this.physics.world.setBounds(0, 0, anchoMundo, altoMundo);

        this.teclado = this.input.keyboard.createCursorKeys();

        this.physics.add.overlap(this.jugador, this.llegada, this.verificarLlegada, null, this);
    }

    update() {
        this.jugador.setVelocity(0);

        if (this.teclado.left.isDown) {
            this.jugador.setVelocityX(-180);
        } else if (this.teclado.right.isDown) {
            this.jugador.setVelocityX(180);
        }

        if (this.teclado.up.isDown) {
            this.jugador.setVelocityY(-180);
        } else if (this.teclado.down.isDown) {
            this.jugador.setVelocityY(180);
        }

        this.enemigos.children.iterate(ene => {
            let m = ene.datosMovimiento;
            if (m.tipo === 'horizontal') {
                if (Math.abs(ene.x - m.inicioX) >= m.rango) {
                    m.direccion *= -1; 
                }
                ene.setVelocityX(m.velocidad * m.direccion);
            } else if (m.tipo === 'vertical') {
                if (Math.abs(ene.y - m.inicioY) >= m.rango) {
                    m.direccion *= -1;
                }
                ene.setVelocityY(m.velocidad * m.direccion);
            }
        });
    }

    recolectarItem(jugador, item) {
        item.disableBody(true, true); 
        this.cantidadRecolectados += 1;
        this.puntaje += 10; 

        this.textoUI.setText(`Nivel: ${this.nivelActual}   |   Items: ${this.cantidadRecolectados}/5   |   Puntaje Total: ${this.puntaje}`);
    }

    verificarLlegada() {
        if (this.cantidadRecolectados >= 5) {
            if (this.nivelActual < 3) {
                this.scene.start("JuegoScene", { nivel: this.nivelActual + 1, puntaje: this.puntaje });
            } else {
                this.textoUI.setText(`¡JUEGO COMPLETADO GANASTE! Puntaje Final: ${this.puntaje}`);
                this.physics.pause();
                this.jugador.setTint(0x00ff00);
            }
        } else {
            this.textoUI.setText(`FALTAN ITEMS: Te faltan ${5 - this.cantidadRecolectados} elementos para poder salir.`);
        }
    }

    recibirDanio() {
        this.scene.start("JuegoScene", { nivel: this.nivelActual, puntaje: this.puntaje - (this.cantidadRecolectados * 10) });
    }
}