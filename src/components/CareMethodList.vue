<template>
  <div class="mx-auto max-w-xl px-2 sm:px-4 py-6 space-y-6">
    <header class="space-y-1">
      <p class="text-xs uppercase tracking-wide text-slate-500">登録</p>
      <h1 class="text-xl font-semibold text-slate-900">管理方法の登録</h1>
      <p class="text-sm text-slate-600">管理方法名と備考を入力してください。</p>
    </header>

    <form
      @submit.prevent="createCareMethod"
      class="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-4 space-y-3"
    >
      <div class="space-y-1">
        <label class="text-sm font-medium text-slate-700">管理方法名 *</label>
        <input
          v-model="newCareMethod.name"
          required
          class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          placeholder="通常の水やり"
        />
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium text-slate-700">備考</label>
        <textarea
          v-model="newCareMethod.memo"
          class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          rows="3"
          placeholder="回数・条件など"
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
        <h2 class="text-lg font-semibold text-slate-900">登録済みの管理方法</h2>
        <span class="text-xs text-slate-500">{{ careMethods.length }}件</span>
      </div>
      <ul class="space-y-2">
        <li
          v-for="cm in careMethods"
          :key="cm.id"
          class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
        >
          <div class="font-semibold text-slate-900">{{ cm.name }}</div>
          <p v-if="cm.memo" class="mt-2 text-sm text-slate-700">{{ cm.memo }}</p>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { supabase } from "@/lib/supabaseClient";

type CareMethod = {
  id: number;
  name: string;
  memo: string | null;
  created_at?: string;
};

const careMethods = ref<CareMethod[]>([]);
const saving = ref(false);
const errorMessage = ref("");

const newCareMethod = ref({
  name: "",
  memo: "",
});

const fetchCareMethods = async () => {
  const { data, error } = await supabase
    .from("care_methods")
    .select("*")
    .order("created_at", { ascending: false });

  if (!error && data) {
    careMethods.value = data as CareMethod[];
  }
};

const createCareMethod = async () => {
  if (!newCareMethod.value.name.trim()) {
    errorMessage.value = "管理方法名は必須です。";
    return;
  }

  saving.value = true;
  errorMessage.value = "";

  const { data, error } = await supabase
    .from("care_methods")
    .insert({
      name: newCareMethod.value.name,
      memo: newCareMethod.value.memo || null,
    })
    .select("*")
    .single();

  if (error) {
    console.error(error);
    errorMessage.value = "管理方法の追加に失敗しました.";
  } else if (data) {
    careMethods.value.unshift(data as CareMethod);
    newCareMethod.value.name = "";
    newCareMethod.value.memo = "";
  }

  saving.value = false;
};

onMounted(() => {
  fetchCareMethods();
});
</script>
