<template>
  <div class="bg-white m-2 sm:m-3 p-3 sm:p-5 rounded-xl shadow-lg border border-gray-100 relative">
    <div v-if="loading" class="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-20 rounded-xl">
      <div class="animate-spin w-6 h-6 sm:w-8 sm:h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
    </div>

    <div class="flex justify-between items-center mb-3 sm:mb-5">
      <h2 class="text-base sm:text-lg font-bold text-gray-800 flex items-center">
        <span class="mr-2 text-sm sm:text-base">📅</span>
        <span class="hidden sm:inline">예약 현황</span>
        <span class="sm:hidden">예약</span>
      </h2>
      <div class="flex items-center space-x-1 sm:space-x-2 bg-gray-50 rounded-lg p-1">
        <button 
          @click="changeMonth(-1)"
          class="p-1.5 sm:p-2 text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition-all duration-200"
        >
          <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <span class="px-2 sm:px-4 py-1 sm:py-2 font-bold text-gray-800 text-xs sm:text-sm min-w-16 sm:min-w-24 text-center">
          {{ currentYear }}.{{ currentMonth }}
        </span>
        <button 
          @click="changeMonth(1)"
          class="p-1.5 sm:p-2 text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition-all duration-200"
        >
          <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 달력 헤더 -->
    <div class="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2 sm:mb-3">
      <div v-for="day in ['일', '월', '화', '수', '목', '금', '토']" 
           :key="day" 
           class="text-center text-xs font-bold text-gray-600 py-2 sm:py-3 bg-gray-50 rounded-md sm:rounded-lg"
           :class="{ 'text-red-500': day === '일', 'text-blue-500': day === '토' }">
        {{ day }}
      </div>
    </div>

    <!-- 달력 본체 -->
    <div class="grid grid-cols-7 gap-0.5 sm:gap-1">
      <div 
        v-for="date in calendarDates" 
        :key="date.dateString"
        class="min-h-10 sm:min-h-14 p-1 sm:p-2 transition-all duration-200 relative cursor-pointer rounded-md sm:rounded-lg"
        :class="{
          'bg-gray-50 text-gray-400': !date.isCurrentMonth,
          'bg-blue-100 ring-2 ring-blue-300 shadow-sm': date.dateString === selectedDate,
          'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 font-bold shadow-sm': date.isToday && date.dateString !== selectedDate,
          'hover:bg-gray-100 hover:shadow-sm': date.isCurrentMonth && date.dateString !== selectedDate,
          'bg-white border border-gray-200': date.isCurrentMonth && !date.isToday && date.dateString !== selectedDate
        }"
        @click="selectDate(date)"
      >
        <div class="text-xs font-medium text-center mb-0.5 sm:mb-1"
             :class="{
               'text-gray-400': !date.isCurrentMonth,
               'text-blue-700': date.isToday,
               'text-gray-700': date.isCurrentMonth && !date.isToday,
               'text-red-500': date.isCurrentMonth && date.date.getDay() === 0 && !date.isToday,
               'text-blue-600': date.isCurrentMonth && date.date.getDay() === 6 && !date.isToday
             }">
          {{ date.day }}
        </div>
        
        <!-- 예약 있음 표시 (점) -->
        <div class="flex justify-center">
          <div 
            v-if="getBookingsForDate(date.dateString).length > 0"
            class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shadow-sm"
            :class="{
              'bg-blue-500': getBookingsForDate(date.dateString).length === 1,
              'bg-yellow-500': getBookingsForDate(date.dateString).length >= 2 && getBookingsForDate(date.dateString).length <= 3,
              'bg-red-500': getBookingsForDate(date.dateString).length >= 4
            }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'BookingCalendar',
  props: {
    bookings: {
      type: Array,
      required: true
    },
    currentDate: {
      type: Date,
      required: true
    },
    selectedDate: {
      type: String,
      default: null
    },
    loading: { type: Boolean, default: false }
  },
  emits: ['selectDate', 'changeMonth'],
  setup(props, { emit }) {
    const currentYear = computed(() => props.currentDate.getFullYear())
    const currentMonth = computed(() => props.currentDate.getMonth() + 1)

    const calendarDates = computed(() => {
      const year = props.currentDate.getFullYear()
      const month = props.currentDate.getMonth()
      
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - firstDay.getDay())
      
      const endDate = new Date(lastDay)
      endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))
      
      const dates = []
      const current = new Date(startDate)
      
      while (current <= endDate) {
        const today = new Date()
        // 시간대 문제 해결: 로컬 날짜로 변환
        const year = current.getFullYear()
        const month = current.getMonth()
        const day = current.getDate()
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        
        dates.push({
          date: new Date(current),
          day: day,
          dateString: dateString,
          isCurrentMonth: current.getMonth() === month,
          isToday: current.toDateString() === today.toDateString()
        })
        current.setDate(current.getDate() + 1)
      }
      
      return dates
    })

    const getBookingsForDate = (dateString) => {
      return props.bookings.filter(booking => booking.date === dateString)
    }

    const selectDate = (date) => {
      if (date.isCurrentMonth) {
        emit('selectDate', date.dateString)
      }
    }

    const changeMonth = (direction) => {
      emit('changeMonth', direction)
    }

    return {
      currentYear,
      currentMonth,
      calendarDates,
      getBookingsForDate,
      selectDate,
      changeMonth
    }
  }
}
</script>