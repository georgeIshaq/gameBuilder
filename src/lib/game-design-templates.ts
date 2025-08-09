/**
 * Game Design Templates and Patterns
 * 
 * This file contains successful game loops, mechanics, design elements, and typical game types
 * that can be referenced in system prompts for AI game generation.
 */

export interface GameLoop {
  name: string;
  description: string;
  coreActions: string[];
  progression: string;
  feedback: string;
  example: string;
}

export interface GameMechanic {
  name: string;
  description: string;
  implementation: string;
  variations: string[];
  gameTypes: string[];
}

export interface GameType {
  name: string;
  description: string;
  coreLoop: string;
  keyMechanics: string[];
  playerGoal: string;
  difficultyProgression: string;
  example: string;
}

export const SUCCESSFUL_GAME_LOOPS: Record<string, GameLoop> = {
  collectAndAvoid: {
    name: "Collect and Avoid",
    description: "Player collects items while avoiding obstacles/enemies",
    coreActions: ["Move", "Collect", "Avoid", "Survive"],
    progression: "More enemies, faster speed, more valuable items",
    feedback: "Score increases, visual/audio feedback on collection",
    example: "Pac-Man, Snake, Asteroid mining games"
  },
  
  shootAndDestroy: {
    name: "Shoot and Destroy",
    description: "Player shoots projectiles to destroy targets",
    coreActions: ["Aim", "Shoot", "Reload", "Move"],
    progression: "Stronger enemies, better weapons, boss fights",
    feedback: "Explosion effects, score, power-ups",
    example: "Space Invaders, Asteroids, Top-down shooters"
  },
  
  jumpAndRun: {
    name: "Jump and Run",
    description: "Player navigates platforms by jumping and running",
    coreActions: ["Run", "Jump", "Land", "Collect"],
    progression: "More complex levels, new abilities, time pressure",
    feedback: "Satisfying jump physics, checkpoint progress",
    example: "Super Mario, Sonic, Endless runners"
  },
  
  buildAndManage: {
    name: "Build and Manage",
    description: "Player constructs and manages systems or resources",
    coreActions: ["Place", "Upgrade", "Manage", "Optimize"],
    progression: "More complex challenges, new building options",
    feedback: "Visual growth, efficiency metrics, unlocks",
    example: "Tower Defense, City builders, Factory games"
  },
  
  exploreAndDiscover: {
    name: "Explore and Discover",
    description: "Player explores environments to find secrets or progress",
    coreActions: ["Move", "Search", "Unlock", "Progress"],
    progression: "New areas, better equipment, story reveals",
    feedback: "Map completion, discovery rewards, story progression",
    example: "Metroidvania, Adventure games, Roguelikes"
  }
};

export const CORE_GAME_MECHANICS: Record<string, GameMechanic> = {
  movement: {
    name: "Player Movement",
    description: "How the player character moves through the game world",
    implementation: "Arrow keys, WASD, or touch controls for directional movement",
    variations: ["Grid-based", "Free movement", "Physics-based", "Auto-scroll"],
    gameTypes: ["All game types"]
  },
  
  collision: {
    name: "Collision Detection",
    description: "Detecting when game objects interact with each other",
    implementation: "Physics overlap detection between sprites/hitboxes",
    variations: ["Damage collision", "Collection collision", "Trigger zones", "Solid barriers"],
    gameTypes: ["Platformer", "Shooter", "Puzzle", "Action"]
  },
  
  scoring: {
    name: "Score System",
    description: "Tracking and displaying player progress/achievement",
    implementation: "Increment score on events, display with text object",
    variations: ["Points", "Time-based", "Combo multipliers", "Achievements"],
    gameTypes: ["Arcade", "Puzzle", "Action", "Casual"]
  },
  
  spawning: {
    name: "Object Spawning",
    description: "Creating new game objects during gameplay",
    implementation: "Timed events or triggered creation of enemies/items",
    variations: ["Random spawning", "Wave-based", "Pattern-based", "Player-triggered"],
    gameTypes: ["Shooter", "Survival", "Tower Defense", "Action"]
  },
  
  powerUps: {
    name: "Power-ups and Upgrades",
    description: "Temporary or permanent player enhancements",
    implementation: "Collectible items that modify player properties",
    variations: ["Temporary boosts", "Permanent upgrades", "Weapon changes", "Ability unlocks"],
    gameTypes: ["Action", "Shooter", "RPG", "Platformer"]
  },
  
  healthSystem: {
    name: "Health/Lives System",
    description: "Player survivability and failure conditions",
    implementation: "Health points that decrease on damage, game over at zero",
    variations: ["Lives system", "Health regeneration", "Shield mechanics", "One-hit death"],
    gameTypes: ["Action", "Shooter", "Platformer", "Survival"]
  }
};

export const POPULAR_GAME_TYPES: Record<string, GameType> = {
  spaceShooter: {
    name: "Space Shooter",
    description: "Player controls a ship shooting enemies in space",
    coreLoop: "Move ship, shoot enemies, avoid projectiles, collect power-ups",
    keyMechanics: ["movement", "collision", "scoring", "spawning", "powerUps"],
    playerGoal: "Survive waves of enemies and achieve high score",
    difficultyProgression: "More enemies, faster bullets, stronger bosses",
    example: "Space Invaders, Galaga, Gradius"
  },
  
  platformer: {
    name: "Platformer",
    description: "Player jumps between platforms to reach goals",
    coreLoop: "Run, jump, avoid obstacles, collect items, reach end",
    keyMechanics: ["movement", "collision", "scoring", "powerUps"],
    playerGoal: "Navigate through levels to reach the end goal",
    difficultyProgression: "More complex level layouts, moving platforms, enemies",
    example: "Super Mario Bros, Sonic, Celeste"
  },
  
  puzzleGame: {
    name: "Puzzle Game",
    description: "Player solves logical challenges or patterns",
    coreLoop: "Analyze problem, make moves, see results, solve puzzle",
    keyMechanics: ["movement", "collision", "scoring"],
    playerGoal: "Solve puzzles efficiently with minimal moves/time",
    difficultyProgression: "More complex puzzles, additional mechanics, time pressure",
    example: "Tetris, Match-3 games, Sokoban"
  },
  
  survivalGame: {
    name: "Survival Game",
    description: "Player survives as long as possible against increasing threats",
    coreLoop: "Avoid threats, collect resources, survive longer",
    keyMechanics: ["movement", "collision", "scoring", "spawning", "healthSystem"],
    playerGoal: "Survive for as long as possible",
    difficultyProgression: "More frequent threats, faster enemies, limited resources",
    example: "Snake, Asteroids, Zombie survival"
  },
  
  towerDefense: {
    name: "Tower Defense",
    description: "Player places defensive structures to stop enemy waves",
    coreLoop: "Place towers, upgrade defenses, defeat enemy waves, earn resources",
    keyMechanics: ["spawning", "collision", "scoring", "powerUps"],
    playerGoal: "Prevent enemies from reaching the end of the path",
    difficultyProgression: "Stronger enemies, multiple paths, limited resources",
    example: "Plants vs Zombies, Kingdom Rush, Bloons TD"
  },
  
  endlessRunner: {
    name: "Endless Runner",
    description: "Player runs continuously while avoiding obstacles",
    coreLoop: "Run forward, jump/dodge obstacles, collect coins, increase speed",
    keyMechanics: ["movement", "collision", "scoring", "spawning"],
    playerGoal: "Run as far as possible without hitting obstacles",
    difficultyProgression: "Faster speed, more obstacles, complex patterns",
    example: "Temple Run, Subway Surfers, Canabalt"
  }
};

export const ENGAGEMENT_PATTERNS = {
  immediateReward: "Provide instant feedback for player actions (score, effects, sounds)",
  progressionSense: "Show clear advancement through levels, scores, or unlocks",
  riskReward: "Balance safe play with risky moves for better rewards",
  masteryLearning: "Start simple, gradually introduce complexity",
  emergentComplexity: "Simple rules that create complex, interesting situations",
  clearGoals: "Make objectives obvious and achievable",
  fairChallenge: "Difficulty should feel challenging but not unfair",
  playerAgency: "Give players meaningful choices that affect outcomes"
};

export const QUICK_PROTOTYPING_TIPS = {
  startMinimal: "Begin with core mechanic only - one player action",
  addFeedback: "Immediately add visual/audio feedback for actions",
  testEarly: "Make it playable as soon as possible",
  iterateQuickly: "Add one feature at a time and test",
  focusOnFun: "If core mechanic isn't fun, change it before adding features",
  useSimpleArt: "Colored rectangles work fine for prototyping",
  addJuice: "Screen shake, particles, sound effects make games feel better",
  balanceCarefully: "Adjust timing, speed, and difficulty through playtesting"
};

export const PHASER_IMPLEMENTATION_PATTERNS = {
  basicMovement: `
// Arrow key movement
cursors = this.input.keyboard.createCursorKeys();
// In update():
if (cursors.left.isDown) player.setVelocityX(-160);
else if (cursors.right.isDown) player.setVelocityX(160);
else player.setVelocityX(0);`,

  simpleSpawning: `
// Spawn enemies every 2 seconds
this.time.addEvent({
  delay: 2000,
  callback: () => {
    const enemy = enemies.create(Phaser.Math.Between(0, 800), 0, 'enemy');
    enemy.setVelocityY(100);
  },
  loop: true
});`,

  collisionHandling: `
// Collision between player and enemies
this.physics.add.overlap(player, enemies, (player, enemy) => {
  enemy.destroy();
  score += 10;
  scoreText.setText('Score: ' + score);
}, null, this);`,

  powerUpSystem: `
// Power-up collection
this.physics.add.overlap(player, powerUps, (player, powerUp) => {
  powerUp.destroy();
  player.setTint(0x00ff00); // Visual feedback
  playerSpeed *= 1.5; // Temporary speed boost
  this.time.delayedCall(3000, () => {
    player.clearTint();
    playerSpeed /= 1.5;
  });
}, null, this);`,

  simpleAI: `
// Basic enemy AI - move toward player
enemies.children.entries.forEach(enemy => {
  if (enemy.x < player.x) enemy.setVelocityX(50);
  else enemy.setVelocityX(-50);

  if (enemy.y < player.y) enemy.setVelocityY(50);
  else enemy.setVelocityY(-50);
});`
};

export const GAME_FEEL_ENHANCEMENTS = {
  screenShake: "Add camera shake on impacts for visceral feedback",
  particleEffects: "Use particles for explosions, trails, and magic effects",
  soundTiming: "Sync audio perfectly with visual events",
  animationEasing: "Use smooth easing for UI and object movements",
  colorFeedback: "Flash colors on damage, success, or state changes",
  scaleEffects: "Scale objects up/down for emphasis and impact",
  trailEffects: "Add motion trails to fast-moving objects",
  anticipation: "Brief pause before big actions (charging before jump)"
};

export const DIFFICULTY_PROGRESSION_STRATEGIES = {
  timeBasedIncrease: "Gradually increase speed/spawn rate over time",
  waveBasedProgression: "Distinct difficulty spikes between waves/levels",
  playerSkillAdaptation: "Adjust difficulty based on player performance",
  optionalChallenges: "Provide harder optional content for skilled players",
  powerProgression: "Give player stronger abilities as enemies get tougher",
  complexityIncrease: "Introduce new mechanics rather than just harder numbers",
  safetyNet: "Provide ways to recover from mistakes (checkpoints, lives)",
  clearTelegraphing: "Make upcoming challenges visible to players"
};

export const COMMON_GAME_PATTERNS = {
  collectathon: "Gather all items in a level to progress",
  escortMission: "Protect an AI character while moving through dangers",
  territoryControl: "Claim and defend areas of the map",
  resourceManagement: "Balance limited resources (ammo, health, time)",
  patternRecognition: "Learn and respond to enemy/puzzle patterns",
  riskVsReward: "Choose between safe and dangerous paths for better rewards",
  emergentNarrative: "Let player actions create their own story",
  mastery: "Simple to learn, difficult to master mechanics"
};
