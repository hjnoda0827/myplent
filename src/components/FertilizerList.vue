<template>
  <div class="mx-auto max-w-5xl px-2 py-4 sm:px-4 sm:py-6 md:px-6 lg:px-8 space-y-6">
    <header class="space-y-1">
      <p class="text-xs uppercase tracking-wide text-slate-500">登録</p>
      <h1 class="text-lg font-semibold text-slate-900 sm:text-xl">肥料登録</h1>
      <p class="text-xs sm:text-sm text-slate-600">肥料名と備考を入力してください。</p>
    </header>

    <form
      @submit.prevent="editingId ? updateFertilizer() : createFertilizer()"
      class="p-3 space-y-3 bg-white shadow-sm rounded-2xl ring-1 ring-slate-200 sm:p-4 md:p-5"
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
        <h2 class="text-lg font-semibold text-slate-900 sm:text-lg">登録済みの肥料</h2>
        <span class="text-xs text-slate-500">{{ fertilizers.length }}件</span>
      </div>
      <ul class="space-y-2 sm:space-y-3 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
        <li
          v-for="fert in fertilizers"
          :key="fert.id"
          class="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200 sm:p-4"
        >
          <div class="font-semibold text-slate-900 text-sm sm:text-base">{{ fert.name }}</div>
          <p v-if="fert.memo" class="mt-2 text-xs sm:text-sm text-slate-700">{{ fert.memo }}</p>
          <div class="mt-3 flex gap-2">
            <button
              @click="startEdit(fert)"
              class="rounded-md border px-2 py-1 text-xs sm:text-sm text-emerald-600 hover:bg-emerald-50"
            >
              編集
            </button>
            <button
              @click="deleteFertilizer(fert.id)"
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

type Fertilizer = {
  id: number;
  name: string;
  memo: string | null;
  created_at?: string;
};

const fertilizers = ref<Fertilizer[]>([]);
const saving = ref(false);
const errorMessage = ref("");
const editingId = ref<number | null>(null);

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

const startEdit = (f: Fertilizer) => {
  editingId.value = f.id;
  newFertilizer.value.name = f.name;
  newFertilizer.value.memo = f.memo ?? "";
};

const cancelEdit = () => {
  editingId.value = null;
  newFertilizer.value.name = "";
  newFertilizer.value.memo = "";
  errorMessage.value = "";
};

const updateFertilizer = async () => {
  if (!editingId.value) return;
  if (!newFertilizer.value.name.trim()) {
    errorMessage.value = "肥料名は必須です。";
    return;
  }

  saving.value = true;
  errorMessage.value = "";

  const { data, error } = await supabase
    .from("fertilizers")
    .update({
      name: newFertilizer.value.name,
      memo: newFertilizer.value.memo || null,
    })
    .eq("id", editingId.value)
    .select("*")
    .single();

  if (error) {
    console.error(error);
    errorMessage.value = "肥料の更新に失敗しました。";
  } else if (data) {
    const idx = fertilizers.value.findIndex((x) => x.id === editingId.value);
    if (idx !== -1) fertilizers.value.splice(idx, 1, data as Fertilizer);
    cancelEdit();
  }

  saving.value = false;
};

const deleteFertilizer = async (id: number) => {
  if (!confirm("この肥料を削除しますか？関連する記録は手動で処理してください。")) return;
  const { error } = await supabase.from("fertilizers").delete().eq("id", id);
  if (error) {
    console.error(error);
    errorMessage.value = "肥料の削除に失敗しました。";
    return;
  }
  const idx = fertilizers.value.findIndex((x) => x.id === id);
  if (idx !== -1) fertilizers.value.splice(idx, 1);
  if (editingId.value === id) cancelEdit();
};

onMounted(() => {
  fetchFertilizers();
});
</script>
