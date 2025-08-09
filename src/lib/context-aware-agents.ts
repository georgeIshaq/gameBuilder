import { Agent } from "@mastra/core/agent";
import { anthropic } from "@ai-sdk/anthropic";
import { Memory } from "@mastra/memory";
import { PostgresStore, PgVector } from "@mastra/pg";
import { buildSystemMessage } from "./system";
import { templateTool } from "@/tools/template-tool";
import { todoTool } from "@/tools/todo-tool";
import { 
  SUCCESSFUL_GAME_LOOPS, 
  POPULAR_GAME_TYPES,
  CORE_GAME_MECHANICS 
} from "./game-design-templates";

export interface GameAgentConfig {
  gameType?: keyof typeof POPULAR_GAME_TYPES;
  gameLoop?: keyof typeof SUCCESSFUL_GAME_LOOPS;
  focusMechanics?: (keyof typeof CORE_GAME_MECHANICS)[];
  includeImplementationPatterns?: boolean;
  includeEngagementPatterns?: boolean;
  includePrototypingTips?: boolean;
  customInstructions?: string;
}

/**
 * Create a specialized game development agent with specific game design context
 */
export function createGameAgent(config: GameAgentConfig = {}) {
  const memory = new Memory({
    options: {
      lastMessages: 1000,
      semanticRecall: false,
      threads: {
        generateTitle: true,
      },
    },
    vector: new PgVector({
      connectionString: process.env.DATABASE_URL!,
    }),
    storage: new PostgresStore({
      connectionString: process.env.DATABASE_URL!,
    }),
    processors: [],
  });

  // Build system message with specific context
  const systemMessage = buildSystemMessage({
    includeGameLoops: !!config.gameLoop,
    includeGameTypes: !!config.gameType,
    includeMechanics: !!config.focusMechanics?.length,
    includeImplementationPatterns: config.includeImplementationPatterns ?? false,
    includeEngagementPatterns: config.includeEngagementPatterns ?? false,
    includePrototypingTips: config.includePrototypingTips ?? false,
    specificGameType: config.gameType,
    specificGameLoop: config.gameLoop,
  });

  // Add custom instructions if provided
  const finalInstructions = config.customInstructions 
    ? `${systemMessage}\n\n## ADDITIONAL CONTEXT:\n${config.customInstructions}`
    : systemMessage;

  return new Agent({
    name: `GameAgent_${config.gameType || 'Generic'}`,
    model: anthropic("claude-3-7-sonnet-20250219"),
    instructions: finalInstructions,
    memory,
    tools: {
      update_todo_list: todoTool,
      get_game_templates: templateTool,
    },
  });
}

/**
 * Pre-configured agents for common game types
 */
export const gameAgents = {
  spaceShooter: () => createGameAgent({
    gameType: "spaceShooter",
    gameLoop: "shootAndDestroy",
    focusMechanics: ["movement", "collision", "scoring", "spawning"],
    includeImplementationPatterns: true,
    includeEngagementPatterns: true,
    customInstructions: "Focus on creating fast-paced action with satisfying shooting mechanics. Prioritize responsive controls and clear visual feedback."
  }),

  platformer: () => createGameAgent({
    gameType: "platformer", 
    gameLoop: "jumpAndRun",
    focusMechanics: ["movement", "collision", "powerUps"],
    includeImplementationPatterns: true,
    includeEngagementPatterns: true,
    customInstructions: "Emphasize tight jump controls and satisfying platforming mechanics. Include collectibles and progressive difficulty."
  }),

  puzzleGame: () => createGameAgent({
    gameType: "puzzleGame",
    focusMechanics: ["movement", "collision", "scoring"],
    includeEngagementPatterns: true,
    includePrototypingTips: true,
    customInstructions: "Focus on clear, logical rules and satisfying puzzle-solving mechanics. Provide immediate feedback for player actions."
  }),

  survivalGame: () => createGameAgent({
    gameType: "survivalGame",
    gameLoop: "collectAndAvoid",
    focusMechanics: ["movement", "collision", "spawning", "healthSystem"],
    includeImplementationPatterns: true,
    includeEngagementPatterns: true,
    customInstructions: "Create escalating tension through increasing difficulty. Balance challenge with player agency and clear feedback."
  }),

  towerDefense: () => createGameAgent({
    gameType: "towerDefense",
    gameLoop: "buildAndManage",
    focusMechanics: ["spawning", "collision", "scoring"],
    includeImplementationPatterns: true,
    includeEngagementPatterns: true,
    customInstructions: "Focus on strategic depth and resource management. Provide clear feedback on tower effectiveness and enemy progression."
  }),

  endlessRunner: () => createGameAgent({
    gameType: "endlessRunner",
    gameLoop: "jumpAndRun",
    focusMechanics: ["movement", "collision", "scoring", "spawning"],
    includeImplementationPatterns: true,
    includeEngagementPatterns: true,
    customInstructions: "Emphasize rhythm and flow. Create a sense of speed and momentum with clear obstacle telegraphing."
  })
};

/**
 * Get an agent based on user input analysis
 */
export function getAgentForUserInput(userInput: string): Agent {
  const input = userInput.toLowerCase();
  
  // Analyze user input to determine best agent
  if (input.includes("space") || input.includes("shoot") || input.includes("alien") || input.includes("invader")) {
    return gameAgents.spaceShooter();
  }
  
  if (input.includes("jump") || input.includes("platform") || input.includes("mario") || input.includes("sonic")) {
    return gameAgents.platformer();
  }
  
  if (input.includes("puzzle") || input.includes("match") || input.includes("tetris") || input.includes("solve")) {
    return gameAgents.puzzleGame();
  }
  
  if (input.includes("survive") || input.includes("avoid") || input.includes("dodge") || input.includes("snake")) {
    return gameAgents.survivalGame();
  }
  
  if (input.includes("tower") || input.includes("defense") || input.includes("strategy") || input.includes("protect")) {
    return gameAgents.towerDefense();
  }
  
  if (input.includes("run") || input.includes("endless") || input.includes("temple run") || input.includes("subway")) {
    return gameAgents.endlessRunner();
  }
  
  // Default to generic game agent with all templates available
  return createGameAgent({
    includeImplementationPatterns: true,
    includeEngagementPatterns: true,
    includePrototypingTips: true,
    customInstructions: "Analyze the user's request and choose the most appropriate game type and mechanics. Use the available templates to guide your implementation."
  });
}

/**
 * Utility to get template suggestions based on user input
 */
export function getTemplateSuggestions(userInput: string) {
  const input = userInput.toLowerCase();
  const suggestions: {
    gameType?: string;
    gameLoop?: string;
    mechanics: string[];
    tips: string[];
  } = {
    mechanics: [],
    tips: []
  };

  // Game type detection
  if (input.includes("space") || input.includes("shoot")) {
    suggestions.gameType = "spaceShooter";
    suggestions.gameLoop = "shootAndDestroy";
    suggestions.mechanics = ["movement", "collision", "scoring", "spawning"];
    suggestions.tips = ["Add screen shake on hits", "Use particle effects for explosions", "Include power-ups"];
  } else if (input.includes("jump") || input.includes("platform")) {
    suggestions.gameType = "platformer";
    suggestions.gameLoop = "jumpAndRun";
    suggestions.mechanics = ["movement", "collision", "powerUps"];
    suggestions.tips = ["Focus on tight jump controls", "Add coyote time", "Include collectibles"];
  } else if (input.includes("puzzle")) {
    suggestions.gameType = "puzzleGame";
    suggestions.mechanics = ["movement", "collision", "scoring"];
    suggestions.tips = ["Keep rules simple", "Provide clear feedback", "Add undo functionality"];
  }

  return suggestions;
}
