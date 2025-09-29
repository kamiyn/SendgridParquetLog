<script setup lang="ts">
/**
 * DuckDB のクエリ結果を表示する Vue3 app
 */
import { computed, ref } from 'vue';
import type { ResultState } from './resultTypes';

const props = defineProps<{ state: ResultState }>();

const state = props.state;

const selectedRowIndex = ref<number | null>(null);

const selectedRow = computed<ReadonlyArray<string> | null>(() => {
  const index = selectedRowIndex.value;
  return typeof index === 'number' ? state.rows[index] : null;
});

const handleRowClick = (rowIndex: number) => {
  selectedRowIndex.value = rowIndex;
};

const closeRowDialog = () => {
  selectedRowIndex.value = null;
};
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
      <span>Running query...</span>
    </div>
    <div
      v-else-if="state.rows.length > 0 && state.columns.length > 0"
      class="table-responsive mt-4"
    >
      <table class="table table-striped table-sm align-middle">
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
            role="button"
            tabindex="0"
            @click="handleRowClick(rowIndex)"
            @keydown.enter.prevent="handleRowClick(rowIndex)"
            @keydown.space.prevent="handleRowClick(rowIndex)"
          >
            <td
              v-for="columnIndex in state.targetColumn"
              :key="columnIndex"
              class="text-nowrap"
            >
              {{ row[columnIndex] }}
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
          <h5 id="row-dialog-title" class="modal-title">Row details</h5>
          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            @click="closeRowDialog"
          />
        </header>
        <div class="modal-body">
          <table class="table table-borderless table-sm mb-0">
            <tbody>
              <tr
                v-for="(columnName, columnIndex) in state.columns"
                :key="columnIndex"
              >
                <th scope="row" class="text-nowrap align-top">
                  {{ columnName }}
                </th>
                <td>{{ selectedRow[columnIndex] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <footer class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeRowDialog">
            Close
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
.result-app {
  width: 100%;
}

.clickable-row {
  cursor: pointer;
}

.clickable-row:focus {
  outline: 2px solid var(--bs-primary, #0d6efd);
  outline-offset: -2px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 1rem;
  z-index: 1050;
}

.modal-content {
  width: min(640px, 100%);
  max-height: min(540px, 100%);
  display: flex;
  flex-direction: column;
  background-color: var(--bs-body-bg, #fff);
  border-radius: 0.5rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.modal-header,
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border: 0;
}

.modal-body {
  padding: 0.75rem 1rem 1rem;
  overflow-y: auto;
}

</style>
