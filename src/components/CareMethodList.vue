<template>
    <header class="py-3 space-y-1">
      <p class="text-xs tracking-wide uppercase text-slate-500">{{ careMethods.length }}件</p>
      <h1 class="text-lg font-semibold text-slate-900 sm:text-xl">管理方法登録</h1>
    </header>

    <!-- モバイルは全体、lg以上は2列レイアウト -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- フォーム領域 -->
      <div class="space-y-6">
        <form
          @submit.prevent="editingId ? updateCareMethod() : createCareMethod()"
          class="space-y-3 bg-white shadow-sm rounded-2xl ring-1 ring-slate-200 sm:p-4 md:p-5"
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
      </div>

      <!-- リスト領域 -->
      <section class="space-y-3">
        <div class="overflow-x-auto shadow-sm rounded-2xl ring-1 ring-slate-200">
          <table class="w-full bg-white">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th
                  @click="handleSort('name')"
                  class="px-4 py-3 text-left text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 select-none"
                >
                  管理方法名{{ getSortIndicator('name') }}
                </th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-slate-700">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(cm, index) in careMethods"
                :key="cm.id"
                class="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                :class="index % 2 === 0 ? 'bg-white' : 'bg-slate-50'"
              >
                <td class="px-4 py-3 text-sm font-medium text-slate-900">{{ cm.name }}</td>
                <td class="px-4 py-3 text-center">
                  <div class="flex justify-center gap-3">
                    <button
                      @click="startEdit(cm)"
                      class="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                      title="編集"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button
                      @click="deleteCareMethod(cm.id)"
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

// ソート状態
const sortBy = ref<"name" | "created_at">("created_at");
const sortOrder = ref<"asc" | "desc">("desc");

const fetchCareMethods = async () => {
  const { data, error } = await supabase
    .from("care_methods")
    .select("*")
    .order(sortBy.value, { ascending: sortOrder.value === "asc" });

  if (!error && data) {
    careMethods.value = data as CareMethod[];
  }
};

const handleSort = (column: "name" | "created_at") => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = column;
    sortOrder.value = "asc";
  }
  fetchCareMethods();
};

const getSortIndicator = (column: "name" | "created_at") => {
  if (sortBy.value !== column) return "";
  return sortOrder.value === "asc" ? " ▲" : " ▼";
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
