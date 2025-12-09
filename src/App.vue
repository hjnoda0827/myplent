<script setup lang="ts">
import { ref } from "vue";
import PlantList from "./components/PlantList.vue";
import RecordForm from "./components/RecordForm.vue";
import FertilizerList from "./components/FertilizerList.vue";
import CareMethodList from "./components/CareMethodList.vue";
import RecordList from "./components/RecordList.vue";

const currentTab = ref<"plants" | "fertilizers" | "careMethods" | "record" | "recordList">(
  "plants"
);
const selectedRecord = ref<any | null>(null);
const recordsRefreshKey = ref(0);

const onEditRecord = (rec: any) => {
  selectedRecord.value = rec;
  currentTab.value = "record";
};

const onSaved = (payload: any) => {
  // increment refresh key to notify RecordList to reload
  recordsRefreshKey.value++;
  selectedRecord.value = null;
  currentTab.value = "recordList";
};

const onCancelEdit = () => {
  selectedRecord.value = null;
};
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <header class="sticky top-0 z-10 bg-slate-50/80 backdrop-blur border-b border-slate-200">
      <div class="mx-auto flex max-w-7xl flex-col gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-4 md:px-6 lg:px-8">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-wide text-slate-500">Plent</p>
            <h1 class="text-xl font-semibold text-slate-900 sm:text-2xl">植物管理</h1>
          </div>
        </div>
        <nav class="grid grid-cols-2 gap-1 sm:gap-2 md:grid-cols-5 lg:gap-3">
          <button
            class="rounded-lg border px-2 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-white sm:px-3 sm:py-2 sm:text-sm"
            :class="
              currentTab === 'plants'
                ? 'border-emerald-500 bg-white text-emerald-700'
                : 'border-slate-200 bg-slate-100'
            "
            @click="currentTab = 'plants'"
          >
            🌿 <span class="hidden sm:inline">植物登録</span><span class="sm:hidden">植物</span>
          </button>
          <button
            class="rounded-lg border px-2 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-white sm:px-3 sm:py-2 sm:text-sm"
            :class="
              currentTab === 'fertilizers'
                ? 'border-emerald-500 bg-white text-emerald-700'
                : 'border-slate-200 bg-slate-100'
            "
            @click="currentTab = 'fertilizers'"
          >
            🧴 <span class="hidden sm:inline">肥料登録</span><span class="sm:hidden">肥料</span>
          </button>
          <button
            class="rounded-lg border px-2 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-white sm:px-3 sm:py-2 sm:text-sm"
            :class="
              currentTab === 'careMethods'
                ? 'border-emerald-500 bg-white text-emerald-700'
                : 'border-slate-200 bg-slate-100'
            "
            @click="currentTab = 'careMethods'"
          >
            🛠️ <span class="hidden sm:inline">管理方法登録</span><span class="sm:hidden">管理</span>
          </button>
          <button
            class="rounded-lg border px-2 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-white sm:px-3 sm:py-2 sm:text-sm"
            :class="
              currentTab === 'record'
                ? 'border-emerald-500 bg-white text-emerald-700'
                : 'border-slate-200 bg-slate-100'
            "
            @click="currentTab = 'record'"
          >
            ✏️ <span class="hidden sm:inline">記録作成</span><span class="sm:hidden">記録</span>
          </button>
          <button
            class="rounded-lg border px-2 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-white sm:px-3 sm:py-2 sm:text-sm col-span-2 sm:col-span-1"
            :class="
              currentTab === 'recordList'
                ? 'border-emerald-500 bg-white text-emerald-700'
                : 'border-slate-200 bg-slate-100'
            "
            @click="currentTab = 'recordList'"
          >
            📜 <span class="hidden sm:inline">記録閲覧</span><span class="sm:hidden">閲覧</span>
          </button>
        </nav>
      </div>
    </header>

    <main class="mx-auto flex max-w-7xl flex-col px-3 pb-10 sm:px-4 md:px-6 lg:px-8">
      <PlantList v-if="currentTab === 'plants'" />
      <FertilizerList v-else-if="currentTab === 'fertilizers'" />
      <CareMethodList v-else-if="currentTab === 'careMethods'" />
      <RecordForm
        v-else-if="currentTab === 'record'"
        :editingRecord="selectedRecord"
        @saved="onSaved"
        @cancel-edit="onCancelEdit"
      />
      <RecordList v-else :refreshKey="recordsRefreshKey" @edit-record="onEditRecord" />
    </main>
  </div>
</template>
