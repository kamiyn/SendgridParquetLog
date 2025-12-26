<script setup lang="ts">
/**
 * 1時間ごとのヒストグラムを表示する Vue3 app
 */
import { computed, ref } from 'vue';
import type { HistogramState } from './resultTypes';

const props = defineProps<{ state: HistogramState }>();

const state = props.state;

const HISTOGRAM_HEIGHT = 500;

// 1-2-5系列のスケール値リストを生成（0.01から50000まで）
function generate125ScaleList(): number[] {
  const scales: number[] = [];
  const bases = [1, 2, 5];
  // 10^-2 から 10^4 まで
  for (let exp = -2; exp <= 4; exp++) {
    const multiplier = Math.pow(10, exp);
    for (const base of bases) {
      const value = base * multiplier;
      if (value >= 0.01 && value <= 50000) {
        scales.push(value);
      }
    }
  }
  return scales;
}

const scaleList = generate125ScaleList();

// 1-2-5系列で量子化（1未満も対応）
function quantizeTo125(value: number): number {
  if (value <= 0.01) return 0.01;

  // scaleListから最も近い値を選択（切り上げ方向）
  for (const scale of scaleList) {
    if (scale >= value) return scale;
  }
  return scaleList[scaleList.length - 1];
}

// スライダーのインデックスから値を取得
function scaleIndexToValue(index: number): number {
  return scaleList[Math.max(0, Math.min(index, scaleList.length - 1))];
}

// 値からスライダーのインデックスを取得
function valueToScaleIndex(value: number): number {
  const index = scaleList.findIndex(s => s >= value);
  return index >= 0 ? index : scaleList.length - 1;
}

// スケーリング係数（ref）
const scaleFactorInitialValue = 1;
const scaleFactor = ref(scaleFactorInitialValue);
const scaleSliderIndex = ref(valueToScaleIndex(scaleFactorInitialValue));

// スケールをリセット（検索結果が更新されたときに呼び出す）
function resetScale() {
  if (state.maxCount <= 0) {
    scaleFactor.value = 1;
    scaleSliderIndex.value = valueToScaleIndex(1);
    return;
  }
  const rawScale = state.maxCount / HISTOGRAM_HEIGHT;
  const initialScale = quantizeTo125(rawScale);
  scaleFactor.value = initialScale;
  scaleSliderIndex.value = valueToScaleIndex(initialScale);
}

defineExpose({ resetScale });

// スライダー変更時のハンドラ
function onScaleSliderChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const index = parseInt(target.value, 10);
  scaleSliderIndex.value = index;
  scaleFactor.value = scaleIndexToValue(index);
}

// バーの生の高さを計算（クリッピングなし）
const getRawBarHeight = (count: number): number => {
  if (state.maxCount <= 0) return 0;
  return Math.round(count / scaleFactor.value);
};

// バーの高さを計算（クリッピングあり）
const getBarHeight = (count: number): number => {
  const rawHeight = getRawBarHeight(count);
  return Math.min(rawHeight, HISTOGRAM_HEIGHT);
};

// バーがオーバーフローしているか
const isBarOverflow = (count: number): boolean => {
  return getRawBarHeight(count) > HISTOGRAM_HEIGHT;
};

// いずれかのバーがオーバーフローしているか
const hasOverflow = computed(() => {
  return state.bars.some(bar => isBarOverflow(bar.count));
});

// 時間帯によって色を変える（白背景でも十分なコントラストがあり、色覚多様性にも配慮した配色）
const getBarColor = (hour: number): string => {
  if (hour >= 6 && hour < 12) return '#1B9E77'; // 朝: 緑系
  if (hour >= 12 && hour < 18) return '#D95F02'; // 昼: オレンジ系
  if (hour >= 18 && hour < 22) return '#7570B3'; // 夕方: 青紫系
  return '#E7298A'; // 夜: マゼンタ系
};

// ツールチップテキスト
const getTooltip = (bar: { day: number, hour: number, count: number }): string => {
  if (state.mode === 'day') {
    return `${bar.hour.toString().padStart(2, '0')}:00 - ${bar.hour.toString().padStart(2, '0')}:59\n${bar.count.toLocaleString()} 件`;
  }
  return `${bar.day}日 ${bar.hour.toString().padStart(2, '0')}:00 - ${bar.hour.toString().padStart(2, '0')}:59\n${bar.count.toLocaleString()} 件`;
};

// X軸ラベルの間隔
const labelInterval = computed(() => state.mode === 'month' ? 24 : 1);

// X軸ラベルのテキスト
const getLabelText = (bar: { day: number, hour: number }): string => {
  return state.mode === 'month' ? `${bar.day}日` : `${bar.hour}時`;
};

// 総件数
const totalCount = computed(() => state.bars.reduce((sum, bar) => sum + bar.count, 0));

// ヒストグラムの幅
const histogramWidth = computed(() => state.bars.length * state.barWidth);

// 日ごとの集計データ（月モード用）
const dailySummary = computed(() => {
  if (state.mode !== 'month') return [];
  const summary: { day: number, total: number }[] = [];
  const grouped = new Map<number, number>();
  for (const bar of state.bars) {
    grouped.set(bar.day, (grouped.get(bar.day) ?? 0) + bar.count);
  }
  for (const [day, total] of grouped) {
    summary.push({ day, total });
  }
  return summary.sort((a, b) => a.day - b.day);
});
</script>

<template>
  <div class="histogram-app">
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
      <div class="mb-3">
        <div class="d-flex align-items-center gap-3 flex-wrap">
          <strong style="font-size: 1.2em;">スケーリング係数: 1px = {{ scaleFactor }} 件</strong>
          <div class="d-flex align-items-center gap-2">
            <span style="font-size: 0.9em;">小</span>
            <input
              type="range"
              :min="0"
              :max="scaleList.length - 1"
              :value="scaleSliderIndex"
              style="width: 200px;"
              @input="onScaleSliderChange"
            >
            <span style="font-size: 0.9em;">大</span>
          </div>
          <span class="text-muted">（総件数: {{ totalCount.toLocaleString() }} 件、最大: {{ state.maxCount.toLocaleString() }} 件/時）</span>
        </div>
        <div
          v-if="hasOverflow"
          class="alert alert-warning mt-2 py-1 px-2 d-inline-block"
          style="font-size: 0.85em;"
        >
          一部のバーが表示領域を超えています。スケールを大きくすると全体が表示されます。
        </div>
      </div>

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
            <span style="position: absolute; top: 0; right: 5px; font-size: 11px;">{{ Math.round(HISTOGRAM_HEIGHT * scaleFactor) }}</span>
            <span style="position: absolute; top: 50%; right: 5px; font-size: 11px; transform: translateY(-50%);">{{ Math.round(HISTOGRAM_HEIGHT * scaleFactor / 2) }}</span>
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
                alignItems: 'center',
                position: 'relative'
              }"
            >
              <!-- オーバーフローインジケーター -->
              <div
                v-if="isBarOverflow(bar.count)"
                :style="{
                  position: 'absolute',
                  top: '-16px',
                  width: Math.max(1, state.barWidth - 1) + 'px',
                  textAlign: 'center',
                  color: '#dc3545',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }"
                :title="'表示領域を超えています: ' + bar.count.toLocaleString() + ' 件'"
              >
                ▲
              </div>
              <div
                :style="{
                  width: Math.max(1, state.barWidth - 1) + 'px',
                  height: getBarHeight(bar.count) + 'px',
                  backgroundColor: getBarColor(bar.hour),
                  border: '1px solid rgba(0,0,0,0.2)',
                  borderTop: isBarOverflow(bar.count) ? '3px solid #dc3545' : '1px solid rgba(0,0,0,0.2)'
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
            <template v-for="(bar, index) in state.bars"
                      :key="index"
            >
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

      <!-- 数値テーブル -->
      <div class="mt-4">
        <h5>数値データ</h5>

        <!-- 日モード: 時間ごとの件数 -->
        <div v-if="state.mode === 'day'">
          <table class="table table-sm table-bordered"
                 style="width: auto;"
          >
            <thead>
              <tr>
                <th>時間</th>
                <th class="text-end">
                  件数
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="bar in state.bars"
                  :key="bar.hour"
              >
                <td>{{ bar.hour }}時</td>
                <td class="text-end">
                  {{ bar.count.toLocaleString() }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 月モード: 日ごとの件数 -->
        <div v-else>
          <table class="table table-sm table-bordered"
                 style="width: auto;"
          >
            <thead>
              <tr>
                <th>日</th>
                <th class="text-end">
                  件数
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in dailySummary"
                  :key="item.day"
              >
                <td>{{ item.day }}日</td>
                <td class="text-end">
                  {{ item.total.toLocaleString() }}
                </td>
              </tr>
            </tbody>
          </table>
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
