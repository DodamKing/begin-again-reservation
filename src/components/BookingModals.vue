<template>
  <!-- 선택된 예약 상세 모달 -->
  <div v-if="selectedBooking" 
       class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
       @click.self="$emit('closeBookingDetail')">
          <div class="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
      <div class="flex justify-between items-start mb-4">
        <h3 class="text-lg font-semibold">예약 상세</h3>
        <button @click="$emit('closeBookingDetail')" class="text-gray-400 hover:text-gray-600 text-xl">
          ✕
        </button>
      </div>
      
      <div class="space-y-4 mb-6">
        <div class="flex items-center">
          <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm mr-3">👤</div>
          <span class="font-medium">{{ selectedBooking.name }}</span>
        </div>
        <div class="flex items-center">
          <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm mr-3">📅</div>
          <span>{{ formatDate(selectedBooking.date) }}</span>
        </div>
        <div class="flex items-center">
          <div class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm mr-3">⏰</div>
          <span>{{ selectedBooking.startTime }} ~ {{ selectedBooking.endTime }}</span>
        </div>
        <div class="flex items-center">
          <div class="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm mr-3">🎯</div>
          <span>{{ selectedBooking.purpose }}</span>
        </div>
      </div>

      <div class="space-y-2">
        <button 
          @click="$emit('editBooking', selectedBooking)"
          class="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors font-medium"
        >
          수정
        </button>
        <button 
          @click="$emit('deleteBooking', selectedBooking)"
          class="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 transition-colors font-medium"
        >
          삭제
        </button>
      </div>
    </div>
  </div>

  <!-- 삭제 확인 모달 -->
  <div
    v-if="showDeleteModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="$emit('cancelDelete')"
  >
    <div class="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
      <h3 class="text-lg font-semibold mb-4">예약 삭제</h3>
      <p class="text-gray-600 mb-6">이 예약을 정말 삭제하시겠습니까?</p>

      <div class="space-y-2">
        <!-- 🔹 삭제 버튼 -->
        <button
            :disabled="deleteLoading"
            @click="$emit('confirmDelete')"
            class="w-full flex items-center justify-center py-3 px-4 rounded-md
                    text-white font-medium transition
                    bg-red-600 hover:bg-red-700 disabled:bg-red-400">
            <span v-if="!deleteLoading">삭제</span>
            <span v-else
                    class="animate-spin w-4 h-4 border-2 border-white
                            border-t-transparent rounded-full"></span>
        </button>

        <!-- “취소” 버튼도 disable -->
        <button
            :disabled="deleteLoading"
            @click="$emit('cancelDelete')"
            class="w-full py-3 px-4 rounded-md font-medium
                    bg-gray-300 text-gray-700 hover:bg-gray-400 disabled:opacity-60">
            취소
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, onUnmounted } from 'vue'

export default {
  name: 'BookingModals',
  props: {
    selectedBooking: {
      type: Object,
      default: null
    },
    showDeleteModal: {
      type: Boolean,
      default: false
    },
    deleteLoading   : { type:Boolean, default:false }
  },
  emits: ['closeBookingDetail', 'editBooking', 'deleteBooking', 'confirmDelete', 'cancelDelete'],
  setup(props, { emit }) {
    const formatDate = (dateStr) => {
      const date = new Date(dateStr)
      const options = { 
        month: 'long', 
        day: 'numeric', 
        weekday: 'short' 
      }
      return date.toLocaleDateString('ko-KR', options)
    }

    // ESC 키로 모달 닫기
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (props.selectedBooking) {
          emit('closeBookingDetail')
        } else if (props.showDeleteModal) {
          emit('cancelDelete')
        }
      }
    }

    onMounted(() => {
      document.addEventListener('keydown', handleEsc)
    })

    onUnmounted(() => {
      document.removeEventListener('keydown', handleEsc)
    })

    return {
      formatDate
    }
  }
}
</script>