<template>
  <div class="mx-auto max-w-2xl px-2 sm:px-4 py-6 space-y-6">
    <header class="space-y-1">
      <p class="text-xs uppercase tracking-wide text-slate-500">記録</p>
      <h2 class="text-xl font-semibold text-slate-900">管理記録の作成</h2>
      <p class="text-sm text-slate-600">植物・管理方法・肥料を選択して保存してください。</p>
    </header>

    <form
      @submit.prevent="saveRecord"
      class="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-4 space-y-4"
    >
      <div class="space-y-1">
        <label class="text-sm font-medium text-slate-700">植物 *</label>
        <select
          v-model="form.plant_id"
          required
          class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        >
          <option value="">選択してください</option>
          <option v-for="plant in plants" :key="plant.id" :value="plant.id">
            {{ plant.name }}
          </option>
        </select>
      </div>

      <div class="space-y-1">
        <label class="text-sm font-medium text-slate-700">日付</label>
        <input
          type="date"
          v-model="form.record_date"
          class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        />
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium text-slate-700">管理方法（複数選択可）</label>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <label
            v-for="cm in careMethods"
            :key="cm.id"
            class="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <input type="checkbox" :value="cm.id" v-model="form.care_method_ids" />
            <span>{{ cm.name }}</span>
          </label>
        </div>
      </div>

      <div class="space-y-2">
        <label class="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input type="checkbox" v-model="form.use_fertilizer" />
          肥料を使う
        </label>

        <div v-if="form.use_fertilizer" class="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <label
            v-for="f in fertilizers"
            :key="f.id"
            class="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <input type="checkbox" :value="f.id" v-model="form.fertilizer_ids" />
            <span>{{ f.name }}</span>
          </label>
        </div>
      </div>

      <div class="space-y-1">
        <label class="text-sm font-medium text-slate-700">メモ</label>
        <textarea
          v-model="form.memo"
          class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          rows="3"
          placeholder="特記事項を記入してください"
        />
      </div>

      <button
        type="submit"
        :disabled="saving"
        class="w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600"
      >
        {{ saving ? "保存中..." : "記録を保存" }}
      </button>

      <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
      <p v-if="successMessage" class="text-sm text-emerald-600">{{ successMessage }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { supabase } from "@/lib/supabaseClient";

type Plant = { id: number; name: string };
type CareMethod = { id: number; name: string };
type Fertilizer = { id: number; name: string };

const plants = ref<Plant[]>([]);
const careMethods = ref<CareMethod[]>([]);
const fertilizers = ref<Fertilizer[]>([]);

const saving = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const today = new Date().toISOString().slice(0, 10);

const form = ref({
  plant_id: "" as string | number,
  record_date: today,
  memo: "",
  care_method_ids: [] as number[],
  use_fertilizer: false,
  fertilizer_ids: [] as number[],
});

// 초기 데이터 로드
const loadMasterData = async () => {
  // 식물
  const { data: plantData, error: plantError } = await supabase
    .from("plants")
    .select("id, name")
    .order("name", { ascending: true });

  if (!plantError && plantData) {
    plants.value = plantData as Plant[];
  }

  // 관리형태
  const { data: cmData, error: cmError } = await supabase
    .from("care_methods")
    .select("id, name")
    .order("name", { ascending: true });

  if (!cmError && cmData) {
    careMethods.value = cmData as CareMethod[];
  }

  // 비료
  const { data: fData, error: fError } = await supabase
    .from("fertilizers")
    .select("id, name")
    .order("name", { ascending: true });

  if (!fError && fData) {
    fertilizers.value = fData as Fertilizer[];
  }
};

onMounted(() => {
  loadMasterData();
});

// 기록 저장
const saveRecord = async () => {
  errorMessage.value = "";
  successMessage.value = "";
  saving.value = true;

  if (!form.value.plant_id) {
    errorMessage.value = "植物を選択してください。";
    saving.value = false;
    return;
  }

  if (form.value.care_method_ids.length === 0) {
    errorMessage.value = "管理方法を少なくとも1つ選択してください。";
    saving.value = false;
    return;
  }

  try {
    // 1) records에 메인 기록 저장
    const { data: recordData, error: recordError } = await supabase
      .from("records")
      .insert({
        plant_id: Number(form.value.plant_id),
        record_date: form.value.record_date || today,
        memo: form.value.memo || null,
      })
      .select("id")
      .single();

    if (recordError || !recordData) {
      console.error(recordError);
      errorMessage.value = "記録保存中にエラーが発生しました。(records)";
      saving.value = false;
      return;
    }

    const recordId = (recordData as { id: number }).id;

    // 2) record_care_methods에 관리형태들 저장
    const careRows = form.value.care_method_ids.map((cmId) => ({
      record_id: recordId,
      care_method_id: cmId,
    }));

    if (careRows.length > 0) {
      const { error: careError } = await supabase.from("record_care_methods").insert(careRows);

      if (careError) {
        console.error(careError);
        errorMessage.value = "管理方法の保存でエラーが発生しました。";
        saving.value = false;
        return;
      }
    }

    // 3) 비료 사용하는 경우, record_fertilizers에 저장
    if (form.value.use_fertilizer && form.value.fertilizer_ids.length > 0) {
      const fertRows = form.value.fertilizer_ids.map((fId) => ({
        record_id: recordId,
        fertilizer_id: fId,
      }));

      const { error: fertError } = await supabase.from("record_fertilizers").insert(fertRows);

      if (fertError) {
        console.error(fertError);
        errorMessage.value = "肥料の記録保存でエラーが発生しました。";
        saving.value = false;
        return;
      }
    }

    successMessage.value = "記録を保存しました。";
    // 폼 초기화
    form.value.record_date = today;
    form.value.memo = "";
    form.value.care_method_ids = [];
    form.value.use_fertilizer = false;
    form.value.fertilizer_ids = [];
  } finally {
    saving.value = false;
  }
};
</script>
