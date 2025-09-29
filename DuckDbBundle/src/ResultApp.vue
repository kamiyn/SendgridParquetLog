<script setup lang="ts">
/**
 * DuckDB のクエリ結果を表示する Vue3 app
 */
import type { ResultState } from './resultTypes';

const props = defineProps<{ state: ResultState }>();

const state = props.state;
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
  </div>
</template>

<style scoped>
.result-app {
  width: 100%;
}
</style>
