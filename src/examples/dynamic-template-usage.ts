/**
 * Examples of how to dynamically reference game design templates within the app
 */

import { 
  buildSystemMessage,
  createGameAgent,
  gameAgents,
  getAgentForUserInput,
  getTemplateSuggestions,
  SUCCESSFUL_GAME_LOOPS,
  POPULAR_GAME_TYPES,
  CORE_GAME_MECHANICS
} from "@/lib";
import { templateTool } from "@/tools/template-tool";

// ============================================================================
// METHOD 1: Dynamic System Message Building
// ============================================================================

/**
 * Build system messages with specific game design context
 */
export function exampleDynamicSystemMessages() {
  // Basic system message (default)
  const basicMessage = buildSystemMessage();
  
  // System message with space shooter context
  const spaceShooterMessage = buildSystemMessage({
    includeGameTypes: true,
    includeGameLoops: true,
    includeMechanics: true,
    includeImplementationPatterns: true,
    specificGameType: "spaceShooter",
    specificGameLoop: "shootAndDestroy"
  });
  
  // System message with all templates for complex games
  const comprehensiveMessage = buildSystemMessage({
    includeGameLoops: true,
    includeGameTypes: true,
    includeMechanics: true,
    includeImplementationPatterns: true,
    includeEngagementPatterns: true,
    includePrototypingTips: true
  });
  
  return {
    basic: basicMessage,
    spaceShooter: spaceShooterMessage,
    comprehensive: comprehensiveMessage
  };
}

// ============================================================================
// METHOD 2: Context-Aware Agent Creation
// ============================================================================

/**
 * Create specialized agents for different game types
 */
export function exampleContextAwareAgents() {
  // Pre-configured agents
  const spaceShooterAgent = gameAgents.spaceShooter();
  const platformerAgent = gameAgents.platformer();
  const puzzleAgent = gameAgents.puzzleGame();
  
  // Custom agent with specific configuration
  const customRPGAgent = createGameAgent({
    gameLoop: "exploreAndDiscover",
    focusMechanics: ["movement", "collision", "powerUps", "healthSystem"],
    includeImplementationPatterns: true,
    includeEngagementPatterns: true,
    customInstructions: "Focus on character progression, inventory management, and story-driven gameplay. Include RPG elements like stats, equipment, and quests."
  });
  
  return {
    spaceShooter: spaceShooterAgent,
    platformer: platformerAgent,
    puzzle: puzzleAgent,
    customRPG: customRPGAgent
  };
}

// ============================================================================
// METHOD 3: User Input Analysis
// ============================================================================

/**
 * Automatically select the best agent based on user input
 */
export function exampleUserInputAnalysis() {
  const userInputs = [
    "Create a space invaders style game",
    "Build a Mario-like platformer",
    "Make a Tetris puzzle game",
    "I want a tower defense game",
    "Create a survival game where I avoid enemies"
  ];
  
  const agentSelections = userInputs.map(input => ({
    input,
    agent: getAgentForUserInput(input),
    suggestions: getTemplateSuggestions(input)
  }));
  
  return agentSelections;
}

// ============================================================================
// METHOD 4: Runtime Template Access
// ============================================================================

/**
 * Access templates at runtime for dynamic game generation
 */
export async function exampleRuntimeTemplateAccess() {
  // Get specific game type information
  const spaceShooterInfo = POPULAR_GAME_TYPES.spaceShooter;
  
  // Get specific game loop information
  const shootAndDestroyLoop = SUCCESSFUL_GAME_LOOPS.shootAndDestroy;
  
  // Get specific mechanics
  const movementMechanic = CORE_GAME_MECHANICS.movement;
  const collisionMechanic = CORE_GAME_MECHANICS.collision;
  
  // Use the template tool to get comprehensive information
  const templateToolResult = await templateTool.execute({
    templateType: "gameTypes",
    specificItem: "spaceShooter",
    gameContext: "I want to create a retro-style space shooter with power-ups"
  });
  
  return {
    gameType: spaceShooterInfo,
    gameLoop: shootAndDestroyLoop,
    mechanics: { movement: movementMechanic, collision: collisionMechanic },
    toolResult: templateToolResult
  };
}

// ============================================================================
// METHOD 5: Integration with Existing App Flow
// ============================================================================

/**
 * Example of how to integrate with the existing app creation flow
 */
export function exampleAppIntegration() {
  // This could be used in src/actions/create-app.ts
  
  const integrateWithCreateApp = (initialMessage: string) => {
    // Analyze the user's initial message
    const suggestions = getTemplateSuggestions(initialMessage);
    
    // Get the appropriate agent
    const agent = getAgentForUserInput(initialMessage);
    
    // Build a contextual system message
    const systemMessage = buildSystemMessage({
      includeGameTypes: !!suggestions.gameType,
      includeGameLoops: !!suggestions.gameLoop,
      includeMechanics: suggestions.mechanics.length > 0,
      includeImplementationPatterns: true,
      includeEngagementPatterns: true,
      specificGameType: suggestions.gameType as any,
      specificGameLoop: suggestions.gameLoop as any
    });
    
    return {
      agent,
      systemMessage,
      suggestions,
      templateContext: {
        gameType: suggestions.gameType,
        gameLoop: suggestions.gameLoop,
        recommendedMechanics: suggestions.mechanics,
        implementationTips: suggestions.tips
      }
    };
  };
  
  return integrateWithCreateApp;
}

// ============================================================================
// METHOD 6: Template-Based Game Generation
// ============================================================================

/**
 * Generate game specifications based on templates
 */
export function exampleTemplateBasedGeneration() {
  const generateGameSpec = (gameType: keyof typeof POPULAR_GAME_TYPES) => {
    const typeInfo = POPULAR_GAME_TYPES[gameType];
    const relevantMechanics = typeInfo.keyMechanics.map(mechanic => 
      CORE_GAME_MECHANICS[mechanic as keyof typeof CORE_GAME_MECHANICS]
    ).filter(Boolean);
    
    return {
      name: typeInfo.name,
      description: typeInfo.description,
      coreLoop: typeInfo.coreLoop,
      playerGoal: typeInfo.playerGoal,
      difficultyProgression: typeInfo.difficultyProgression,
      mechanics: relevantMechanics,
      implementationPriority: [
        "Set up basic player movement",
        "Implement core game mechanic",
        "Add collision detection", 
        "Create scoring system",
        "Add visual feedback",
        "Implement difficulty progression"
      ]
    };
  };
  
  // Generate specs for different game types
  return {
    spaceShooter: generateGameSpec("spaceShooter"),
    platformer: generateGameSpec("platformer"),
    puzzleGame: generateGameSpec("puzzleGame"),
    survivalGame: generateGameSpec("survivalGame"),
    towerDefense: generateGameSpec("towerDefense"),
    endlessRunner: generateGameSpec("endlessRunner")
  };
}

// ============================================================================
// USAGE SUMMARY
// ============================================================================

/**
 * Summary of all the ways to dynamically reference templates:
 * 
 * 1. buildSystemMessage() - Create custom system prompts with specific templates
 * 2. createGameAgent() - Build agents with game-specific context
 * 3. gameAgents.* - Use pre-configured agents for common game types
 * 4. getAgentForUserInput() - Auto-select agent based on user input
 * 5. getTemplateSuggestions() - Get template recommendations
 * 6. templateTool - Runtime access to templates via AI tool
 * 7. Direct imports - Access template data structures directly
 * 8. Integration patterns - Use in existing app flows
 */
