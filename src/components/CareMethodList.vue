<template>
  <div class="mx-auto max-w-5xl px-2 py-4 sm:px-4 sm:py-6 md:px-6 lg:px-8 space-y-6">
    <header class="space-y-1">
      <p class="text-xs uppercase tracking-wide text-slate-500">登録</p>
      <h1 class="text-lg font-semibold text-slate-900 sm:text-xl">管理方法の登録</h1>
      <p class="text-xs sm:text-sm text-slate-600">管理方法名と備考を入力してください。</p>
    </header>

    <form
      @submit.prevent="editingId ? updateCareMethod() : createCareMethod()"
      class="p-3 space-y-3 bg-white shadow-sm rounded-2xl ring-1 ring-slate-200 sm:p-4 md:p-5"
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
        {{ saving ? "保存中..." : (editingId ? "更新" : "追加") }}
      </button>
      <button
        v-if="editingId"
        type="button"
        @click="cancelEdit"
        class="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
      >
        キャンセル
      </button>
      <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
    </form>

    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-slate-900 sm:text-lg">登録済みの管理方法</h2>
        <span class="text-xs text-slate-500">{{ careMethods.length }}件</span>
      </div>
      <ul class="space-y-2 sm:space-y-3 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
        <li
          v-for="cm in careMethods"
          :key="cm.id"
          class="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200 sm:p-4"
        >
          <div class="font-semibold text-slate-900 text-sm sm:text-base">{{ cm.name }}</div>
          <p v-if="cm.memo" class="mt-2 text-xs sm:text-sm text-slate-700">{{ cm.memo }}</p>
          <div class="mt-3 flex gap-2">
            <button
              @click="startEdit(cm)"
              class="rounded-md border px-2 py-1 text-xs sm:text-sm text-emerald-600 hover:bg-emerald-50"
            >
              編集
            </button>
            <button
              @click="deleteCareMethod(cm.id)"
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
const editingId = ref<number | null>(null);

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

const startEdit = (c: CareMethod) => {
  editingId.value = c.id;
  newCareMethod.value.name = c.name;
  newCareMethod.value.memo = c.memo ?? "";
};

const cancelEdit = () => {
  editingId.value = null;
  newCareMethod.value.name = "";
  newCareMethod.value.memo = "";
  errorMessage.value = "";
};

const updateCareMethod = async () => {
  if (!editingId.value) return;
  if (!newCareMethod.value.name.trim()) {
    errorMessage.value = "管理方法名は必須です。";
    return;
  }

  saving.value = true;
  errorMessage.value = "";

  const { data, error } = await supabase
    .from("care_methods")
    .update({
      name: newCareMethod.value.name,
      memo: newCareMethod.value.memo || null,
    })
    .eq("id", editingId.value)
    .select("*")
    .single();

  if (error) {
    console.error(error);
    errorMessage.value = "管理方法の更新に失敗しました。";
  } else if (data) {
    const idx = careMethods.value.findIndex((x) => x.id === editingId.value);
    if (idx !== -1) careMethods.value.splice(idx, 1, data as CareMethod);
    cancelEdit();
  }

  saving.value = false;
};

const deleteCareMethod = async (id: number) => {
  if (!confirm("この管理方法を削除しますか？関連する記録は手動で処理してください。")) return;
  const { error } = await supabase.from("care_methods").delete().eq("id", id);
  if (error) {
    console.error(error);
    errorMessage.value = "管理方法の削除に失敗しました。";
    return;
  }
  const idx = careMethods.value.findIndex((x) => x.id === id);
  if (idx !== -1) careMethods.value.splice(idx, 1);
  if (editingId.value === id) cancelEdit();
};

onMounted(() => {
  fetchCareMethods();
});
</script>
