<template>
  <div class="phaser-container">
    <div v-if="isLoading" class="loading">Loading game...</div>
    <div v-if="error" class="error">{{ error.message }}</div>
    <div :id="containerId" class="game-canvas"></div>
    <NuxtLink to="/" class="back-button">Back to Menu</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { usePhaserGame } from '~/composables/usePhaserGame';

const props = defineProps<{
  gameModule: string;
  containerId: string;
}>();

const gameLoaders: Record<string, () => Promise<any>> = {
  'opus-ver': () => import('~/games/opus-ver'),
  'claude-ver': () => import('~/games/claude-ver'),
  'gemini-ver': () => import('~/games/gemini-ver'),
  'codex-ver': () => import('~/games/codex-ver'),
  'gemini-claude-doc': () => import('~/games/gemini-claude-doc'),
  'codex-claude-doc': () => import('~/games/codex-claude-doc'),
};

const { isLoading, error } = usePhaserGame(
  gameLoaders[props.gameModule],
  props.containerId
);
</script>

<style scoped>
.phaser-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #1a1a2e;
  position: relative;
}

.game-canvas {
  max-width: 100%;
  max-height: 100%;
}

.loading, .error {
  position: absolute;
  color: white;
  font-size: 1.5rem;
  z-index: 10;
}

.error {
  color: #ff4444;
}

.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  z-index: 100;
  transition: background 0.3s;
}

.back-button:hover {
  background: rgba(0, 0, 0, 0.9);
}
</style>
