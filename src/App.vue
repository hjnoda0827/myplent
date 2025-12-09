<script setup lang="ts">
import { ref } from "vue";
import PlantList from "./components/PlantList.vue";
import RecordForm from "./components/RecordForm.vue";
import FertilizerList from "./components/FertilizerList.vue";
import CareMethodList from "./components/CareMethodList.vue";
import RecordList from "./components/RecordList.vue";

const currentTab = ref<"register" | "plants" | "fertilizers" | "careMethods" | "record" | "recordList">(
  "register"
);

const showRegisterMenu = ref(false);

const handleRegisterClick = () => {
  showRegisterMenu.value = true;
};

const selectRegisterOption = (option: "plants" | "fertilizers" | "careMethods") => {
  currentTab.value = option;
  showRegisterMenu.value = false;
};
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
        <nav class="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <button
            class="rounded-lg border px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white"
            :class="
              ['plants', 'fertilizers', 'careMethods'].includes(currentTab)
                ? 'border-emerald-500 bg-white text-emerald-700'
                : 'border-slate-200 bg-slate-100'
            "
            @click="handleRegisterClick"
          >
            📝 登録する
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
      <!-- 登録メニュー選択画面 -->
      <div v-if="showRegisterMenu" class="mx-auto max-w-2xl px-2 sm:px-4 py-6 space-y-6">
        <header class="space-y-1">
          <p class="text-xs uppercase tracking-wide text-slate-500">登録</p>
          <h2 class="text-xl font-semibold text-slate-900">登録項目を選択</h2>
          <p class="text-sm text-slate-600">登録する項目を選んでください</p>
        </header>

        <div class="grid grid-cols-1 gap-4">
          <button
            @click="selectRegisterOption('plants')"
            class="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-6 text-left hover:ring-2 hover:ring-emerald-500 transition-all"
          >
            <div class="flex items-center gap-4">
              <div class="text-4xl">🌿</div>
              <div>
                <h3 class="text-lg font-semibold text-slate-900">植物登録</h3>
                <p class="text-sm text-slate-600">新しい植物を登録します</p>
              </div>
            </div>
          </button>

          <button
            @click="selectRegisterOption('fertilizers')"
            class="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-6 text-left hover:ring-2 hover:ring-emerald-500 transition-all"
          >
            <div class="flex items-center gap-4">
              <div class="text-4xl">🧴</div>
              <div>
                <h3 class="text-lg font-semibold text-slate-900">肥料登録</h3>
                <p class="text-sm text-slate-600">使用する肥料を登録します</p>
              </div>
            </div>
          </button>

          <button
            @click="selectRegisterOption('careMethods')"
            class="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-6 text-left hover:ring-2 hover:ring-emerald-500 transition-all"
          >
            <div class="flex items-center gap-4">
              <div class="text-4xl">🛠️</div>
              <div>
                <h3 class="text-lg font-semibold text-slate-900">管理方法登録</h3>
                <p class="text-sm text-slate-600">植物の管理方法を登録します</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- 各登録・記録画面 -->
      <PlantList v-else-if="currentTab === 'plants'" />
      <FertilizerList v-else-if="currentTab === 'fertilizers'" />
      <CareMethodList v-else-if="currentTab === 'careMethods'" />
      <RecordForm v-else-if="currentTab === 'record'" />
      <RecordList v-else-if="currentTab === 'recordList'" />
    </main>
  </div>
</template>
