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
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <header class="sticky top-0 z-10 bg-slate-50/80 backdrop-blur border-b border-slate-200">
      <div class="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-wide text-slate-500">Plent</p>
            <h1 class="text-2xl font-semibold text-slate-900">植物管理</h1>
          </div>
        </div>
        <nav class="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <button
            class="rounded-lg border px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white"
            :class="
              currentTab === 'plants'
                ? 'border-emerald-500 bg-white text-emerald-700'
                : 'border-slate-200 bg-slate-100'
            "
            @click="currentTab = 'plants'"
          >
            🌿 植物登録
          </button>
          <button
            class="rounded-lg border px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white"
            :class="
              currentTab === 'fertilizers'
                ? 'border-emerald-500 bg-white text-emerald-700'
                : 'border-slate-200 bg-slate-100'
            "
            @click="currentTab = 'fertilizers'"
          >
            🧴 肥料登録
          </button>
          <button
            class="rounded-lg border px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white"
            :class="
              currentTab === 'careMethods'
                ? 'border-emerald-500 bg-white text-emerald-700'
                : 'border-slate-200 bg-slate-100'
            "
            @click="currentTab = 'careMethods'"
          >
            🛠️ 管理方法登録
          </button>
          <button
            class="rounded-lg border px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white"
            :class="
              currentTab === 'record'
                ? 'border-emerald-500 bg-white text-emerald-700'
                : 'border-slate-200 bg-slate-100'
            "
            @click="currentTab = 'record'"
          >
            ✏️ 記録作成
          </button>
          <button
            class="rounded-lg border px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white"
            :class="
              currentTab === 'recordList'
                ? 'border-emerald-500 bg-white text-emerald-700'
                : 'border-slate-200 bg-slate-100'
            "
            @click="currentTab = 'recordList'"
          >
            📜 記録閲覧
          </button>
        </nav>
      </div>
    </header>

    <main class="mx-auto flex max-w-4xl flex-col px-4 pb-10">
      <PlantList v-if="currentTab === 'plants'" />
      <FertilizerList v-else-if="currentTab === 'fertilizers'" />
      <CareMethodList v-else-if="currentTab === 'careMethods'" />
      <RecordForm v-else-if="currentTab === 'record'" />
      <RecordList v-else />
    </main>
  </div>
</template>
