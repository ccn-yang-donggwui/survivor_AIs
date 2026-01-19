<template>
  <div class="game-selector">
    <header class="header">
      <h1>🎮 Survivor Games Platform</h1>
      <p class="subtitle">AI가 만든 다양한 서바이버 게임을 비교해보세요</p>
    </header>

    <!-- Basic Editions -->
    <section class="section basic-section">
      <div class="section-header">
        <h2 class="section-title">BASIC EDITIONS</h2>
        <p class="section-desc">기본 버전들을 먼저 플레이해보세요</p>
      </div>
      <div class="game-grid three-col">
        <NuxtLink
          v-for="game in basicGames"
          :key="game.slug"
          :to="`/${game.slug}`"
          class="game-card basic-card"
        >
          <div class="card-icon">{{ game.icon }}</div>
          <h3>{{ game.title }}</h3>
          <p>{{ game.description }}</p>
          <span class="badge basic-badge">{{ game.ai }}</span>
        </NuxtLink>
      </div>
    </section>

    <!-- Hybrid Editions -->
    <section class="section hybrid-section">
      <div class="section-header">
        <h2 class="section-title">HYBRID EDITIONS</h2>
        <p class="section-desc">AI 협업으로 만든 버전</p>
      </div>
      <div class="game-grid two-col">
        <NuxtLink
          v-for="game in hybridGames"
          :key="game.slug"
          :to="`/${game.slug}`"
          class="game-card hybrid-card"
        >
          <div class="card-icon">{{ game.icon }}</div>
          <h3>{{ game.title }}</h3>
          <p>{{ game.description }}</p>
          <span class="badge hybrid-badge">{{ game.ai }}</span>
        </NuxtLink>
      </div>
    </section>

    <!-- Premium Edition -->
    <section class="section premium-section">
      <div class="section-header">
        <h2 class="section-title">⭐ PREMIUM EDITION</h2>
        <p class="section-desc">모든 기능이 포함된 완성판</p>
      </div>
      <NuxtLink
        :to="`/${premiumGame.slug}`"
        class="game-card premium-card"
      >
        <div class="premium-content">
          <div class="premium-header">
            <span class="premium-icon">🏆</span>
            <h3>{{ premiumGame.title }}</h3>
          </div>
          <p class="premium-desc">{{ premiumGame.description }}</p>
          <div class="feature-tags">
            <span v-for="feature in premiumGame.features" :key="feature" class="feature-tag">
              {{ feature }}
            </span>
          </div>
          <span class="badge premium-badge">{{ premiumGame.ai }}</span>
          <div class="play-button">PLAY NOW →</div>
        </div>
      </NuxtLink>
    </section>

    <footer class="footer">
      <p>Made with AI - Compare different AI implementations</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
const basicGames = [
  {
    slug: 'gemini-ver',
    title: 'Gemini Version',
    description: '미니멀한 3개 씬 구조의 기본 구현',
    ai: 'Gemini',
    icon: '💎'
  },
  {
    slug: 'codex-ver',
    title: 'Codex Version',
    description: 'JSON 기반 밸런스와 MetaStore 시스템',
    ai: 'Codex',
    icon: '📦'
  },
  {
    slug: 'claude-ver',
    title: 'Claude Version',
    description: '10종 무기, 보스, 패시브가 포함된 완성도 높은 구현',
    ai: 'Claude',
    icon: '🤖'
  },
];

const hybridGames = [
  {
    slug: 'gemini-claude-doc',
    title: 'Gemini + Claude Doc',
    description: 'DropSystem, WaveSystem 등 시스템 기반 아키텍처',
    ai: 'Gemini + Claude',
    icon: '🔗'
  },
  {
    slug: 'codex-claude-doc',
    title: 'Codex + Claude Doc',
    description: '7개 씬, 가상 조이스틱, 사운드 매니저 포함',
    ai: 'Codex + Claude',
    icon: '🔗'
  },
];

const premiumGame = {
  slug: 'opus-ver',
  title: 'Opus Version',
  description: '진화 시스템, 메타 업그레이드, 모바일 지원이 포함된 궁극의 에디션',
  ai: 'Claude Opus 4.5',
  icon: '🏆',
  features: ['진화 시스템', '메타 업그레이드', '19종 무기', '9종 진화무기', '모바일 지원']
};
</script>

<style scoped>
.game-selector {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Header */
.header {
  text-align: center;
  margin-bottom: 50px;
}

.header h1 {
  color: #fff;
  font-size: 2.8rem;
  margin-bottom: 12px;
  text-shadow: 0 0 20px rgba(74, 158, 255, 0.3);
}

.subtitle {
  color: #888;
  font-size: 1.1rem;
}

/* Section */
.section {
  width: 100%;
  max-width: 1000px;
  margin-bottom: 50px;
}

.section-header {
  margin-bottom: 24px;
  padding-left: 8px;
}

.section-title {
  color: #fff;
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 2px;
  margin-bottom: 6px;
}

.section-desc {
  color: #666;
  font-size: 0.9rem;
}

/* Game Grid */
.game-grid {
  display: grid;
  gap: 20px;
}

.game-grid.three-col {
  grid-template-columns: repeat(3, 1fr);
}

.game-grid.two-col {
  grid-template-columns: repeat(2, 1fr);
}

@media (max-width: 768px) {
  .game-grid.three-col,
  .game-grid.two-col {
    grid-template-columns: 1fr;
  }
}

/* Card Base */
.game-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 28px;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.game-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.game-card:hover::before {
  opacity: 1;
}

.card-icon {
  font-size: 2rem;
  margin-bottom: 12px;
}

.game-card h3 {
  color: #fff;
  font-size: 1.2rem;
  margin-bottom: 10px;
  font-weight: 600;
}

.game-card p {
  color: #999;
  font-size: 0.88rem;
  line-height: 1.6;
  margin-bottom: 16px;
}

/* Badge */
.badge {
  display: inline-block;
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Basic Card Style */
.basic-card:hover {
  background: rgba(74, 158, 255, 0.08);
  border-color: rgba(74, 158, 255, 0.4);
  transform: translateY(-4px);
}

.basic-card::before {
  background: linear-gradient(90deg, #4a9eff, #2563eb);
}

.basic-badge {
  background: rgba(74, 158, 255, 0.2);
  color: #4a9eff;
  border: 1px solid rgba(74, 158, 255, 0.3);
}

/* Hybrid Card Style */
.hybrid-card:hover {
  background: rgba(168, 85, 247, 0.08);
  border-color: rgba(168, 85, 247, 0.4);
  transform: translateY(-4px);
}

.hybrid-card::before {
  background: linear-gradient(90deg, #a855f7, #7c3aed);
}

.hybrid-badge {
  background: rgba(168, 85, 247, 0.2);
  color: #a855f7;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

/* Premium Card Style */
.premium-card {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(234, 88, 12, 0.05) 100%);
  border: 2px solid rgba(245, 158, 11, 0.3);
  padding: 0;
  position: relative;
}

.premium-card::before {
  height: 4px;
  background: linear-gradient(90deg, #f59e0b, #ea580c, #f59e0b);
  opacity: 1;
}

.premium-card::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.4), transparent, rgba(234, 88, 12, 0.4));
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.premium-card:hover {
  transform: translateY(-6px);
  border-color: rgba(245, 158, 11, 0.6);
  box-shadow: 0 20px 40px rgba(245, 158, 11, 0.15);
}

.premium-card:hover::after {
  opacity: 1;
}

.premium-content {
  padding: 36px;
}

.premium-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.premium-icon {
  font-size: 2.5rem;
}

.premium-header h3 {
  color: #fff;
  font-size: 1.6rem;
  margin: 0;
  font-weight: 700;
}

.premium-desc {
  color: #bbb;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 20px;
}

.feature-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.feature-tag {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid rgba(245, 158, 11, 0.25);
}

.premium-badge {
  background: linear-gradient(135deg, #f59e0b, #ea580c);
  color: #fff;
  border: none;
  font-weight: 600;
}

.play-button {
  margin-top: 24px;
  padding: 14px 32px;
  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
  color: #fff;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  text-align: center;
  transition: all 0.3s ease;
}

.premium-card:hover .play-button {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  transform: scale(1.02);
}

/* Footer */
.footer {
  margin-top: 40px;
  padding: 20px;
  text-align: center;
}

.footer p {
  color: #555;
  font-size: 0.85rem;
}

/* Responsive */
@media (max-width: 768px) {
  .header h1 {
    font-size: 1.8rem;
  }

  .subtitle {
    font-size: 0.95rem;
  }

  .section {
    margin-bottom: 40px;
  }

  .premium-header h3 {
    font-size: 1.3rem;
  }

  .feature-tags {
    justify-content: center;
  }
}
</style>
