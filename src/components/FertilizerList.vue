<template>
  <div class="mx-auto max-w-xl px-2 sm:px-4 py-6 space-y-6">
    <header class="space-y-1">
      <p class="text-xs uppercase tracking-wide text-slate-500">登録</p>
      <h1 class="text-xl font-semibold text-slate-900">肥料登録</h1>
      <p class="text-sm text-slate-600">肥料名と備考を入力してください。</p>
    </header>

    <form
      @submit.prevent="createFertilizer"
      class="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-4 space-y-3"
    >
      <div class="space-y-1">
        <label class="text-sm font-medium text-slate-700">肥料名 *</label>
        <input
          v-model="newFertilizer.name"
          required
          class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          placeholder="하이포넥스"
        />
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium text-slate-700">備考</label>
        <textarea
          v-model="newFertilizer.memo"
          class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          rows="3"
          placeholder="希釈倍率など"
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

    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-slate-900">登録済みの肥料</h2>
        <span class="text-xs text-slate-500">{{ fertilizers.length }}件</span>
      </div>
      <ul class="space-y-2">
        <li
          v-for="fert in fertilizers"
          :key="fert.id"
          class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
        >
          <div class="font-semibold text-slate-900">{{ fert.name }}</div>
          <p v-if="fert.memo" class="mt-2 text-sm text-slate-700">{{ fert.memo }}</p>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { supabase } from "@/lib/supabaseClient";

type Fertilizer = {
  id: number;
  name: string;
  memo: string | null;
  created_at?: string;
};

const fertilizers = ref<Fertilizer[]>([]);
const saving = ref(false);
const errorMessage = ref("");

const newFertilizer = ref({
  name: "",
  memo: "",
});

const fetchFertilizers = async () => {
  const { data, error } = await supabase
    .from("fertilizers")
    .select("*")
    .order("created_at", { ascending: false });

  if (!error && data) {
    fertilizers.value = data as Fertilizer[];
  }
};

const createFertilizer = async () => {
  if (!newFertilizer.value.name.trim()) {
    errorMessage.value = "肥料名は必須です。";
    return;
  }

  saving.value = true;
  errorMessage.value = "";

  const { data, error } = await supabase
    .from("fertilizers")
    .insert({
      name: newFertilizer.value.name,
      memo: newFertilizer.value.memo || null,
    })
    .select("*")
    .single();

  if (error) {
    console.error(error);
    errorMessage.value = "肥料の追加に失敗しました.";
  } else if (data) {
    fertilizers.value.unshift(data as Fertilizer);
    newFertilizer.value.name = "";
    newFertilizer.value.memo = "";
  }

  saving.value = false;
};

onMounted(() => {
  fetchFertilizers();
});
</script>
