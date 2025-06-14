<template>
  <!-- 예약 폼 모달 -->
  <div v-if="show" 
       class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
       @click.self="$emit('close')">
    <div class="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-start mb-4">
        <h3 class="text-lg font-semibold">{{ editingId ? '예약 수정' : '새 예약 등록' }}</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-xl">
          ✕
        </button>
      </div>
      
      <form @submit.prevent="$emit('submitBooking')" class="space-y-4">
        <!-- 날짜 선택 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">날짜</label>
          <input 
            ref="dateInput" 
            :value="booking.date" 
            @input="$emit('update:booking', { ...booking, date: $event.target.value })"
            type="text" 
            placeholder="날짜를 선택하세요"
            class="w-full px-3 py-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            readonly
            required
          >
        </div>

        <!-- 시간 입력 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">시간</label>
          <div class="grid grid-cols-2 gap-2">
            <select 
              :value="booking.startTime" 
              @change="$emit('update:booking', { ...booking, startTime: $event.target.value })"
              class="px-3 py-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" 
              required
            >
              <option value="">시작 시간</option>
              <option v-for="time in timeSlots" :key="time" :value="time">{{ time }}</option>
            </select>
            <select 
              :value="booking.endTime"
              @change="$emit('update:booking', { ...booking, endTime: $event.target.value })"
              class="px-3 py-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" 
              required
            >
              <option value="">종료 시간</option>
              <option v-for="time in timeSlots" :key="time" :value="time">{{ time }}</option>
            </select>
          </div>
          
          <!-- 시간 겹침 경고 -->
          <div v-if="timeConflictWarning" class="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <div class="flex items-start">
              <div class="text-red-400 mr-2">⚠️</div>
              <div class="text-red-700 text-sm">{{ timeConflictWarning }}</div>
            </div>
          </div>
        </div>

        <!-- 예약자 이름 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">예약자 이름</label>
          <input 
            :value="booking.name"
            @input="$emit('update:booking', { ...booking, name: $event.target.value })"
            type="text" 
            placeholder="이름을 입력하세요"
            class="w-full px-3 py-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
        </div>

        <!-- 사용 목적 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">사용 목적</label>
          <input 
            :value="booking.purpose"
            @input="$emit('update:booking', { ...booking, purpose: $event.target.value })"
            type="text" 
            placeholder="예: 파트 연습, 밴드 연습 등"
            class="w-full px-3 py-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
        </div>

        <!-- 제출 버튼 -->
        <div class="flex space-x-3 pt-2">
          <button 
            type="button"
            @click="$emit('close')"
            class="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md font-medium hover:bg-gray-400"
          >
            취소
          </button>
          <button 
            type="submit" 
            :disabled="loading"
            class="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full loading mr-2"></span>
            {{ editingId ? '수정' : '예약' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { onMounted, onUnmounted, nextTick, ref, watch } from 'vue'
import flatpickr from 'flatpickr'
import { Korean } from 'flatpickr/dist/l10n/ko.js'

export default {
  name: 'BookingForm',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    booking: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    editingId: {
      type: String,
      default: null
    },
    timeConflictWarning: {
      type: String,
      default: ''
    }
  },
  emits: ['update:booking', 'submitBooking', 'close'],
  setup(props, { emit }) {
    const dateInput = ref(null)
    let flatpickrInstance = null
    
    const timeSlots = [
      '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
      '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', 
      '21:00', '22:00', '23:00'
    ]

    const initDatePicker = () => {
      if (dateInput.value && !flatpickrInstance) {
        flatpickrInstance = flatpickr(dateInput.value, {
          locale: Korean,
          dateFormat: 'Y-m-d',
          minDate: 'today',
          theme: 'airbnb',
          onChange: (selectedDates, dateStr) => {
            emit('update:booking', { ...props.booking, date: dateStr })
          }
        })
      }
    }

    const destroyDatePicker = () => {
      if (flatpickrInstance) {
        flatpickrInstance.destroy()
        flatpickrInstance = null
      }
    }

    // ESC 키로 모달 닫기
    const handleEsc = (e) => {
      if (e.key === 'Escape' && props.show) {
        emit('close')
      }
    }

    // show prop 변경 감지
    watch(() => props.show, async (newShow) => {
      if (newShow) {
        await nextTick()
        await nextTick() // 한 번 더 기다려서 DOM이 완전히 렌더링되도록
        initDatePicker()
      } else {
        destroyDatePicker()
      }
    })

    // booking.date 변경 시 flatpickr 업데이트
    watch(() => props.booking.date, (newDate) => {
      if (flatpickrInstance && newDate) {
        flatpickrInstance.setDate(newDate, false)
      }
    })

    onMounted(async () => {
      document.addEventListener('keydown', handleEsc)
      if (props.show) {
        await nextTick()
        initDatePicker()
      }
    })

    onUnmounted(() => {
      document.removeEventListener('keydown', handleEsc)
      destroyDatePicker()
    })

    return {
      dateInput,
      timeSlots
    }
  }
}
</script>

<style scoped>
.loading {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>