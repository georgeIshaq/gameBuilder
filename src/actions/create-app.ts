"use server";

import { getUser } from "@/auth/stack-auth";
import { appsTable, appUsers } from "@/db/schema";
import { db } from "@/db/schema";
import { freestyle } from "@/lib/freestyle";
import { templates } from "@/lib/templates";
import { memory, builderAgent } from "@/mastra/agents/builder";
import { sendMessageWithStreaming } from "@/lib/internal/stream-manager";

export async function createApp({
  initialMessage,
  templateId,
}: {
  initialMessage?: string;
  templateId: string;
}) {
  console.time("get user");
  const user = await getUser();
  console.timeEnd("get user");

  if (!templates[templateId]) {
    throw new Error(
      `Template ${templateId} not found. Available templates: ${Object.keys(templates).join(", ")}`
    );
  }

  console.time("git");
  const repo = await freestyle.createGitRepository({
    name: "Unnamed App",
    public: true,
    source: {
      type: "git",
      url: templates[templateId].repo,
    },
  });
  await freestyle.grantGitPermission({
    identityId: user.freestyleIdentity,
    repoId: repo.repoId,
    permission: "write",
  });

  const token = await freestyle.createGitAccessToken({
    identityId: user.freestyleIdentity,
  });

  console.timeEnd("git");

  console.time("dev server");
  const { mcpEphemeralUrl, fs } = await freestyle.requestDevServer({
    repoId: repo.repoId,
  });
  console.timeEnd("dev server");

  // Seed Phaser patterns and default game page
  await seedPhaserPatterns(fs);

  console.time("database: create app");
  const app = await db.transaction(async (tx) => {
    const appInsertion = await tx
      .insert(appsTable)
      .values({
        gitRepo: repo.repoId,
        name: initialMessage,
      })
      .returning();

    await tx
      .insert(appUsers)
      .values({
        appId: appInsertion[0].id,
        userId: user.userId,
        permissions: "admin",
        freestyleAccessToken: token.token,
        freestyleAccessTokenId: token.id,
        freestyleIdentity: user.freestyleIdentity,
      })
      .returning();

    return appInsertion[0];
  });
  console.timeEnd("database: create app");

  console.time("mastra: create thread");
  await memory.createThread({
    threadId: app.id,
    resourceId: app.id,
  });
  console.timeEnd("mastra: create thread");

  if (initialMessage) {
    console.time("send initial message");

    // Send the initial message using the same infrastructure as the chat API
    await sendMessageWithStreaming(builderAgent, app.id, mcpEphemeralUrl, fs, {
      id: crypto.randomUUID(),
      parts: [
        {
          text: initialMessage,
          type: "text",
        },
      ],
      role: "user",
    });

    console.timeEnd("send initial message");
  }

  return app;
}

async function seedPhaserPatterns(fs: import("freestyle-sandboxes").FreestyleDevServerFilesystem) {
  const baseDir = "/template" as const;
  const patternsDir = `${baseDir}/patterns`;
  const facesDir = `${baseDir}/public/faces`;
  try {
    // @ts-expect-error optional in some FS impls
    await fs.mkdir?.(patternsDir, { recursive: true });
    // @ts-expect-error optional in some FS impls
    await fs.mkdir?.(facesDir, { recursive: true });
  } catch {}

  const files: Array<{ path: string; content: string }> = [
    {
      path: `${patternsDir}/README.md`,
      content: `Phaser Pattern Library\n\nThis directory contains minimal Phaser scenes for fast bootstrapping:\n- survivorsScene.js\n- runnerScene.js\n- bulletHellScene.js\n- reactionTimerScene.js\n- bossBattleScene.js\n\nEach scene exports a function createSceneConfig(opts) that returns a Phaser.Game config you can pass to new Phaser.Game(config).`,
    },
    {
      path: `${patternsDir}/survivorsScene.js`,
      content: `export function createSceneConfig(opts = {}) {\n  return {\n    type: Phaser.AUTO,\n    backgroundColor: '#0b0b0b',\n    scale: { mode: Phaser.Scale.RESIZE, parent: null, width: window.innerWidth, height: window.innerHeight },\n    physics: { default: 'arcade', arcade: { gravity: { y: 0 } } },\n    scene: {\n      preload, create, update\n    }\n  };\n  function preload() {\n    // placeholder circle texture for player/enemy\n    this.textures.generate('player', { data: ['1'], pixelWidth: 16, pixelHeight: 16 });\n    this.textures.generate('enemy', { data: ['1'], pixelWidth: 12, pixelHeight: 12 });\n  }\n  function create() {\n    this.cameras.main.setBackgroundColor('#0b0b0b');\n    this.player = this.add.circle(0, 0, 8, 0x22c55e);\n    this.player.setPosition(this.scale.width/2, this.scale.height/2);\n    this.enemies = this.add.group();\n    this.cursors = this.input.keyboard.createCursorKeys();\n    this.wasd = this.input.keyboard.addKeys('W,A,S,D');\n    this.t = 0;\n  }\n  function update() {\n    this.t++;\n    if (this.t % 30 === 0) spawnEnemy.call(this);\n    const speed = 180;\n    const p = this.player;\n    let vx = 0, vy = 0;\n    if (this.cursors.left.isDown || this.wasd.A.isDown) vx -= 1;\n    if (this.cursors.right.isDown || this.wasd.D.isDown) vx += 1;\n    if (this.cursors.up.isDown || this.wasd.W.isDown) vy -= 1;\n    if (this.cursors.down.isDown || this.wasd.S.isDown) vy += 1;\n    p.x = Phaser.Math.Clamp(p.x + vx * (speed * this.game.loop.delta/1000), 0, this.scale.width);\n    p.y = Phaser.Math.Clamp(p.y + vy * (speed * this.game.loop.delta/1000), 0, this.scale.height);\n    this.enemies.children.iterate(e => { if (!e) return; const dx = p.x - e.x, dy = p.y - e.y; const d = Math.hypot(dx,dy) || 1; e.x += (dx/d) * 1.2; e.y += (dy/d) * 1.2; });\n  }\n  function spawnEnemy(){\n    const edge = Math.random() < 0.5 ? 'x' : 'y';\n    let x = Math.random()*this.scale.width;\n    let y = Math.random()*this.scale.height;\n    if (edge === 'x') x = Math.random()<0.5 ? -20 : this.scale.width+20; else y = Math.random()<0.5 ? -20 : this.scale.height+20;\n    const e = this.add.circle(x, y, 6, 0xef4444);\n    this.enemies.add(e);\n  }\n}`,
    },
    {
      path: `${patternsDir}/runnerScene.js`,
      content: `export function createSceneConfig(opts = {}) {\n  return {\n    type: Phaser.AUTO,\n    backgroundColor: '#0a0a0a',\n    scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight },\n    physics: { default: 'arcade', arcade: { gravity: { y: 900 } } },\n    scene: { preload, create, update }\n  };\n  function preload(){}\n  function create(){\n    this.cameras.main.setBackgroundColor('#0a0a0a');\n    const groundY = this.scale.height - 20;\n    this.ground = this.add.rectangle(this.scale.width/2, groundY, this.scale.width, 10, 0xffffff);\n    this.player = this.add.rectangle(80, groundY-30, 16, 24, 0x60a5fa);\n    this.physics.add.existing(this.player);\n    this.player.body.setCollideWorldBounds(true);\n    this.player.body.setGravityY(0);\n    this.obstacles = this.add.group();\n    this.t=0;\n    this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);\n    this.cursorUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);\n    this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);\n  }\n  function update(){\n    this.t++;\n    if (this.t % 80 === 0) spawnObstacle.call(this);\n    if (Phaser.Input.Keyboard.JustDown(this.space) || Phaser.Input.Keyboard.JustDown(this.cursorUp) || Phaser.Input.Keyboard.JustDown(this.wKey)) {\n      if (this.player.body.onFloor || this.player.body.blocked.down) {\n        this.player.body.setVelocityY(-420);\n      }\n    }\n    this.obstacles.children.iterate(o => { if (!o) return; o.x -= 4; if (o.x < -20) o.destroy(); });\n  }\n  function spawnObstacle(){\n    const groundY = this.scale.height - 20;\n    const h = 16 + Math.random()*32;\n    const o = this.add.rectangle(this.scale.width+20, groundY - h/2, 20, h, 0xef4444);\n    this.obstacles.add(o);\n  }\n}`,
    },
    {
      path: `${patternsDir}/bulletHellScene.js`,
      content: `export function createSceneConfig(opts = {}) {\n  return {\n    type: Phaser.AUTO,\n    backgroundColor: '#0b0b0b',\n    scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight },\n    physics: { default: 'arcade', arcade: { gravity: { y: 0 } } },\n    scene: { preload, create, update }\n  };\n  function preload(){}\n  function create(){\n    this.player = this.add.circle(this.scale.width/2, this.scale.height/2, 8, 0x22c55e);\n    this.bullets = this.add.group();\n    this.cursors = this.input.keyboard.createCursorKeys();\n    this.wasd = this.input.keyboard.addKeys('W,A,S,D');\n    this.t=0;\n  }\n  function update(){\n    this.t++; if (this.t % 12 === 0) spawnBullet.call(this);\n    const speed = 180;\n    const p = this.player;\n    let vx=0, vy=0;\n    if (this.cursors.left.isDown || this.wasd.A.isDown) vx -= 1;\n    if (this.cursors.right.isDown || this.wasd.D.isDown) vx += 1;\n    if (this.cursors.up.isDown || this.wasd.W.isDown) vy -= 1;\n    if (this.cursors.down.isDown || this.wasd.S.isDown) vy += 1;\n    p.x = Phaser.Math.Clamp(p.x + vx * (speed * this.game.loop.delta/1000), 0, this.scale.width);\n    p.y = Phaser.Math.Clamp(p.y + vy * (speed * this.game.loop.delta/1000), 0, this.scale.height);\n    this.bullets.children.iterate(b => { if (!b) return; b.x += b.vx; b.y += b.vy; });\n  }\n  function spawnBullet(){\n    const a = Math.random()*Math.PI*2;\n    const b = this.add.circle(Math.random()*this.scale.width, Math.random()*this.scale.height, 3, 0xf59e0b);\n    b.vx = Math.cos(a)*2; b.vy = Math.sin(a)*2;\n    this.bullets.add(b);\n  }\n}`,
    },
    {
      path: `${patternsDir}/reactionTimerScene.js`,
      content: `export function createSceneConfig(opts = {}) {\n  return {\n    type: Phaser.AUTO,\n    backgroundColor: '#111111',\n    scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight },\n    scene: { preload, create, update }\n  };\n  function preload(){}\n  function create(){\n    this.state = 'wait'; this.t=0; this.showAt = Math.floor(60 + Math.random()*180); this.reacted=false;\n    this.add.text(20,20,'Wait for it...', { color:'#ffffff' });\n    this.input.keyboard.on('keydown', () => { if (this.state==='go') this.reacted=true; });\n    this.input.on('pointerdown', () => { if (this.state==='go') this.reacted=true; });\n  }\n  function update(){\n    this.t++;\n    if (this.state==='wait' && this.t>=this.showAt){ this.state='go'; this.cameras.main.setBackgroundColor('#16a34a'); }\n    if (this.state==='go' && this.reacted){ this.state='wait'; this.t=0; this.reacted=false; this.cameras.main.setBackgroundColor('#111111'); this.showAt=Math.floor(60+Math.random()*180); }\n  }\n}`,
    },
    {
      path: `${patternsDir}/bossBattleScene.js`,
      content: `export function createSceneConfig(opts = {}) {\n  return {\n    type: Phaser.AUTO,\n    backgroundColor: '#0b0b0b',\n    scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight },\n    physics: { default: 'arcade', arcade: { gravity: { y: 0 } } },\n    scene: { preload, create, update }\n  };\n  function preload(){}\n  function create(){\n    this.player = this.add.circle(this.scale.width/2, this.scale.height-40, 8, 0x22c55e);\n    this.boss = this.add.circle(this.scale.width/2, 60, 24, 0xef4444); this.boss.hp = 100;\n    this.shots = this.add.group();\n    this.cursors = this.input.keyboard.createCursorKeys(); this.wasd = this.input.keyboard.addKeys('W,A,S,D,SPACE');\n  }\n  function update(){\n    const speed = 200; const p=this.player; let vx=0,vy=0;\n    if (this.cursors.left.isDown || this.wasd.A.isDown) vx -= 1;\n    if (this.cursors.right.isDown || this.wasd.D.isDown) vx += 1;\n    if (this.cursors.up.isDown || this.wasd.W.isDown) vy -= 1;\n    if (this.cursors.down.isDown || this.wasd.S.isDown) vy += 1;\n    p.x = Phaser.Math.Clamp(p.x + vx * (speed * this.game.loop.delta/1000), 0, this.scale.width);\n    p.y = Phaser.Math.Clamp(p.y + vy * (speed * this.game.loop.delta/1000), 0, this.scale.height);\n    if (Phaser.Input.Keyboard.JustDown(this.wasd.SPACE)){ const s = this.add.rectangle(p.x, p.y-12, 2, 6, 0xffffff); this.shots.add(s); }\n    this.shots.children.iterate(s => { if (!s) return; s.y -= 6; if (s.y < -10) s.destroy(); if (Phaser.Math.Distance.Between(s.x, s.y, this.boss.x, this.boss.y) < 24){ this.boss.hp=Math.max(0, this.boss.hp-1); s.destroy(); } });\n    this.boss.x = this.scale.width/2 + Math.sin(performance.now()/600)*120;\n  }\n}`,
    },
    {
      path: `${baseDir}/app/game/page.tsx`,
      content: `"use client";\nimport { useEffect, useRef } from "react";\n\nexport default function GamePage(){\n  const ref = useRef<HTMLDivElement | null>(null);\n  useEffect(() => {\n    document.body.style.overflow = 'hidden';\n    const root = ref.current!;\n    // Load Phaser via CDN for speed\n    const script = document.createElement('script');\n    script.src = 'https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js';\n    script.async = true;\n    script.onload = async () => {\n      // default boot: survivors\n      const mod = await import("../../patterns/survivorsScene.js");\n      const config = mod.createSceneConfig({});\n      // eslint-disable-next-line @typescript-eslint/ban-ts-comment\n      // @ts-ignore\n      const game = new window.Phaser.Game({ ...config, parent: root });\n      return () => { game?.destroy(true); };\n    };\n    document.head.appendChild(script);\n    return () => { try { document.head.removeChild(script); } catch {} };\n  }, []);\n  return <div ref={ref} style={{ width: '100vw', height: '100vh' }} />;\n}\n`,
    },
  ];

  for (const f of files) {
    await fs.writeFile(f.path, f.content);
  }

  await fs.writeFile(`${facesDir}/.gitkeep`, "");
}