<template>
  <div class="mx-auto max-w-5xl px-2 py-4 sm:px-4 sm:py-6 md:px-6 lg:px-8 space-y-6">
    <header class="space-y-1">
      <p class="text-xs tracking-wide uppercase text-slate-500">登録</p>
      <h1 class="text-lg font-semibold text-slate-900 sm:text-xl">植物登録</h1>
      <p class="text-xs sm:text-sm text-slate-600">必須項目を入力して保存してください。</p>
    </header>

    <!-- 폼 -->
    <form
      @submit.prevent="editingId ? updatePlant() : createPlant()"
      class="p-3 space-y-3 bg-white shadow-sm rounded-2xl ring-1 ring-slate-200 sm:p-4 md:p-5"
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

    <!-- 식물 목록 -->
    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-slate-900 sm:text-lg">登録済みの植物</h2>
        <span class="text-xs text-slate-500">{{ plants.length }}件</span>
      </div>
      <div
        v-if="loading"
        class="rounded-2xl bg-white p-4 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-200"
      >
        読み込み中...
      </div>
      <ul v-else class="space-y-2 sm:space-y-3 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
        <li
          v-for="plant in plants"
          :key="plant.id"
          class="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200 sm:p-4"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-slate-900 text-sm sm:text-base truncate">{{ plant.name }}</div>
              <span v-if="plant.registered_at" class="text-xs text-slate-500 inline-block mt-1">
                登録日 {{ plant.registered_at }}
              </span>
            </div>
          </div>
          <p v-if="plant.memo" class="mt-2 text-xs sm:text-sm text-slate-700">{{ plant.memo }}</p>
          <div class="mt-3 flex gap-2">
            <button
              @click="startEdit(plant)"
              class="rounded-md border px-2 py-1 text-xs sm:text-sm text-emerald-600 hover:bg-emerald-50"
            >
              編集
            </button>
            <button
              @click="deletePlant(plant.id)"
              class="rounded-md border px-2 py-1 text-xs sm:text-sm text-red-600 hover:bg-red-50"
            >
              削除
            </button>
          </div>
        </li>
      </ul>
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
};

const plants = ref<Plant[]>([]);
const loading = ref(false);
const saving = ref(false);
const errorMessage = ref("");

// 새 식물 폼 데이터
const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
const newPlant = ref({
  name: "",
  memo: "",
  registered_at: today,
});

// 식물 목록 로드
const editingId = ref<number | null>(null);

const fetchPlants = async () => {
  loading.value = true;
  errorMessage.value = "";
  const { data, error } = await supabase
    .from("plants")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    errorMessage.value = "植物一覧を取得できませんでした。";
  } else {
    plants.value = data as Plant[];
  }

  loading.value = false;
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
