<template>
  <div class="mx-auto max-w-6xl px-2 py-4 sm:px-4 sm:py-6 md:px-6 lg:px-8 space-y-6">
    <header class="space-y-2 sm:space-y-3">
      <div class="flex items-center justify-between gap-2 sm:gap-3">
        <div>
          <p class="text-xs uppercase tracking-wide text-slate-500">記録</p>
          <h1 class="text-lg font-semibold text-slate-900 sm:text-xl">管理記録の閲覧</h1>
          <p class="text-xs sm:text-sm text-slate-600">
            植物/日付で絞り込み、リストまたはカレンダーで確認できます。
          </p>
        </div>
        <div class="hidden sm:flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          <button
            class="rounded-md px-3 py-1 text-xs sm:text-sm font-medium"
            :class="viewMode === 'list' ? 'bg-emerald-500 text-white' : 'text-slate-700'"
            @click="viewMode = 'list'"
          >
            リスト
          </button>
          <button
            class="rounded-md px-3 py-1 text-xs sm:text-sm font-medium"
            :class="viewMode === 'calendar' ? 'bg-emerald-500 text-white' : 'text-slate-700'"
            @click="viewMode = 'calendar'"
          >
            カレンダー
          </button>
        </div>
      </div>
      <div class="sm:hidden grid grid-cols-2 gap-2">
        <button
          class="rounded-lg border px-3 py-2 text-xs font-medium shadow-sm"
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
          class="rounded-lg border px-3 py-2 text-xs font-medium shadow-sm"
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

    <div class="flex flex-col gap-2 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200 sm:p-4">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div class="flex flex-1 flex-col gap-1">
          <label class="text-xs sm:text-sm font-medium text-slate-700">植物</label>
          <select
            v-model="filters.plantId"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          >
            <option value="">すべて</option>
            <option v-for="p in plants" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>
        <div class="flex w-full sm:w-48 flex-col gap-1">
          <label class="text-xs sm:text-sm font-medium text-slate-700">日付</label>
          <input
            type="date"
            v-model="filters.date"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
        </div>
        <button
          @click="fetchRecords"
          :disabled="loading"
          class="w-full sm:w-28 rounded-lg bg-emerald-500 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow hover:bg-emerald-600"
        >
          {{ loading ? "読み込み中..." : "検索" }}
        </button>
      </div>
      <p v-if="errorMessage" class="text-xs sm:text-sm text-red-500">{{ errorMessage }}</p>
    </div>

    <div
      v-if="loading"
      class="rounded-2xl bg-white p-4 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-200"
    >
      読み込み中...
    </div>
    <div
      v-else-if="records.length === 0"
      class="rounded-2xl bg-white p-4 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-200"
    >
      記録がありません。
    </div>

    <template v-else>
      <!-- 목록 모드 -->
      <ul v-if="viewMode === 'list'" class="space-y-2 sm:space-y-3 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
        <li
          v-for="rec in records"
          :key="rec.id"
          class="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200 sm:p-4"
        >
          <div class="flex items-start justify-between gap-2 text-xs sm:text-sm">
            <div class="flex-1">
              <strong class="text-slate-900 block">{{ rec.plant?.name ?? "不明" }}</strong>
              <span class="text-slate-500 block">{{ rec.record_date }}</span>
            </div>
          </div>
          <div v-if="rec.careMethods?.length" class="mt-2 text-xs sm:text-sm text-slate-700">
            管理方法: {{ rec.careMethods.map((c) => c.name).join(", ") }}
          </div>
          <div v-if="rec.fertilizers?.length" class="text-xs sm:text-sm text-slate-700">
            肥料: {{ rec.fertilizers.map((f) => f.name).join(", ") }}
          </div>
          <div v-if="rec.memo" class="mt-2 text-xs sm:text-sm text-slate-800">{{ rec.memo }}</div>
          <div class="mt-3 flex gap-2">
            <button
              @click="$emit('edit-record', rec)"
              class="rounded-md border px-2 py-1 text-xs sm:text-sm text-emerald-600 hover:bg-emerald-50"
            >
              編集
            </button>
            <button
              @click="deleteRecord(rec.id)"
              class="rounded-md border px-2 py-1 text-xs sm:text-sm text-red-600 hover:bg-red-50"
            >
              削除
            </button>
          </div>
        </li>
      </ul>

      <!-- 캘린더 모드 -->
      <div v-else class="space-y-3">
        <div
          class="flex items-center justify-between rounded-2xl bg-white px-3 py-3 shadow-sm ring-1 ring-slate-200"
        >
          <div class="flex items-center gap-2">
            <button
              class="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 shadow-sm"
              @click="shiftMonth(-1)"
            >
              ◀
            </button>
            <div class="text-base font-semibold text-slate-900">{{ monthLabel }}</div>
            <button
              class="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 shadow-sm"
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

        <div class="space-y-2 px-1 sm:px-0">
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
                  ? 'bg-emerald-500 text-white border-emerald-400'
                  : '',
              ]"
              @click="day.dateStr && (selectedDate = day.dateStr)"
            >
              <div
                class="flex items-center justify-between text-[11px]"
                :class="day.dateStr === selectedDate ? 'text-white' : 'text-slate-700'"
              >
                <span class="font-semibold">{{ day.label ?? "" }}</span>
                <span v-if="day.records.length" class="text-[10px] font-semibold">
                  {{ day.records.length }}
                </span>
              </div>
              <div class="mt-1 space-y-1">
                <div
                  v-for="rec in day.records.slice(0, 2)"
                  :key="rec.id"
                  class="rounded-lg px-1.5 py-1 text-[11px] leading-tight"
                  :class="
                    day.dateStr === selectedDate
                      ? 'bg-white/15 text-white'
                      : 'bg-emerald-50 text-slate-800'
                  "
                >
                  <div class="font-semibold truncate">
                    {{ rec.plant?.name ?? "不明" }}
                  </div>
                  <div
                    class="text-[10px] truncate"
                    :class="day.dateStr === selectedDate ? 'text-white/90' : 'text-slate-600'"
                  >
                    {{ rec.careMethods.map((c) => c.name).join(", ") || "管理方法なし" }}
                  </div>
                </div>
                <div
                  v-if="day.records.length > 2"
                  class="text-[10px] font-medium"
                  :class="day.dateStr === selectedDate ? 'text-white' : 'text-emerald-600'"
                >
                  +{{ day.records.length - 2 }} さらに
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 space-y-2">
          <div class="flex items-center justify-between">
            <div class="text-sm font-semibold text-slate-900">
              {{ selectedDateLabel }}
            </div>
            <div class="text-xs text-slate-500">合計 {{ selectedDateRecords.length }}件</div>
          </div>
          <div v-if="selectedDateRecords.length === 0" class="text-sm text-slate-500">
            選択した日の記録はありません。
          </div>
          <ul v-else class="space-y-2">
            <li
              v-for="rec in selectedDateRecords"
              :key="rec.id"
              class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm"
            >
              <div class="flex items-center justify-between text-xs text-slate-600">
                <span class="font-semibold text-slate-800">{{ rec.plant?.name ?? "不明" }}</span>
                <span>{{ rec.record_date }}</span>
              </div>
              <div v-if="rec.careMethods?.length" class="mt-1 text-xs sm:text-sm text-slate-700">
                {{ rec.careMethods.map((c) => c.name).join(", ") }}
              </div>
              <div v-if="rec.fertilizers?.length" class="text-xs sm:text-sm text-slate-700">
                肥料: {{ rec.fertilizers.map((f) => f.name).join(", ") }}
              </div>
              <div v-if="rec.memo" class="mt-1 text-xs sm:text-sm text-slate-800">
                {{ rec.memo }}
              </div>
              <div class="mt-2 flex gap-2">
                <button
                  @click="$emit('edit-record', rec)"
                  class="rounded-md border px-2 py-1 text-xs sm:text-sm text-emerald-600 hover:bg-emerald-50"
                >
                  編集
                </button>
                <button
                  @click="deleteRecord(rec.id)"
                  class="rounded-md border px-2 py-1 text-xs sm:text-sm text-red-600 hover:bg-red-50"
                >
                  削除
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </div>
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
const viewMode = ref<"list" | "calendar">("list");

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
</script>
