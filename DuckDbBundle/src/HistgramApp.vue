<script setup lang="ts">
/**
 * 1時間ごとのヒストグラムを表示する Vue3 app
 */
import { computed } from 'vue';
import type { HistgramState } from './resultTypes';

const props = defineProps<{ state: HistgramState }>();

const state = props.state;

const HISTOGRAM_HEIGHT = 500;

// スケーリング係数の計算
const scaleFactor = computed(() => {
  if (state.maxCount <= 0) return 1;
  return state.maxCount / HISTOGRAM_HEIGHT;
});

// バーの高さを計算
const getBarHeight = (count: number): number => {
  if (state.maxCount <= 0) return 0;
  return Math.round(count / scaleFactor.value);
};

// 時間帯によって色を変える
const getBarColor = (hour: number): string => {
  if (hour >= 6 && hour < 12) return '#4CAF50';   // 朝: 緑
  if (hour >= 12 && hour < 18) return '#2196F3';  // 昼: 青
  if (hour >= 18 && hour < 22) return '#FF9800';  // 夕方: オレンジ
  return '#9C27B0';                                // 夜: 紫
};

// ツールチップテキスト
const getTooltip = (bar: { day: number; hour: number; count: number }): string => {
  if (state.mode === 'day') {
    return `${bar.hour.toString().padStart(2, '0')}:00 - ${bar.hour.toString().padStart(2, '0')}:59\n${bar.count.toLocaleString()} 件`;
  }
  return `${bar.day}日 ${bar.hour.toString().padStart(2, '0')}:00 - ${bar.hour.toString().padStart(2, '0')}:59\n${bar.count.toLocaleString()} 件`;
};

// X軸ラベルの間隔
const labelInterval = computed(() => state.mode === 'month' ? 24 : 1);

// X軸ラベルのテキスト
const getLabelText = (bar: { day: number; hour: number }): string => {
  return state.mode === 'month' ? `${bar.day}日` : `${bar.hour}時`;
};

// 総件数
const totalCount = computed(() => state.bars.reduce((sum, bar) => sum + bar.count, 0));

// ヒストグラムの幅
const histogramWidth = computed(() => state.bars.length * state.barWidth);
</script>

<template>
  <div class="histgram-app">
    <div
      v-if="state.error"
      class="alert alert-danger mt-3"
      role="alert"
    >
      {{ state.error }}
    </div>
    <div
      v-else-if="state.isLoading"
      class="mt-3 d-flex align-items-center gap-2 text-muted"
    >
      <span
        class="spinner-border spinner-border-sm"
        role="status"
        aria-hidden="true"
      />
      <span>Running query... {{ state.currentRegisteringUrl }}</span>
    </div>
    <div
      v-else-if="state.bars.length > 0"
      class="mt-4"
    >
      <p class="mb-3">
        <strong style="font-size: 1.2em;">スケーリング係数: 1px = {{ scaleFactor.toFixed(2) }} 件</strong>
        <span class="ms-4">（総件数: {{ totalCount.toLocaleString() }} 件、最大: {{ state.maxCount.toLocaleString() }} 件/時）</span>
      </p>

      <div style="overflow-x: auto;">
        <div
          :style="{
            position: 'relative',
            height: (HISTOGRAM_HEIGHT + 60) + 'px',
            minWidth: histogramWidth + 60 + 'px'
          }"
        >
          <!-- Y軸ラベル -->
          <div
            :style="{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '50px',
              height: HISTOGRAM_HEIGHT + 'px',
              borderRight: '1px solid #ccc'
            }"
          >
            <span style="position: absolute; top: 0; right: 5px; font-size: 11px;">{{ state.maxCount }}</span>
            <span style="position: absolute; top: 50%; right: 5px; font-size: 11px; transform: translateY(-50%);">{{ Math.floor(state.maxCount / 2) }}</span>
            <span style="position: absolute; bottom: 0; right: 5px; font-size: 11px;">0</span>
          </div>

          <!-- ヒストグラムバー -->
          <div
            :style="{
              position: 'absolute',
              left: '55px',
              top: 0,
              display: 'flex',
              alignItems: 'flex-end',
              height: HISTOGRAM_HEIGHT + 'px'
            }"
          >
            <div
              v-for="(bar, index) in state.bars"
              :key="index"
              :style="{
                width: state.barWidth + 'px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }"
            >
              <div
                :style="{
                  width: Math.max(1, state.barWidth - 1) + 'px',
                  height: getBarHeight(bar.count) + 'px',
                  backgroundColor: getBarColor(bar.hour),
                  border: '1px solid rgba(0,0,0,0.2)'
                }"
                :title="getTooltip(bar)"
              />
            </div>
          </div>

          <!-- X軸ラベル -->
          <div
            :style="{
              position: 'absolute',
              left: '55px',
              top: (HISTOGRAM_HEIGHT + 5) + 'px',
              display: 'flex'
            }"
          >
            <template v-for="(bar, index) in state.bars" :key="index">
              <span
                v-if="index % labelInterval === 0"
                :style="{
                  position: 'absolute',
                  left: (index * state.barWidth) + 'px',
                  fontSize: '10px',
                  whiteSpace: 'nowrap',
                  transform: 'rotate(-45deg)',
                  transformOrigin: 'top left'
                }"
              >{{ getLabelText(bar) }}</span>
            </template>
          </div>
        </div>
      </div>
    </div>
    <div
      v-else-if="state.searchExecuted"
      class="alert alert-warning mt-3"
    >
      データが見つかりませんでした。
    </div>
  </div>
</template>
