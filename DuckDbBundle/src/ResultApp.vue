<script setup lang="ts">
/**
 * DuckDB のクエリ結果を表示する Vue3 app
 */
import { computed, ref, onMounted, onUnmounted } from 'vue';
import type { ResultState } from './resultTypes';

const props = defineProps<{ state: ResultState }>();

const state = props.state;

const selectedRowIndex = ref<number | null>(null);
const editableSql = ref<string>('');
const isEditingMode = ref<boolean>(false);

const selectedRow = computed<ReadonlyArray<string> | null>(() => {
  const index = selectedRowIndex.value;
  return typeof index === 'number' ? state.rows[index] : null;
});

const isSgTemplateIdColumn = (columnIndex: number): boolean => {
  return state.columns[columnIndex] === 'sg_template_id';
};

const getSgTemplateIdLink = (value: string): string => {
  return `/sg_template_id/${encodeURIComponent(value)}`;
};

const handleRowClick = (rowIndex: number) => {
  selectedRowIndex.value = rowIndex;
};

const closeRowDialog = () => {
  selectedRowIndex.value = null;
};

// 編集モードに切り替え
const handleEditMode = () => {
  editableSql.value = state.sql;
  isEditingMode.value = true;
};

// 編集モードを終了
const handleExitEditMode = () => {
  isEditingMode.value = false;
};

// SQL 実行ハンドラー
const handleExecuteSql = async () => {
  if (state.executeCustomSql && editableSql.value.trim()) {
    await state.executeCustomSql(editableSql.value);
  }
};
// Handle ESC key to close dialog when open
const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && selectedRowIndex.value !== null) {
    e.preventDefault();
    closeRowDialog();
  }
};

onMounted(() => {
  window.addEventListener('keydown', onKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown);
});
</script>

<template>
  <div class="result-app">
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
      v-else-if="state.rows.length > 0 && state.columns.length > 0"
      class="table-responsive mt-4"
    >
      <table class="table table-striped table-sm table-bordered align-middle">
        <thead>
          <tr>
            <th
              v-for="column in state.targetColumn"
              :key="column"
              scope="col"
            >
              {{ state.columns[column] }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, rowIndex) in state.rows"
            :key="rowIndex"
            class="clickable-row"
            @click="handleRowClick(rowIndex)"
            @keydown.enter.prevent="handleRowClick(rowIndex)"
            @keydown.space.prevent="handleRowClick(rowIndex)"
          >
            <td
              v-for="columnIndex in state.targetColumn"
              :key="columnIndex"
              class="text-nowrap"
            >
              <a
                v-if="isSgTemplateIdColumn(columnIndex) && row[columnIndex]"
                :href="getSgTemplateIdLink(row[columnIndex])"
                target="_blank"
                rel="noopener noreferrer"
                @click.stop
              >{{ row[columnIndex] }}</a>
              <span v-else>{{ row[columnIndex] }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div
      v-if="selectedRow"
      class="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="row-dialog-title"
      tabindex="-1"
      @click.self="closeRowDialog"
    >
      <div class="modal-content">
        <header class="modal-header">
          <h5
            id="row-dialog-title"
            class="modal-title"
          >
            Details
          </h5>
          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            @click="closeRowDialog"
          />
        </header>
        <div class="modal-body">
          <table class="table table-striped table-sm table-bordered align-middle">
            <tbody>
              <tr
                v-for="(columnName, columnIndex) in state.columns"
                :key="columnIndex"
              >
                <th
                  scope="row"
                  class="text-nowrap align-top"
                >
                  {{ columnName }}
                </th>
                <td>
                  <a
                    v-if="columnName === 'sg_template_id' && selectedRow[columnIndex]"
                    :href="getSgTemplateIdLink(selectedRow[columnIndex])"
                    target="_blank"
                    rel="noopener noreferrer"
                  >{{ selectedRow[columnIndex] }}</a>
                  <span v-else>{{ selectedRow[columnIndex] }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <footer class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            @click="closeRowDialog"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
    <div
      v-if="state.sql"
      class="mt-4"
    >
      <h5 class="mb-2">
        SQL Query
      </h5>
      <!-- 読み取り専用モード -->
      <div v-if="!isEditingMode">
        <pre
          class="border rounded p-2 bg-light"
          style="width: 100%; max-width: 960px; overflow-x: auto; font-size: 0.875rem;"
        >{{ state.sql }}</pre>
        <button
          type="button"
          class="btn btn-secondary mt-2"
          @click="handleEditMode"
        >
          編集
        </button>
      </div>
      <!-- 編集モード -->
      <div v-else>
        <div class="mb-2">
          <textarea
            v-model="editableSql"
            class="form-control font-monospace"
            rows="10"
            style="width: 100%; max-width: 960px; font-size: 0.875rem;"
            :disabled="state.isLoading"
          />
        </div>
        <div class="d-flex gap-2">
          <button
            type="button"
            class="btn btn-primary"
            :disabled="state.isLoading || !editableSql.trim()"
            @click="handleExecuteSql"
          >
            <span
              v-if="state.isLoading"
              class="spinner-border spinner-border-sm me-1"
              role="status"
              aria-hidden="true"
            />
            {{ state.isLoading ? '検索中...' : '検索' }}
          </button>
          <button
            type="button"
            class="btn btn-secondary"
            :disabled="state.isLoading"
            @click="handleExitEditMode"
          >
            編集モードをやめる
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<!-- StyleSheet は Blazor 側 SendgridParquetViewer/wwwroot/app.css で指定する
<style scoped>
</style>
-->
