<template>
  <div class="mx-auto max-w-xl px-2 sm:px-4 py-6 space-y-6">
    <header class="space-y-1">
      <p class="text-xs uppercase tracking-wide text-slate-500">登録</p>
      <h1 class="text-xl font-semibold text-slate-900">植物登録</h1>
      <p class="text-sm text-slate-600">必須項目を入力して保存してください。</p>
    </header>

    <!-- 새 식물 추가 폼 -->
    <form
      @submit.prevent="createPlant"
      class="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-4 space-y-3"
    >
      <div class="space-y-1">
        <label class="text-sm font-medium text-slate-700">植物名 *</label>
        <input
          v-model="newPlant.name"
          required
          class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          placeholder="モンステラ"
        />
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium text-slate-700">備考</label>
        <textarea
          v-model="newPlant.memo"
          class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          rows="3"
          placeholder="購入先、環境メモなど"
        />
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium text-slate-700">登録日</label>
        <input
          type="date"
          v-model="newPlant.registered_at"
          class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        />
      </div>
      <button
        type="submit"
        :disabled="saving"
        class="w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600"
      >
        {{ saving ? "保存中..." : "追加" }}
      </button>
      <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
    </form>

    <!-- 식물 목록 -->
    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-slate-900">登録済みの植物</h2>
        <span class="text-xs text-slate-500">{{ plants.length }}件</span>
      </div>
      <div
        v-if="loading"
        class="rounded-2xl bg-white p-4 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-200"
      >
        読み込み中...
      </div>
      <ul v-else class="space-y-2">
        <li
          v-for="plant in plants"
          :key="plant.id"
          class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="font-semibold text-slate-900">{{ plant.name }}</div>
            <span v-if="plant.registered_at" class="text-xs text-slate-500">
              登録日 {{ plant.registered_at }}
            </span>
          </div>
          <p v-if="plant.memo" class="mt-2 text-sm text-slate-700">{{ plant.memo }}</p>
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

onMounted(() => {
  fetchPlants();
});
</script>
