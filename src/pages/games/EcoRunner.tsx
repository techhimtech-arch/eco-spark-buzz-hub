import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { GameLayout } from "@/components/games/GameLayout";

export default function EcoRunner() {
  const gameRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const phaserGameRef = useRef<Phaser.Game | null>(null);

  // Phaser Scene definition inside component to access state setters easily
  class MainScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Rectangle;
    private obstacles!: Phaser.GameObjects.Group;
    private saplings!: Phaser.GameObjects.Group;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private speed: number = 5;
    private spawnTimer: number = 0;
    private scoreInternal: number = 0;

    constructor() {
      super({ key: 'MainScene' });
    }

    create() {
      // Background (simple gradient or rects for now)
      this.cameras.main.setBackgroundColor('#87CEEB');

      // Ground
      const ground = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height - 50, this.cameras.main.width, 100, 0x228B22);
      this.physics.add.existing(ground, true); // true = static

      // Player
      this.player = this.add.rectangle(100, this.cameras.main.height - 150, 40, 60, 0x0000FF);
      this.physics.add.existing(this.player);
      const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
      playerBody.setCollideWorldBounds(true);

      // Groups
      this.obstacles = this.physics.add.group();
      this.saplings = this.physics.add.group();

      // Collisions
      this.physics.add.collider(this.player, ground);
      this.physics.add.overlap(this.player, this.obstacles, this.hitObstacle, undefined, this);
      this.physics.add.overlap(this.player, this.saplings, this.collectSapling, undefined, this);

      // Input
      if (this.input.keyboard) {
        this.cursors = this.input.keyboard.createCursorKeys();
      }

      // Touch input (jump)
      this.input.on('pointerdown', () => {
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        if (body.touching.down) {
          body.setVelocityY(-500);
        }
      });
    }

    update(time: number, delta: number) {
      const body = this.player.body as Phaser.Physics.Arcade.Body;

      if (this.cursors?.up.isDown && body.touching.down) {
        body.setVelocityY(-500);
      }

      // Spawning logic
      this.spawnTimer += delta;
      if (this.spawnTimer > 1500 - (this.speed * 50)) {
        this.spawnEntity();
        this.spawnTimer = 0;
        this.speed += 0.05; // slowly increase speed
      }

      // Move entities
      this.obstacles.getChildren().forEach((obs: any) => {
        obs.x -= this.speed;
        if (obs.x < -50) obs.destroy();
      });

      this.saplings.getChildren().forEach((sap: any) => {
        sap.x -= this.speed;
        if (sap.x < -50) sap.destroy();
      });
    }

    spawnEntity() {
      const isSapling = Phaser.Math.Between(0, 10) > 6;
      
      if (isSapling) {
        // Spawn sapling (green square)
        const sap = this.add.rectangle(this.cameras.main.width + 50, this.cameras.main.height - 120, 30, 30, 0x00FF00);
        this.physics.add.existing(sap);
        (sap.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
        this.saplings.add(sap);
      } else {
        // Spawn obstacle (pollution/trash - gray/red square)
        const type = Phaser.Math.Between(1, 2);
        const height = type === 1 ? 40 : 80;
        const yPos = type === 1 ? this.cameras.main.height - 120 : this.cameras.main.height - 140;
        
        const obs = this.add.rectangle(this.cameras.main.width + 50, yPos, 40, height, 0x555555);
        this.physics.add.existing(obs);
        (obs.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
        this.obstacles.add(obs);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    collectSapling(player: any, sapling: any) {
      sapling.destroy();
      this.scoreInternal += 10;
      setScore(this.scoreInternal);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hitObstacle(player: any, obstacle: any) {
      this.physics.pause();
      player.fillColor = 0xFF0000;
      setIsGameOver(true);
    }
  }

  const startGame = () => {
    setIsGameOver(false);
    setScore(0);
    if (phaserGameRef.current) {
      phaserGameRef.current.scene.start('MainScene');
    }
  };

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: '100%',
      height: '100%',
      backgroundColor: '#87ceeb',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 1000, x: 0 },
          debug: false
        }
      },
      scene: MainScene,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      }
    };

    const game = new Phaser.Game(config);
    phaserGameRef.current = game;

    return () => {
      game.destroy(true);
      phaserGameRef.current = null;
    };
  }, []);

  return (
    <GameLayout
      gameName="Eco Runner"
      score={score}
      level={Math.floor(score / 50) + 1}
      xpEarned={Math.floor(score / 2)}
      isGameOver={isGameOver}
      onRestart={startGame}
      theme="yellow"
      starsEarned={score > 500 ? 3 : score > 200 ? 2 : score > 50 ? 1 : 0}
      ecoMessage="Planting trees along roads helps reduce pollution!"
    >
      <div className="w-full h-full relative">
        <div ref={gameRef} className="absolute inset-0 w-full h-full" />
        
        {/* Mobile controls overlay helper */}
        <div className="absolute bottom-4 left-0 right-0 text-center text-white/50 font-bold uppercase tracking-widest pointer-events-none drop-shadow-md">
          Tap to Jump
        </div>
      </div>
    </GameLayout>
  );
}
