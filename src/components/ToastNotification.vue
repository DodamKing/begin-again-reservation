<template>
  <div 
    v-if="toast.show" 
    class="fixed top-4 right-4 z-50 transition-all duration-300 transform"
    :class="toast.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'"
  >
    <div 
      class="px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-80"
      :class="{
        'bg-green-500 text-white': toast.type === 'success',
        'bg-red-500 text-white': toast.type === 'error',
        'bg-blue-500 text-white': toast.type === 'info',
        'bg-yellow-500 text-white': toast.type === 'warning'
      }"
    >
      <div class="text-xl">
        {{ toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : toast.type === 'warning' ? '⚠️' : 'ℹ️' }}
      </div>
      <div class="flex-1">
        <div class="font-medium">{{ toast.title }}</div>
        <div v-if="toast.message" class="text-sm opacity-90">{{ toast.message }}</div>
      </div>
      <button @click="$emit('hideToast')" class="text-white hover:text-gray-200 text-xl font-bold">
        ×
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ToastNotification',
  props: {
    toast: {
      type: Object,
      required: true
    }
  },
  emits: ['hideToast']
}
</script>