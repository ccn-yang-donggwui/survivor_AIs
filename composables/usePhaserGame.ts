import { ref, onMounted, onUnmounted } from 'vue';

interface GameInstance {
  game: unknown;
  destroy: () => void;
}

type GameLoader = () => Promise<{ createGame: (containerId: string) => GameInstance }>;

export function usePhaserGame(gameLoader: GameLoader, containerId: string) {
  const gameInstance = ref<GameInstance | null>(null);
  const isLoading = ref(true);
  const error = ref<Error | null>(null);

  onMounted(async () => {
    try {
      const module = await gameLoader();
      gameInstance.value = module.createGame(containerId);
      isLoading.value = false;
    } catch (e) {
      error.value = e as Error;
      isLoading.value = false;
    }
  });

  onUnmounted(() => {
    if (gameInstance.value) {
      gameInstance.value.destroy();
      gameInstance.value = null;
    }
  });

  return {
    gameInstance,
    isLoading,
    error
  };
}
