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

        <!-- 시간 입력 (모달식 버튼 그리드) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">시간</label>
          
          <div class="grid grid-cols-2 gap-3">
            <!-- 시작 시간 -->
            <div>
              <label class="block text-xs text-gray-600 mb-1">시작 시간</label>
              <button 
                type="button"
                @click="openStartTimeModal"
                class="w-full px-3 py-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white text-left flex justify-between items-center"
              >
                <span>{{ booking.startTime || '선택하세요' }}</span>
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </button>
            </div>
            
            <!-- 종료 시간 -->
            <div>
              <label class="block text-xs text-gray-600 mb-1">종료 시간</label>
              <button 
                type="button"
                @click="openEndTimeModal"
                class="w-full px-3 py-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white text-left flex justify-between items-center"
              >
                <span>{{ booking.endTime || '선택하세요' }}</span>
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </button>
            </div>
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
            placeholder="사용 목적을 간단히 입력하세요"
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

  <!-- 시간 선택 모달 -->
  <div v-if="showTimeModal" 
       class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
       @click.self="closeTimeModal">
    <div class="bg-white rounded-lg p-6 w-full max-w-sm max-h-[70vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h4 class="text-lg font-semibold">{{ timeModalType === 'start' ? '시작' : '종료' }} 시간 선택</h4>
        <button @click="closeTimeModal" class="text-gray-400 hover:text-gray-600 text-xl">
          ✕
        </button>
      </div>
      
      <div class="grid grid-cols-4 gap-2">
        <button 
          v-for="time in currentTimeOptions" 
          :key="time"
          type="button"
          @click="selectTime(time)"
          :class="[
            'px-2 py-3 text-sm rounded-md border transition-colors',
            getCurrentSelectedTime() === time 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 active:bg-gray-100'
          ]"
        >
          {{ time }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, onUnmounted, nextTick, ref, watch, computed } from 'vue'
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
    
    // 시간 모달 상태 관리
    const showTimeModal = ref(false)
    const timeModalType = ref('start') // 'start' or 'end'
    
    // 시간 옵션 생성 (시작/종료에 따라 다름)
    const getTimeOptions = (type) => {
      const options = []
      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
          
          // 시작 시간: 00:00 포함, 24:00 제외
          // 종료 시간: 00:00 제외, 24:00 포함
          if (type === 'start' && timeStr === '00:00') {
            options.push(timeStr)
          } else if (type === 'end' && timeStr === '00:00') {
            continue // 00:00 제외
          } else {
            options.push(timeStr)
          }
        }
      }
      
      // 종료 시간에만 24:00 추가
      if (type === 'end') {
        options.push('24:00')
      }
      
      return options
    }
    
    // 현재 모달 타입에 따른 시간 옵션
    const currentTimeOptions = computed(() => {
      return getTimeOptions(timeModalType.value)
    })
    
    // 시간 모달 열기 함수들
    const openStartTimeModal = () => {
      timeModalType.value = 'start'
      showTimeModal.value = true
      // 히스토리에 시간 모달 상태 추가
      window.history.pushState({ modal: 'timeModal' }, '', window.location.href)
    }
    
    const openEndTimeModal = () => {
      timeModalType.value = 'end'
      showTimeModal.value = true
      // 히스토리에 시간 모달 상태 추가
      window.history.pushState({ modal: 'timeModal' }, '', window.location.href)
    }
    
    // 시간 모달 닫기
    const closeTimeModal = () => {
      showTimeModal.value = false
      // 시간 모달의 히스토리만 정리 (history.back() 사용하지 않음)
      if (window.history.state?.modal === 'timeModal') {
        window.history.replaceState(null, '', window.location.href)
      }
    }
    
    // 현재 선택된 시간 가져오기
    const getCurrentSelectedTime = () => {
      return timeModalType.value === 'start' ? props.booking.startTime : props.booking.endTime
    }
    
    // 시간 선택 함수
    const selectTime = (time) => {
      if (timeModalType.value === 'start') {
        emit('update:booking', { ...props.booking, startTime: time })
      } else {
        emit('update:booking', { ...props.booking, endTime: time })
      }
      closeTimeModal()
    }
    
    // 뒤로가기 이벤트 처리 (시간 모달 전용)
    const handleTimeModalPopState = (event) => {
      if (showTimeModal.value) {
        // 시간 모달이 열려있는데 timeModal 상태가 아니면 닫기
        if (!event.state || event.state.modal !== 'timeModal') {
          showTimeModal.value = false
          // 이벤트 전파 완전 차단
          event.stopImmediatePropagation()
          event.preventDefault()
          return false
        }
      }
    }

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
        // 예약 폼이 닫힐 때 시간 모달도 같이 닫기
        if (showTimeModal.value) {
          showTimeModal.value = false
        }
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
      // 캡처링 모드로 먼저 실행되도록 우선순위 확보
      window.addEventListener('popstate', handleTimeModalPopState, true)
      if (props.show) {
        await nextTick()
        initDatePicker()
      }
    })

    onUnmounted(() => {
      document.removeEventListener('keydown', handleEsc)
      window.removeEventListener('popstate', handleTimeModalPopState, true)
      destroyDatePicker()
    })

    return {
      dateInput,
      currentTimeOptions,
      showTimeModal,
      timeModalType,
      openStartTimeModal,
      openEndTimeModal,
      closeTimeModal,
      getCurrentSelectedTime,
      selectTime
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