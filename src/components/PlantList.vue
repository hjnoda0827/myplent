<template>
    <header class="py-3 space-y-1">
      <p class="text-xs tracking-wide uppercase text-slate-500">{{ plants.length }}件
</p>
      <h1 class="text-lg font-semibold text-slate-900 sm:text-xl">植物登録</h1>
    </header>

    <!-- 모바일은 전체, lg 이상은 2컬럼 레이아웃 -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- 폼 영역 -->
      <div class="space-y-6">
        <form
          @submit.prevent="editingId ? updatePlant() : createPlant()"
          class="space-y-3 bg-white shadow-sm rounded-2xl ring-1 ring-slate-200 sm:p-4 md:p-5"
        >
      <div class="space-y-1">
        <label class="text-sm font-medium text-slate-700">植物名 *</label>
        <input
          v-model="newPlant.name"
          required
          class="w-full px-3 py-2 text-sm border rounded-lg shadow-inner border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          placeholder="モンステラ"
        />
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium text-slate-700">備考</label>
        <textarea
          v-model="newPlant.memo"
          class="w-full px-3 py-2 text-sm border rounded-lg shadow-inner border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          rows="3"
          placeholder="購入先、環境メモなど"
        />
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium text-slate-700">登録日</label>
        <input
          type="date"
          v-model="newPlant.registered_at"
          class="w-full px-3 py-2 text-sm border rounded-lg shadow-inner border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        />
      </div>
      <button
        type="submit"
        :disabled="saving"
        class="w-full px-4 py-2 text-sm font-semibold text-white rounded-lg shadow bg-emerald-500 hover:bg-emerald-600"
      >
        {{ saving ? "保存中..." : (editingId ? "更新" : "追加") }}
      </button>
      <button
        v-if="editingId"
        type="button"
        @click="cancelEdit"
        class="w-full px-4 py-2 text-sm font-semibold bg-white border rounded-lg border-slate-200 text-slate-700"
      >
        キャンセル
      </button>
      <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
        </form>
      </div>

      <!-- リスト領域 -->
      <section class="space-y-3">
        <div v-if="loading" class="p-4 text-sm text-center bg-white shadow-sm rounded-2xl text-slate-500 ring-1 ring-slate-200">
          読み込み中...
        </div>
        <div v-else class="overflow-x-auto shadow-sm rounded-2xl ring-1 ring-slate-200">
          <table class="w-full bg-white">
            <thead class="border-b bg-slate-50 border-slate-200">
              <tr>
                <th
                  @click="handleSort('name')"
                  class="px-4 py-3 text-xs font-semibold text-left cursor-pointer select-none text-slate-700 hover:bg-slate-100"
                >
                  植物名{{ getSortIndicator('name') }}
                </th>
                <th
                  @click="handleSort('registered_at')"
                  class="px-4 py-3 text-xs font-semibold text-left cursor-pointer select-none text-slate-700 hover:bg-slate-100"
                >
                  登録日{{ getSortIndicator('registered_at') }}
                </th>
                <th class="px-4 py-3 text-xs font-semibold text-center text-slate-700">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(plant, index) in plants"
                :key="plant.id"
                class="transition-colors border-b border-slate-200 hover:bg-slate-50"
                :class="index % 2 === 0 ? 'bg-white' : 'bg-slate-50'"
              >
                <td class="px-4 py-3 text-sm font-medium text-slate-900">{{ plant.name }}</td>
                <td class="px-4 py-3 text-xs text-slate-600">{{ plant.registered_at || "-" }}</td>
                <td class="px-4 py-3 text-center">
                  <div class="flex justify-center gap-3">
                    <button
                      @click="startEdit(plant)"
                      class="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                      title="編集"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button
                      @click="deletePlant(plant.id)"
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
      </section>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { supabase } from "@/lib/supabaseClient";

type Plant = {
  id: number;
  name: string;
  memo: string | null;
  registered_at: string | null; // ISO date string
  created_at?: string;
};

const plants = ref<Plant[]>([]);
const loading = ref(false);
const saving = ref(false);
const errorMessage = ref("");

// 新植物フォームデータ
const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
const newPlant = ref({
  name: "",
  memo: "",
  registered_at: today,
});

// ソート状態
const sortBy = ref<"name" | "registered_at" | "created_at">("created_at");
const sortOrder = ref<"asc" | "desc">("desc");

// 植物リストロード
const editingId = ref<number | null>(null);

const fetchPlants = async () => {
  loading.value = true;
  errorMessage.value = "";
  const { data, error } = await supabase
    .from("plants")
    .select("*")
    .order(sortBy.value, { ascending: sortOrder.value === "asc" });

  if (error) {
    console.error(error);
    errorMessage.value = "植物一覧を取得できませんでした。";
  } else {
    plants.value = data as Plant[];
  }

  loading.value = false;
};

const handleSort = (column: "name" | "registered_at" | "created_at") => {
  if (sortBy.value === column) {
    // 同じ列をクリック = 順序を反転
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    // 別の列をクリック = その列で昇順にソート
    sortBy.value = column;
    sortOrder.value = "asc";
  }
  fetchPlants();
};

const getSortIndicator = (column: "name" | "registered_at" | "created_at") => {
  if (sortBy.value !== column) return "";
  return sortOrder.value === "asc" ? " ▲" : " ▼";
};

// 새 식물 추가
const createPlant = async () => {
  if (!newPlant.value.name.trim()) {
    errorMessage.value = "植物名は必須です。";
    return;
  }

  saving.value = true;
  errorMessage.value = "";

  const { data, error } = await supabase
    .from("plants")
    .insert({
      name: newPlant.value.name,
      memo: newPlant.value.memo || null,
      registered_at: newPlant.value.registered_at || today,
    })
    .select("*")
    .single();

  if (error) {
    console.error(error);
    errorMessage.value = "植物の追加に失敗しました.";
  } else if (data) {
    // 새로 추가된 식물을 목록 맨 위에 추가
    plants.value.unshift(data as Plant);
    // 폼 초기화
    newPlant.value.name = "";
    newPlant.value.memo = "";
    newPlant.value.registered_at = today;
  }

  saving.value = false;
};

const startEdit = (p: Plant) => {
  editingId.value = p.id;
  newPlant.value.name = p.name;
  newPlant.value.memo = p.memo ?? "";
  newPlant.value.registered_at = p.registered_at ?? today;
};

const cancelEdit = () => {
  editingId.value = null;
  newPlant.value.name = "";
  newPlant.value.memo = "";
  newPlant.value.registered_at = today;
  errorMessage.value = "";
};

const updatePlant = async () => {
  if (!editingId.value) return;
  if (!newPlant.value.name.trim()) {
    errorMessage.value = "植物名は必須です。";
    return;
  }

  saving.value = true;
  errorMessage.value = "";

  const { data, error } = await supabase
    .from("plants")
    .update({
      name: newPlant.value.name,
      memo: newPlant.value.memo || null,
      registered_at: newPlant.value.registered_at || today,
    })
    .eq("id", editingId.value)
    .select("*")
    .single();

  if (error) {
    console.error(error);
    errorMessage.value = "植物の更新に失敗しました。";
  } else if (data) {
    // replace in local list
    const idx = plants.value.findIndex((x) => x.id === editingId.value);
    if (idx !== -1) plants.value.splice(idx, 1, data as Plant);
    cancelEdit();
  }

  saving.value = false;
};

const deletePlant = async (id: number) => {
  if (!confirm("この植物を削除しますか？関連する記録は手動で処理してください。")) return;
  const { error } = await supabase.from("plants").delete().eq("id", id);
  if (error) {
    console.error(error);
    errorMessage.value = "植物の削除に失敗しました。";
    return;
  }
  const idx = plants.value.findIndex((x) => x.id === id);
  if (idx !== -1) plants.value.splice(idx, 1);
  if (editingId.value === id) cancelEdit();
};

onMounted(() => {
  fetchPlants();
});
</script>
