<template>
  <div class="game-selector">
    <h1>Survivor Games Platform</h1>
    <p class="subtitle">Select a game version to play</p>

    <div class="game-grid">
      <NuxtLink
        v-for="game in games"
        :key="game.slug"
        :to="`/${game.slug}`"
        class="game-card"
      >
        <h2>{{ game.title }}</h2>
        <p>{{ game.description }}</p>
        <span class="badge">{{ game.ai }}</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const games = [
  {
    slug: 'opus-ver',
    title: 'Opus Version',
    description: 'Ultimate edition with Evolution system, Meta upgrades, 10 weapons + 9 evolved weapons, Mobile support',
    ai: 'Claude Opus 4.5'
  },
  {
    slug: 'claude-ver',
    title: 'Claude Version',
    description: 'Most complete implementation with 10 weapons, bosses, and passives',
    ai: 'Claude'
  },
  {
    slug: 'gemini-ver',
    title: 'Gemini Version',
    description: 'Minimal structure with 3 scenes',
    ai: 'Gemini'
  },
  {
    slug: 'codex-ver',
    title: 'Codex Version',
    description: 'Balance JSON-based with MetaStore system',
    ai: 'Codex'
  },
  {
    slug: 'gemini-claude-doc',
    title: 'Gemini + Claude Doc',
    description: 'System-based architecture with DropSystem, WaveSystem',
    ai: 'Gemini + Claude'
  },
  {
    slug: 'codex-claude-doc',
    title: 'Codex + Claude Doc',
    description: '7 scenes with VirtualJoystick and SoundManager',
    ai: 'Codex + Claude'
  },
];
</script>

<style scoped>
.game-selector {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

h1 {
  color: #eee;
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.subtitle {
  color: #888;
  margin-bottom: 40px;
}

.game-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  max-width: 1200px;
  width: 100%;
}

.game-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
}

.game-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-4px);
  border-color: #4a9eff;
}

.game-card h2 {
  color: #fff;
  font-size: 1.3rem;
  margin-bottom: 8px;
}

.game-card p {
  color: #aaa;
  font-size: 0.9rem;
  line-height: 1.5;
}

.badge {
  display: inline-block;
  margin-top: 12px;
  padding: 4px 12px;
  background: #4a9eff;
  color: white;
  border-radius: 20px;
  font-size: 0.75rem;
}
</style>
