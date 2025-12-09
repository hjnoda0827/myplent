<template>
    <header class="py-3 space-y-2 sm:space-y-3">
      <div class="flex items-center justify-between gap-2 sm:gap-3">
        <div>
          <p class="text-xs tracking-wide uppercase text-slate-500">記録</p>
          <h1 class="text-lg font-semibold text-slate-900 sm:text-xl">管理記録の閲覧</h1>
          <p class="text-xs sm:text-sm text-slate-600">
            植物/日付で絞り込み、リストまたはカレンダーで確認できます。
          </p>
        </div>
        <div class="hidden p-1 bg-white border rounded-lg shadow-sm sm:flex border-slate-200">
          <button
            class="px-3 py-1 text-xs font-medium rounded-md sm:text-sm"
            :class="viewMode === 'list' ? 'bg-emerald-500 text-white' : 'text-slate-700'"
            @click="viewMode = 'list'"
          >
            リスト
          </button>
          <button
            class="px-3 py-1 text-xs font-medium rounded-md sm:text-sm"
            :class="viewMode === 'day' ? 'bg-emerald-500 text-white' : 'text-slate-700'"
            @click="viewMode = 'day'"
          >
            日間
          </button>
          <button
            class="px-3 py-1 text-xs font-medium rounded-md sm:text-sm"
            :class="viewMode === 'week' ? 'bg-emerald-500 text-white' : 'text-slate-700'"
            @click="viewMode = 'week'"
          >
            週間
          </button>
          <button
            class="px-3 py-1 text-xs font-medium rounded-md sm:text-sm"
            :class="viewMode === 'calendar' ? 'bg-emerald-500 text-white' : 'text-slate-700'"
            @click="viewMode = 'calendar'"
          >
            カレンダー
          </button>
        </div>
      </div>
      <div class="grid grid-cols-4 gap-2 sm:hidden">
        <button
          class="px-3 py-2 text-xs font-medium border rounded-lg shadow-sm"
          :class="
            viewMode === 'list'
              ? 'border-emerald-500 bg-white text-emerald-700'
              : 'border-slate-200 bg-slate-100 text-slate-700'
          "
          @click="viewMode = 'list'"
        >
          リスト
        </button>
        <button
          class="px-3 py-2 text-xs font-medium border rounded-lg shadow-sm"
          :class="
            viewMode === 'day'
              ? 'border-emerald-500 bg-white text-emerald-700'
              : 'border-slate-200 bg-slate-100 text-slate-700'
          "
          @click="viewMode = 'day'"
        >
          日間
        </button>
        <button
          class="px-3 py-2 text-xs font-medium border rounded-lg shadow-sm"
          :class="
            viewMode === 'week'
              ? 'border-emerald-500 bg-white text-emerald-700'
              : 'border-slate-200 bg-slate-100 text-slate-700'
          "
          @click="viewMode = 'week'"
        >
          週間
        </button>
        <button
          class="px-3 py-2 text-xs font-medium border rounded-lg shadow-sm"
          :class="
            viewMode === 'calendar'
              ? 'border-emerald-500 bg-white text-emerald-700'
              : 'border-slate-200 bg-slate-100 text-slate-700'
          "
          @click="viewMode = 'calendar'"
        >
          カレンダー
        </button>
      </div>
    </header>

    <div class="flex flex-col gap-2 p-3 bg-white shadow-sm rounded-2xl ring-1 ring-slate-200 sm:p-4">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div class="flex flex-col flex-1 gap-1">
          <label class="text-xs font-medium sm:text-sm text-slate-700">植物</label>
          <select
            v-model="filters.plantId"
            class="w-full px-3 py-2 text-xs border rounded-lg border-slate-200 sm:text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          >
            <option value="">すべて</option>
            <option v-for="p in plants" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>
        <div class="flex flex-col w-full gap-1 sm:w-48">
          <label class="text-xs font-medium sm:text-sm text-slate-700">日付</label>
          <input
            type="date"
            v-model="filters.date"
            class="w-full px-3 py-2 text-xs border rounded-lg border-slate-200 sm:text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
        </div>
        <button
          @click="fetchRecords"
          :disabled="loading"
          class="w-full px-4 py-2 text-xs font-semibold text-white rounded-lg shadow sm:w-28 bg-emerald-500 sm:text-sm hover:bg-emerald-600"
        >
          {{ loading ? "読み込み中..." : "検索" }}
        </button>
      </div>
      <p v-if="errorMessage" class="text-xs text-red-500 sm:text-sm">{{ errorMessage }}</p>
    </div>

    <div
      v-if="loading"
      class="p-4 text-sm text-center bg-white shadow-sm rounded-2xl text-slate-500 ring-1 ring-slate-200"
    >
      読み込み中...
    </div>
    <div
      v-else-if="records.length === 0"
      class="p-4 text-sm text-center bg-white shadow-sm rounded-2xl text-slate-500 ring-1 ring-slate-200"
    >
      記録がありません。
    </div>

    <template v-else>
      <!-- リストモード -->
      <div v-if="viewMode === 'list'" class="overflow-x-auto shadow-sm rounded-2xl ring-1 ring-slate-200">
        <table class="w-full bg-white">
          <thead class="border-b bg-slate-50 border-slate-200">
            <tr>
              <th
                @click="handleSort('plant')"
                class="px-4 py-3 text-xs font-semibold text-left cursor-pointer select-none text-slate-700 hover:bg-slate-100"
              >
                植物{{ getSortIndicator('plant') }}
              </th>
              <th
                @click="handleSort('date')"
                class="px-4 py-3 text-xs font-semibold text-left cursor-pointer select-none text-slate-700 hover:bg-slate-100"
              >
                記録日{{ getSortIndicator('date') }}
              </th>
              <th
                @click="handleSort('careMethods')"
                class="px-4 py-3 text-xs font-semibold text-left cursor-pointer select-none text-slate-700 hover:bg-slate-100"
              >
                管理方法{{ getSortIndicator('careMethods') }}
              </th>
              <th class="px-4 py-3 text-xs font-semibold text-center text-slate-700">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(rec, index) in records"
              :key="rec.id"
              class="transition-colors border-b border-slate-200 hover:bg-slate-50"
              :class="index % 2 === 0 ? 'bg-white' : 'bg-slate-50'"
            >
              <td class="px-4 py-3 text-sm font-medium text-slate-900">{{ rec.plant?.name ?? "不明" }}</td>
              <td class="px-4 py-3 text-xs text-slate-600">{{ rec.record_date }}</td>
              <td class="px-4 py-3 text-xs text-slate-600">
                {{ rec.careMethods.map((c) => c.name).join(", ") || "-" }}
              </td>
              <td class="px-4 py-3 text-center">
                <div class="flex justify-center gap-3">
                  <button
                    @click="$emit('edit-record', rec)"
                    class="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                    title="編集"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button
                    @click="deleteRecord(rec.id)"
                    class="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="削除"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 日間ビューモード -->
      <div v-else-if="viewMode === 'day'" class="space-y-3">
        <div class="flex items-center justify-between p-3 bg-white shadow-sm rounded-2xl ring-1 ring-slate-200 sm:p-4">
          <h2 class="text-sm font-semibold text-slate-900">{{ dayViewDate }}</h2>
          <div class="flex gap-2">
            <button @click="prevDay()" class="px-3 py-1 text-xs font-medium border rounded-lg text-slate-700 border-slate-200 hover:bg-slate-50">前日</button>
            <button @click="nextDay()" class="px-3 py-1 text-xs font-medium border rounded-lg text-slate-700 border-slate-200 hover:bg-slate-50">翌日</button>
          </div>
        </div>
        <div class="overflow-x-auto shadow-sm rounded-2xl ring-1 ring-slate-200">
          <table class="w-full bg-white">
            <thead class="border-b bg-slate-50 border-slate-200">
              <tr>
                <th class="px-4 py-3 text-xs font-semibold text-left text-slate-700">植物</th>
                <th class="px-4 py-3 text-xs font-semibold text-left text-slate-700">管理方法</th>
                <th class="px-4 py-3 text-xs font-semibold text-center text-slate-700">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="dayViewRecords.length === 0" class="bg-white">
                <td colspan="3" class="px-4 py-6 text-xs text-center text-slate-500">この日に記録がありません</td>
              </tr>
              <tr
                v-for="(rec, index) in dayViewRecords"
                :key="rec.id"
                class="transition-colors border-b border-slate-200 hover:bg-slate-50"
                :class="index % 2 === 0 ? 'bg-white' : 'bg-slate-50'"
              >
                <td class="px-4 py-3 text-sm font-medium text-slate-900">{{ rec.plant?.name ?? "不明" }}</td>
                <td class="px-4 py-3 text-xs text-slate-600">{{ rec.careMethods.map((c) => c.name).join(", ") || "-" }}</td>
                <td class="px-4 py-3 text-center">
                  <div class="flex justify-center gap-3">
                    <button @click="$emit('edit-record', rec)" class="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="編集">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button @click="deleteRecord(rec.id)" class="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="削除">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 週間ビューモード -->
      <div v-else-if="viewMode === 'week'" class="space-y-3">
        <div class="flex items-center justify-between p-3 bg-white shadow-sm rounded-2xl ring-1 ring-slate-200 sm:p-4">
          <h2 class="text-sm font-semibold text-slate-900">{{ weekViewLabel }}</h2>
          <div class="flex gap-2">
            <button @click="prevWeek()" class="px-3 py-1 text-xs font-medium border rounded-lg text-slate-700 border-slate-200 hover:bg-slate-50">前週</button>
            <button @click="nextWeek()" class="px-3 py-1 text-xs font-medium border rounded-lg text-slate-700 border-slate-200 hover:bg-slate-50">翌週</button>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-7">
          <div v-for="day in weekViewDays" :key="day.date" class="p-3 bg-white border rounded-lg shadow-sm border-slate-200">
            <h3 class="mb-2 text-xs font-semibold text-slate-700">{{ day.label }}</h3>
            <div class="space-y-1">
              <div v-if="day.records.length === 0" class="text-xs text-slate-400">記録なし</div>
              <div
                v-for="rec in day.records"
                :key="rec.id"
                class="p-2 text-xs transition-colors border rounded cursor-pointer border-slate-200 bg-slate-50 hover:bg-slate-100"
                @click="$emit('edit-record', rec)"
              >
                <div class="font-semibold text-slate-800">{{ rec.plant?.name ?? "不明" }}</div>
                <div class="text-slate-600">{{ rec.careMethods.map((c) => c.name).join(", ") || "-" }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- カレンダーモード -->
      <div v-else class="space-y-3">
        <div
          class="flex items-center justify-between px-3 py-3 bg-white shadow-sm rounded-2xl ring-1 ring-slate-200"
        >
          <div class="flex items-center gap-2">
            <button
              class="px-3 py-1 text-sm font-medium border rounded-lg shadow-sm border-slate-200 bg-slate-100 text-slate-700"
              @click="shiftMonth(-1)"
            >
              ◀
            </button>
            <div class="text-base font-semibold text-slate-900">{{ monthLabel }}</div>
            <button
              class="px-3 py-1 text-sm font-medium border rounded-lg shadow-sm border-slate-200 bg-slate-100 text-slate-700"
              @click="shiftMonth(1)"
            >
              ▶
            </button>
          </div>
          <div class="flex items-center gap-2 text-xs text-slate-500">
            <button
              class="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-700 shadow-sm"
              @click="goToday"
            >
              今日
            </button>
          </div>
        </div>

        <div class="px-1 space-y-2 sm:px-0">
          <div class="grid grid-cols-7 gap-1 text-[11px] text-slate-500">
            <span class="text-center">日</span>
            <span class="text-center">月</span>
            <span class="text-center">火</span>
            <span class="text-center">水</span>
            <span class="text-center">木</span>
            <span class="text-center">金</span>
            <span class="text-center">土</span>
          </div>
          <div class="grid grid-cols-7 gap-1">
            <div
              v-for="day in calendarDays"
              :key="day.dateStr ?? `empty-${day.index}`"
              class="min-h-24 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm cursor-pointer"
              :class="[
                day.isToday ? 'ring-2 ring-emerald-300' : '',
                day.dateStr && day.dateStr === selectedDate
                  ? 'bg-white ring-2 ring-amber-400 border-amber-400'
                  : '',
              ]"
              @click="day.dateStr && (selectedDate = day.dateStr)"
            >
              <div
                class="flex items-center justify-between text-[11px]"
                :class="day.dateStr === selectedDate ? 'text-slate-700' : 'text-slate-700'"
              >
                <span class="font-semibold">{{ day.label ?? "" }}</span>
                <span v-if="day.records.length" class="text-[10px] font-semibold text-slate-600">
                  {{ day.records.length }}
                </span>
              </div>
              <div class="mt-1 space-y-1">
                <div
                  v-for="rec in day.records.slice(0, 2)"
                  :key="rec.id"
                  class="rounded-lg px-1.5 py-1 text-[11px] leading-tight bg-emerald-50 text-slate-800"
                >
                  <div class="font-semibold truncate">
                    {{ rec.plant?.name ?? "不明" }}
                  </div>
                  <div
                    class="text-[10px] truncate text-slate-600"
                  >
                    {{ rec.careMethods.map((c) => c.name).join(", ") || "管理方法なし" }}
                  </div>
                </div>
                <div
                  v-if="day.records.length > 2"
                  class="text-[10px] font-medium text-emerald-600"
                >
                  +{{ day.records.length - 2 }} さらに
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white shadow-sm rounded-2xl ring-1 ring-slate-200">
          <div class="p-3 sm:p-4">
            <div class="flex items-center justify-between">
              <div class="text-sm font-semibold text-slate-900">
                {{ selectedDateLabel }}
              </div>
              <div class="text-xs text-slate-500">合計 {{ selectedDateRecords.length }}件</div>
            </div>
          </div>
          <div v-if="selectedDateRecords.length === 0" class="px-3 py-4 text-sm sm:px-4 text-slate-500">
            選択した日の記録はありません。
          </div>
          <table v-else class="w-full text-xs border-collapse sm:text-sm">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50">
                <th class="px-3 py-3 font-semibold text-left sm:px-4 text-slate-700">管理方法</th>
                <th class="px-3 py-3 font-semibold text-left sm:px-4 text-slate-700">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(rec, idx) in selectedDateRecords"
                :key="rec.id"
                :class="idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'"
                class="transition-colors border-b border-slate-200 hover:bg-slate-100"
              >
                <td class="px-3 py-3 sm:px-4">
                  <div class="space-y-1">
                    <div class="font-semibold text-slate-800">{{ rec.plant?.name ?? "不明" }}</div>
                    <div class="text-slate-600">{{ rec.careMethods.map((c) => c.name).join(", ") || "管理方法なし" }}</div>
                    <div v-if="rec.fertilizers?.length" class="text-slate-600">肥料: {{ rec.fertilizers.map((f) => f.name).join(", ") }}</div>
                    <div v-if="rec.memo" class="mt-1 text-slate-600">{{ rec.memo }}</div>
                  </div>
                </td>
                <td class="px-3 py-3 sm:px-4">
                  <div class="flex gap-2">
                    <button
                      @click="$emit('edit-record', rec)"
                      class="p-1 transition-colors rounded text-emerald-600 hover:bg-emerald-50"
                      title="編集"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      @click="deleteRecord(rec.id)"
                      class="p-1 text-red-400 transition-colors rounded hover:bg-red-50"
                      title="削除"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { supabase } from "@/lib/supabaseClient";

type Plant = { id: number; name: string };
type CareMethod = { id: number; name: string };
type Fertilizer = { id: number; name: string };

type RecordItem = {
  id: number;
  record_date: string;
  memo: string | null;
  plant: Plant | null;
  careMethods: CareMethod[];
  fertilizers: Fertilizer[];
};

const records = ref<RecordItem[]>([]);
const plants = ref<Plant[]>([]);
const loading = ref(false);
const errorMessage = ref("");
const viewMode = ref<"list" | "day" | "week" | "calendar">("list");

// ソート状態
const sortBy = ref<"plant" | "date" | "careMethods">("date");
const sortOrder = ref<"asc" | "desc">("desc");

// 日間ビュー
const dayViewDate = ref(new Date().toISOString().slice(0, 10));

// 週間ビュー - 初期値は後でonMountedで設定
const weekStartDate = ref<string>("");

const props = defineProps<{ refreshKey?: number }>();

// refresh when parent increments refreshKey
watch(
  () => props.refreshKey,
  (v) => {
    if (v !== undefined) fetchRecords();
  }
);

const filters = ref({
  plantId: "" as string | number,
  date: "",
});

// ---- ビューヘルパー関数 ----
const getWeekStart = (date: Date): string => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 月曜日を開始とする
  const weekStart = new Date(d.setDate(diff));
  return weekStart.toISOString().slice(0, 10);
};

const getWeekEnd = (startDateStr: string): string => {
  const d = new Date(startDateStr);
  d.setDate(d.getDate() + 6);
  return d.toISOString().slice(0, 10);
};

const prevDay = () => {
  const d = new Date(dayViewDate.value);
  d.setDate(d.getDate() - 1);
  dayViewDate.value = d.toISOString().slice(0, 10);
};

const nextDay = () => {
  const d = new Date(dayViewDate.value);
  d.setDate(d.getDate() + 1);
  dayViewDate.value = d.toISOString().slice(0, 10);
};

const prevWeek = () => {
  const d = new Date(weekStartDate.value);
  d.setDate(d.getDate() - 7);
  weekStartDate.value = d.toISOString().slice(0, 10);
};

const nextWeek = () => {
  const d = new Date(weekStartDate.value);
  d.setDate(d.getDate() + 7);
  weekStartDate.value = d.toISOString().slice(0, 10);
};

// ---- 計算プロパティ ----
const dayViewRecords = computed(() =>
  records.value.filter((r) => r.record_date === dayViewDate.value)
);

const weekViewLabel = computed(() => {
  const start = new Date(weekStartDate.value);
  const end = new Date(weekStartDate.value);
  end.setDate(end.getDate() + 6);
  const startMonth = start.getMonth() + 1;
  const startDay = start.getDate();
  const endMonth = end.getMonth() + 1;
  const endDay = end.getDate();
  if (startMonth === endMonth) {
    return `${startMonth}月 ${startDay}日 〜 ${endDay}日`;
  } else {
    return `${startMonth}月 ${startDay}日 〜 ${endMonth}月 ${endDay}日`;
  }
});

const weekViewDays = computed(() => {
  const days = [];
  const weekEnd = getWeekEnd(weekStartDate.value);
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStartDate.value);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
    days.push({
      date: dateStr,
      label: `${d.getMonth() + 1}/${d.getDate()} (${dayOfWeek})`,
      records: records.value.filter((r) => r.record_date === dateStr),
    });
  }
  return days;
});

const loadPlants = async () => {
  const { data, error } = await supabase
    .from("plants")
    .select("id, name")
    .order("name", { ascending: true });
  if (!error && data) {
    plants.value = data as Plant[];
  }
};

const fetchRecords = async () => {
  loading.value = true;
  errorMessage.value = "";

  let query = supabase
    .from("records")
    .select(
      `
        id,
        record_date,
        memo,
        plant:plants ( id, name ),
        record_care_methods (
          care_method:care_methods ( id, name )
        ),
        record_fertilizers (
          fertilizer:fertilizers ( id, name )
        )
      `
    )
    .order("record_date", { ascending: false })
    .limit(50);

  if (filters.value.plantId) {
    query = query.eq("plant_id", filters.value.plantId);
  }
  if (filters.value.date) {
    query = query.eq("record_date", filters.value.date);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    errorMessage.value = "記録を取得できませんでした。";
    loading.value = false;
    return;
  }

  // 데이터 정리
  records.value =
    (data as any[]).map((row) => ({
      id: row.id,
      record_date: row.record_date,
      memo: row.memo,
      plant: row.plant || null,
      careMethods: (row.record_care_methods || []).map((rcm: any) => rcm.care_method),
      fertilizers: (row.record_fertilizers || []).map((rf: any) => rf.fertilizer),
    })) ?? [];

  loading.value = false;
};

onMounted(() => {
  loadPlants();
  fetchRecords();
  weekStartDate.value = getWeekStart(new Date());
});

// ---- 캘린더 뷰 계산 ----
const todayStr = new Date().toISOString().slice(0, 10);
const currentMonth = ref(new Date());

const monthKey = computed(() => {
  const y = currentMonth.value.getFullYear();
  const m = currentMonth.value.getMonth() + 1;
  return `${y}-${String(m).padStart(2, "0")}`;
});

const monthLabel = computed(() => {
  const y = currentMonth.value.getFullYear();
  const m = currentMonth.value.getMonth() + 1;
  return `${y}年 ${m}月`;
});

const monthRecords = computed(() =>
  records.value.filter((r) => r.record_date.startsWith(monthKey.value))
);

const selectedDate = ref<string | null>(todayStr);

const selectedDateRecords = computed(() =>
  selectedDate.value ? records.value.filter((r) => r.record_date === selectedDate.value) : []
);

const selectedDateLabel = computed(() => {
  if (!selectedDate.value) return "日付を選択してください";
  return selectedDate.value;
});

type DayCell = {
  dateStr: string | null;
  label: number | null;
  records: RecordItem[];
  isToday: boolean;
  index?: number;
};

const calendarDays = computed<DayCell[]>(() => {
  const result: DayCell[] = [];
  const y = currentMonth.value.getFullYear();
  const m = currentMonth.value.getMonth();
  const first = new Date(y, m, 1);
  const startWeek = first.getDay(); // 0:Sun
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  // leading blanks
  for (let i = 0; i < startWeek; i++) {
    result.push({ dateStr: null, label: null, records: [], isToday: false, index: -i });
  }

  const byDate = new Map<string, RecordItem[]>();
  for (const rec of monthRecords.value) {
    const arr = byDate.get(rec.record_date) ?? [];
    arr.push(rec);
    byDate.set(rec.record_date, arr);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${monthKey.value}-${String(d).padStart(2, "0")}`;
    result.push({
      dateStr,
      label: d,
      records: byDate.get(dateStr) ?? [],
      isToday: dateStr === todayStr,
    });
  }

  return result;
});

const shiftMonth = (delta: number) => {
  const next = new Date(currentMonth.value);
  next.setMonth(next.getMonth() + delta);
  currentMonth.value = next;
};

const goToday = () => {
  const now = new Date();
  currentMonth.value = new Date(now.getFullYear(), now.getMonth(), 1);
  selectedDate.value = todayStr;
};

const deleteRecord = async (id: number) => {
  if (!confirm("この記録を削除しますか？")) return;

  // 削除順: 関連テーブル -> records
  try {
    const { error: err1 } = await supabase.from("record_care_methods").delete().eq("record_id", id);
    if (err1) throw err1;
    const { error: err2 } = await supabase.from("record_fertilizers").delete().eq("record_id", id);
    if (err2) throw err2;
    const { error: err3 } = await supabase.from("records").delete().eq("id", id);
    if (err3) throw err3;

    // remove from local records
    const idx = records.value.findIndex((r) => r.id === id);
    if (idx !== -1) records.value.splice(idx, 1);
  } catch (e) {
    console.error(e);
    errorMessage.value = "記録の削除に失敗しました。";
  }
};

const handleSort = (column: "plant" | "date" | "careMethods") => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = column;
    sortOrder.value = "asc";
  }
  applySorting();
};

const getSortIndicator = (column: "plant" | "date" | "careMethods") => {
  if (sortBy.value !== column) return "";
  return sortOrder.value === "asc" ? " ▲" : " ▼";
};

const applySorting = () => {
  const sorted = [...records.value];
  sorted.sort((a, b) => {
    let aVal: any, bVal: any;

    if (sortBy.value === "plant") {
      aVal = a.plant?.name ?? "";
      bVal = b.plant?.name ?? "";
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    } else if (sortBy.value === "date") {
      aVal = a.record_date;
      bVal = b.record_date;
    } else if (sortBy.value === "careMethods") {
      aVal = a.careMethods.map(c => c.name).join(", ");
      bVal = b.careMethods.map(c => c.name).join(", ");
    }

    if (aVal < bVal) return sortOrder.value === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder.value === "asc" ? 1 : -1;
    return 0;
  });

  records.value = sorted;
};
</script>
