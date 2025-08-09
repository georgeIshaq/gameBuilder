import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { 
  SUCCESSFUL_GAME_LOOPS, 
  CORE_GAME_MECHANICS, 
  POPULAR_GAME_TYPES,
  PHASER_IMPLEMENTATION_PATTERNS,
  ENGAGEMENT_PATTERNS,
  QUICK_PROTOTYPING_TIPS,
  GAME_FEEL_ENHANCEMENTS,
  DIFFICULTY_PROGRESSION_STRATEGIES,
  COMMON_GAME_PATTERNS
} from "@/lib/game-design-templates";

export const templateTool = createTool({
  id: "get_game_templates",
  description: "Get game design templates, patterns, and implementation examples to help create better games",
  inputSchema: z.object({
    templateType: z.enum([
      "gameLoops",
      "gameTypes", 
      "mechanics",
      "implementationPatterns",
      "engagementPatterns",
      "prototypingTips",
      "gameFeel",
      "difficultyProgression",
      "commonPatterns",
      "all"
    ]).describe("Type of template information to retrieve"),
    specificItem: z.string().optional().describe("Get specific item by key (e.g., 'spaceShooter', 'collectAndAvoid')"),
    gameContext: z.string().optional().describe("Context about the game being built to get relevant suggestions")
  }),
  execute: async ({ templateType, specificItem, gameContext }) => {
    let result: any = {};

    switch (templateType) {
      case "gameLoops":
        result = specificItem && SUCCESSFUL_GAME_LOOPS[specificItem] 
          ? { [specificItem]: SUCCESSFUL_GAME_LOOPS[specificItem] }
          : SUCCESSFUL_GAME_LOOPS;
        break;
        
      case "gameTypes":
        result = specificItem && POPULAR_GAME_TYPES[specificItem]
          ? { [specificItem]: POPULAR_GAME_TYPES[specificItem] }
          : POPULAR_GAME_TYPES;
        break;
        
      case "mechanics":
        result = specificItem && CORE_GAME_MECHANICS[specificItem]
          ? { [specificItem]: CORE_GAME_MECHANICS[specificItem] }
          : CORE_GAME_MECHANICS;
        break;
        
      case "implementationPatterns":
        result = specificItem && PHASER_IMPLEMENTATION_PATTERNS[specificItem]
          ? { [specificItem]: PHASER_IMPLEMENTATION_PATTERNS[specificItem] }
          : PHASER_IMPLEMENTATION_PATTERNS;
        break;
        
      case "engagementPatterns":
        result = ENGAGEMENT_PATTERNS;
        break;
        
      case "prototypingTips":
        result = QUICK_PROTOTYPING_TIPS;
        break;
        
      case "gameFeel":
        result = GAME_FEEL_ENHANCEMENTS;
        break;
        
      case "difficultyProgression":
        result = DIFFICULTY_PROGRESSION_STRATEGIES;
        break;
        
      case "commonPatterns":
        result = COMMON_GAME_PATTERNS;
        break;
        
      case "all":
        result = {
          gameLoops: SUCCESSFUL_GAME_LOOPS,
          gameTypes: POPULAR_GAME_TYPES,
          mechanics: CORE_GAME_MECHANICS,
          implementationPatterns: PHASER_IMPLEMENTATION_PATTERNS,
          engagementPatterns: ENGAGEMENT_PATTERNS,
          prototypingTips: QUICK_PROTOTYPING_TIPS,
          gameFeel: GAME_FEEL_ENHANCEMENTS,
          difficultyProgression: DIFFICULTY_PROGRESSION_STRATEGIES,
          commonPatterns: COMMON_GAME_PATTERNS
        };
        break;
    }

    // Add contextual suggestions if game context is provided
    if (gameContext) {
      const suggestions = getContextualSuggestions(gameContext);
      result = {
        ...result,
        contextualSuggestions: suggestions
      };
    }

    return {
      templateType,
      specificItem,
      gameContext,
      templates: result,
      usage: "Use these templates as reference for game design and implementation. Each template includes descriptions, examples, and implementation patterns."
    };
  },
});

function getContextualSuggestions(gameContext: string): any {
  const context = gameContext.toLowerCase();
  const suggestions: any = {
    recommendedGameTypes: [],
    recommendedMechanics: [],
    implementationTips: []
  };

  // Analyze context and provide relevant suggestions
  if (context.includes("space") || context.includes("shoot") || context.includes("alien")) {
    suggestions.recommendedGameTypes.push("spaceShooter");
    suggestions.recommendedMechanics.push("movement", "collision", "spawning");
    suggestions.implementationTips.push("Use timed enemy spawning", "Add bullet physics", "Include power-ups");
  }

  if (context.includes("jump") || context.includes("platform") || context.includes("mario")) {
    suggestions.recommendedGameTypes.push("platformer");
    suggestions.recommendedMechanics.push("movement", "collision", "powerUps");
    suggestions.implementationTips.push("Add gravity physics", "Create solid platforms", "Include collectibles");
  }

  if (context.includes("puzzle") || context.includes("match") || context.includes("tetris")) {
    suggestions.recommendedGameTypes.push("puzzleGame");
    suggestions.recommendedMechanics.push("scoring", "collision");
    suggestions.implementationTips.push("Focus on clear rules", "Add visual feedback", "Include undo mechanics");
  }

  if (context.includes("survive") || context.includes("endless") || context.includes("avoid")) {
    suggestions.recommendedGameTypes.push("survivalGame", "endlessRunner");
    suggestions.recommendedMechanics.push("movement", "collision", "spawning", "healthSystem");
    suggestions.implementationTips.push("Increase difficulty over time", "Add score multipliers", "Include near-miss rewards");
  }

  if (context.includes("tower") || context.includes("defense") || context.includes("strategy")) {
    suggestions.recommendedGameTypes.push("towerDefense");
    suggestions.recommendedMechanics.push("spawning", "collision", "scoring");
    suggestions.implementationTips.push("Create upgrade paths", "Balance economy", "Add strategic depth");
  }

  return suggestions;
}
