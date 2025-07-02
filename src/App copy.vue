<template>
  <div class="bg-gray-50 min-h-screen">
    <!-- 전체 로딩 오버레이 -->
    <div v-if="initialLoading || monthLoading" class="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center px-4">
      <div class="animate-spin w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-3"></div>
      <h2 class="text-lg sm:text-xl font-semibold text-gray-800 mb-2 text-center">비긴 어게인</h2>
      <p class="text-sm sm:text-base text-gray-600 text-center">{{ loadingMessage }}</p>
    </div>

    <!-- 헤더 - 더 컴팩트하게 -->
    <header class="bg-white shadow-lg border-b border-gray-100">
      <div class="max-w-md mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div class="text-center">
          <div class="flex items-center justify-center mb-2 sm:mb-3">
            <div class="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-2 sm:p-3 mr-2 sm:mr-3 shadow-md">
              <img src="/logo.png" alt="비긴 어게인 로고" class="w-5 h-5 sm:w-6 sm:h-6 object-contain">
            </div>
            <div>
              <h1 class="text-xl sm:text-2xl font-bold text-gray-800">비긴 어게인</h1>
              <p class="text-xs sm:text-sm text-blue-600 font-medium">연습실 예약 시스템</p>
            </div>
          </div>
          <div class="h-1 w-16 sm:w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
        </div>
      </div>
    </header>

    <!-- 달력 -->
    <BookingCalendar 
      :bookings="currentMonthBookings"
      :current-date="currentDate"
      :selected-date="selectedDate"
      :loading="monthLoading"
      @selectDate="showDateBookings"
      @changeMonth="changeMonth"
    />

    <!-- 플로팅 버튼들 - 작은 화면에서 더 작게 -->
    <div class="fixed bottom-4 sm:bottom-6 right-3 sm:right-6 flex flex-col space-y-2 sm:space-y-3 z-40">
      <!-- 새로고침 버튼 -->
      <button 
        @click="refreshCurrentMonth" 
        :disabled="monthLoading"
        class="w-10 h-10 sm:w-12 sm:h-12 bg-gray-600 text-white rounded-full shadow-lg hover:bg-gray-700 transition-all duration-200 flex items-center justify-center disabled:opacity-50"
      >
        <svg v-if="!monthLoading" class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        <div v-else class="animate-spin w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full"></div>
      </button>

      <!-- + 버튼 -->
      <button 
        @click="openCreateBooking()"
        class="w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 flex items-center justify-center"
      >
        <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
      </button>
    </div>

    <!-- 예약 폼 모달 -->
    <BookingForm 
      :show="showBookingForm"
      v-model:booking="newBooking"
      :loading="formLoading"
      :editing-id="editingId"
      :time-conflict-warning="timeConflictWarning"
      @submitBooking="addBooking"
      @close="closeBookingForm"
    />

    <!-- 날짜별 예약 목록 모달 - 더 작은 화면에 최적화 -->
    <div v-if="showDateModal" 
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4"
         @click.self="closeDateModal">
      <div class="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-lg mx-2 sm:mx-4 max-h-[85vh] sm:max-h-[32rem] overflow-y-auto">
        <div class="flex justify-between items-start mb-3 sm:mb-4">
          <h3 class="text-base sm:text-lg font-semibold pr-2">{{ formatSelectedDate() }} 예약 현황</h3>
          <button @click="closeDateModal" class="text-gray-400 hover:text-gray-600 text-xl flex-shrink-0 w-8 h-8 flex items-center justify-center">
            ✕
          </button>
        </div>

        <div v-if="selectedDateBookings.length === 0" class="text-center py-6 sm:py-8 text-gray-500">
          <div class="text-2xl sm:text-3xl mb-2">📅</div>
          <div class="text-sm sm:text-base mb-3">이 날에는 예약이 없습니다.</div>
          <button 
            @click="openCreateBookingForDate"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            예약하기
          </button>
        </div>
        
        <div v-else class="space-y-2 sm:space-y-3">
          <div 
            v-for="booking in selectedDateBookings" 
            :key="booking.id"
            class="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1 cursor-pointer min-w-0" @click="showBookingDetail(booking); closeDateModal()">
                <div class="font-medium text-gray-900 mb-1 text-sm sm:text-base truncate">{{ booking.name }}</div>
                <div class="text-xs sm:text-sm text-gray-600 space-y-1">
                  <div class="flex items-center">
                    ⏰ {{ booking.startTime }} ~ {{ booking.endTime }}
                  </div>
                  <div class="flex items-start">
                    <span class="mr-1 flex-shrink-0">🎯</span>
                    <span class="break-words">{{ booking.purpose }}</span>
                  </div>
                </div>
              </div>
              <div class="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 ml-2 flex-shrink-0">
                <button 
                  @click="openEditBooking(booking); closeDateModal()"
                  class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 whitespace-nowrap"
                >
                  수정
                </button>
                <button 
                  @click="confirmDelete(booking); closeDateModal()"
                  class="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 whitespace-nowrap"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
          
          <!-- 새 예약 추가 버튼 -->
          <div class="pt-3 border-t border-gray-200">
            <button 
              @click="openCreateBookingForDate"
              class="w-full py-2 px-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm sm:text-base"
            >
              + 이 날에 새 예약 추가하기
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 예약 상세/삭제 모달들 -->
    <BookingModals 
      :selected-booking="selectedBooking"
      :show-delete-modal="showDeleteModal"
      :delete-loading="deleteLoading"
      @closeBookingDetail="closeBookingDetail"
      @editBooking="openEditBooking"
      @deleteBooking="confirmDelete"
      @confirmDelete="deleteBooking"
      @cancelDelete="cancelDelete"
    />

    <!-- 토스트 알림 -->
    <ToastNotification 
      :toast="toast"
      @hideToast="hideToast"
    />

    <!-- 푸터 - 모바일에 최적화 -->
    <footer class="bg-gray-800 text-gray-300 py-6 sm:py-8 mt-8 sm:mt-12">
      <div class="max-w-md mx-auto px-3 sm:px-4">
        <!-- 기존 푸터 내용 -->
        <div class="text-center mb-4 sm:mb-6">
          <div class="flex items-center justify-center mb-2">
            <div class="bg-blue-600 rounded-full p-2 mr-2">
              <img src="/logo.png" alt="비긴 어게인 로고" class="w-3 h-3 sm:w-4 sm:h-4 object-contain">
            </div>
            <span class="text-white font-semibold text-sm sm:text-base">비긴 어게인 모임</span>
          </div>
          <p class="text-xs sm:text-sm text-gray-400">연습실 예약 시스템</p>
        </div>
        
        <div class="bg-gray-700 rounded-lg p-3 sm:p-4 mb-4">
          <h4 class="text-white font-medium mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
            <span class="mr-2">💡</span>
            이용 안내
          </h4>
          <div class="space-y-2 text-xs sm:text-sm">
            <div class="flex items-start">
              <span class="mr-2 text-yellow-400 flex-shrink-0">💰</span>
              <div>
                <strong class="text-white">게스트 연습실 사용비:</strong> 1인당 5,000원<br>
                <span class="text-gray-400">모임 통장으로 입금해 주세요</span>
              </div>
            </div>
            
            <div class="flex items-start">
              <span class="mr-2 text-blue-400 flex-shrink-0">📍</span>
              <div>
                <strong class="text-white">주소:</strong><br>
                <span class="text-gray-400 break-words">충청북도 청주시 서원구 내수동로 165<br>예술원 24시 연습실 3층 2호실</span>
              </div>
            </div>
            
            <div class="flex items-start">
              <span class="mr-2 text-green-400 flex-shrink-0">🔐</span>
              <div>
                <strong class="text-white">출입 정보:</strong><br>
                <span class="text-gray-400">
                  현관 비밀번호: {{ doorPassword }}<br>
                  호실 비밀번호: {{ roomPassword }}
                </span>
              </div>
            </div>
            
            <div class="flex items-start">
              <span class="mr-2 text-red-400 flex-shrink-0">🚪</span>
              <div>
                <strong class="text-white">퇴실 시 주의:</strong><br>
                <span class="text-gray-400">나갈 때 '#' 버튼을 눌러 출입문을 잠궈주세요!</span>
              </div>
            </div>

            <div class="flex items-start">
              <span class="mr-2 text-orange-400 flex-shrink-0">🚗</span>
              <div>
                <strong class="text-white">주차 안내:</strong><br>
                <span class="text-gray-400">연습실 옆 주차장 주차 금지<br>길가나 상가에 주차하고 오셔야 합니다</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="text-center text-xs text-gray-500 border-t border-gray-700 pt-3 sm:pt-4">
          Made with ❤️ for 비긴 어게인
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import BookingCalendar from './components/BookingCalendar.vue'
import BookingForm from './components/BookingForm.vue'
import BookingModals from './components/BookingModals.vue'
import ToastNotification from './components/ToastNotification.vue'

export default {
  name: 'App',
  components: {
    BookingCalendar,
    BookingForm,
    BookingModals,
    ToastNotification
  },
  data() {
    return {
      doorPassword: import.meta.env.VITE_DOOR_PASSWORD || '****',
      roomPassword: import.meta.env.VITE_ROOM_PASSWORD || '****'
    };
  },
  setup() {
    // API URL
    const API_URL = 'https://script.google.com/macros/s/AKfycbyGrxON-jfeEGL6b78HfRpDQLkqpeqxVw3wNdiok-9G7NwCv4-02ITUaPratUwOFFmj/exec'
    
    // 모바일 뒤로가기 대응을 위한 히스토리 관리
    const modalHistory = ref([])
    
    // 히스토리에 모달 상태 추가
    const pushModalHistory = (modalType) => {
      modalHistory.value.push(modalType)
      window.history.pushState({ modal: modalType }, '', window.location.href)
    }
    
    // 뒤로가기 이벤트 처리
    const handlePopState = () => {
      if (modalHistory.value.length > 0) {
        const lastModal = modalHistory.value.pop()
        
        switch (lastModal) {
          case 'dateModal':
            showDateModal.value = false
            selectedDateBookings.value = []
            selectedDateString.value = ''
            break
          case 'bookingForm':
            showBookingForm.value = false
            resetForm()
            break
          case 'bookingDetail':
            selectedBooking.value = null
            break
          case 'deleteModal':
            showDeleteModal.value = false
            bookingToDelete.value = null
            break
        }
        
        if (modalHistory.value.length === 0) {
          window.history.replaceState(null, '', window.location.href)
        }
      }
    }
    
    // 상태 관리
    const currentMonthBookings = ref([])
    const initialLoading = ref(true)
    const monthLoading = ref(false)
    const formLoading = ref(false)
    const deleteLoading = ref(false)
    const loadingMessage = ref('연습실 예약 시스템을 준비하고 있습니다...')
    
    const newBooking = ref({
      date: '',
      startTime: '',
      endTime: '',
      name: '',
      purpose: ''
    })
    
    const editingId = ref(null)
    const showBookingForm = ref(false)
    const showDateModal = ref(false)
    const selectedDateBookings = ref([])
    const selectedDateString = ref('')
    const selectedBooking = ref(null)
    const showDeleteModal = ref(false)
    const bookingToDelete = ref(null)
    const timeConflictWarning = ref('')
    
    // 달력 관련
    const currentDate = ref(new Date())
    const selectedDate = ref(null)
    
    // 토스트 알림
    const toast = ref({
      show: false,
      type: 'info',
      title: '',
      message: ''
    })

    // 월별 날짜 범위 계산
    const getMonthDateRange = (date = currentDate.value) => {
      const year = date.getFullYear()
      const month = date.getMonth()
      const start = new Date(year, month, 1)
      const end = new Date(year, month + 1, 0)

      const toYMD = d => d.toLocaleDateString('ko-KR', {
        year:'numeric', month:'2-digit', day:'2-digit'
      }).replace(/\. /g, '-').replace('.', '')

      return {
        startDate: toYMD(start),
        endDate: toYMD(end)
      }
    }

    // 시간을 분으로 변환 (24시간 기준, 단순화)
    const timeToMinutes = (time) => {
      // 24:00을 특별 처리
      if (time === '24:00') return 24 * 60
      
      const [hours, minutes] = time.split(':').map(Number)
      return hours * 60 + minutes
    }

    // 시간 겹침 확인 함수 (단순화)
    const isTimeOverlap = (start1, end1, start2, end2) => {
      const start1Min = timeToMinutes(start1)
      const end1Min = timeToMinutes(end1)
      const start2Min = timeToMinutes(start2)
      const end2Min = timeToMinutes(end2)

      return start1Min < end2Min && end1Min > start2Min
    }

    // 시간 충돌 확인 (단순화)
    const checkTimeConflict = () => {
      timeConflictWarning.value = ''
      
      if (!newBooking.value.date || !newBooking.value.startTime || !newBooking.value.endTime) {
        return
      }

      // 기본 유효성 검사: 종료시간이 시작시간보다 늦어야 함
      const startMin = timeToMinutes(newBooking.value.startTime)
      const endMin = timeToMinutes(newBooking.value.endTime)
      
      if (startMin >= endMin) {
        timeConflictWarning.value = '종료 시간은 시작 시간보다 늦어야 합니다'
        return
      }

      // 같은 날짜의 다른 예약들과 겹침 확인
      const conflicts = currentMonthBookings.value.filter(booking => {
        if (booking.id === editingId.value) return false
        if (booking.date !== newBooking.value.date) return false
        
        return isTimeOverlap(
          newBooking.value.startTime, 
          newBooking.value.endTime, 
          booking.startTime, 
          booking.endTime
        )
      })

      if (conflicts.length > 0) {
        const conflictNames = conflicts.map(b => b.name).join(', ')
        timeConflictWarning.value = `겹치는 예약이 있습니다: ${conflictNames}`
      }
    }

    // 개선된 JSONP API 호출
    const callAPI = async (action, data = null) => {
      return new Promise((resolve, reject) => {
        const callbackName = 'jsonp_callback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)
        
        const cleanup = () => {
          if (window[callbackName]) {
            delete window[callbackName]
          }
          const scripts = document.querySelectorAll(`script[src*="${callbackName}"]`)
          scripts.forEach(script => {
            if (script.parentNode) {
              script.parentNode.removeChild(script)
            }
          })
        }

        const timeoutId = setTimeout(() => {
          cleanup()
          reject(new Error('요청 시간이 초과되었습니다 (15초)'))
        }, 15000)
        
        window[callbackName] = (result) => {
          clearTimeout(timeoutId)
          cleanup()

          if (result && result.success) {
            resolve(result)
          } else {
            console.error(`API 오류 (${action}):`, result?.error || 'Unknown error')
            reject(new Error(result?.error || 'API 요청이 실패했습니다'))
          }
        }
        
        let url = `${API_URL}?callback=${callbackName}&action=${action}&_t=${Date.now()}`
        
        if (action === 'get') {
          const { startDate, endDate } = getMonthDateRange()
          url += `&startDate=${startDate}&endDate=${endDate}`
        } else if (data) {
          if (action === 'delete') {
            url += `&id=${encodeURIComponent(data)}`
          } else {
            Object.keys(data).forEach(key => {
              if (data[key] !== undefined && data[key] !== null) {
                let value = data[key].toString()
                if (key === 'purpose' && value.length > 80) {
                  value = value.substring(0, 80)
                }
                if (key === 'name' && value.length > 30) {
                  value = value.substring(0, 30)
                }
                url += `&${key}=${encodeURIComponent(value)}`
              }
            })
          }
        }
        
        const script = document.createElement('script')
        script.src = url
        script.onerror = () => {
          clearTimeout(timeoutId)
          cleanup()
          reject(new Error('네트워크 연결을 확인해주세요'))
        }
        
        document.head.appendChild(script)
      })
    }

    // 월별 예약 데이터 로드
    const loadMonthBookings = async () => {
      try {
        loadingMessage.value = '예약 데이터를 불러오는 중입니다...';
        monthLoading.value = true
        
        const response = await callAPI('get')
        
        if (response && response.data) {
          currentMonthBookings.value = response.data.filter(booking => 
            booking && booking.id && booking.date && booking.name
          ).sort((a, b) => {
            const dateCompare = new Date(a.date) - new Date(b.date)
            if (dateCompare !== 0) return dateCompare
            return a.startTime.localeCompare(b.startTime)
          })
        } else {
          throw new Error('응답 데이터가 올바르지 않습니다')
        }
        
      } catch (error) {
        console.error('월별 예약 로딩 실패:', error)
        showToast('error', '로딩 실패', error.message)
        currentMonthBookings.value = []
      } finally {
        monthLoading.value = false
      }
    }

    // 초기 로딩
    const initialLoad = async () => {
      try {
        initialLoading.value = true
        loadingMessage.value = '이번 달 예약 데이터를 불러오고 있습니다...'
        
        await loadMonthBookings()
        
        loadingMessage.value = '완료!'
        setTimeout(() => {
          initialLoading.value = false
        }, 500)
        
      } catch (error) {
        console.error('초기 로딩 실패:', error)
        loadingMessage.value = '로딩에 실패했습니다'
        showToast('error', '초기화 실패', '페이지를 새로고침해주세요')
        setTimeout(() => {
          initialLoading.value = false
        }, 1000)
      }
    }

    // 예약 추가/수정
    const addBooking = async () => {
      if (timeConflictWarning.value) {
        showToast('warning', '시간 겹침', '다른 시간을 선택해주세요')
        return
      }

      try {
        formLoading.value = true
        
        const booking = {
          id: editingId.value || Date.now().toString(),
          date: newBooking.value.date,
          startTime: newBooking.value.startTime,
          endTime: newBooking.value.endTime,
          name: newBooking.value.name.trim(),
          purpose: newBooking.value.purpose.trim(),
          createdAt: new Date().toISOString()
        }

        const action = editingId.value ? 'update' : 'create'
        await callAPI(action, booking)

        // 로컬 데이터 즉시 업데이트
        if (editingId.value) {
          const index = currentMonthBookings.value.findIndex(b => b.id === editingId.value)
          if (index !== -1) {
            currentMonthBookings.value[index] = booking
          }
        } else {
          const bookingDate = new Date(booking.date)
          const currentYear = currentDate.value.getFullYear()
          const currentMonth = currentDate.value.getMonth()
          
          if (bookingDate.getFullYear() === currentYear && bookingDate.getMonth() === currentMonth) {
            currentMonthBookings.value.push(booking)
            currentMonthBookings.value.sort((a, b) => {
              const dateCompare = new Date(a.date) - new Date(b.date)
              if (dateCompare !== 0) return dateCompare
              return a.startTime.localeCompare(b.startTime)
            })
          }
        }

        resetForm()
        closeBookingForm()
        showToast('success', '완료!', editingId.value ? '예약이 수정되었습니다' : '예약이 등록되었습니다')
        
      } catch (error) {
        console.error('예약 저장 실패:', error)
        showToast('error', '저장 실패', error.message)
      } finally {
        formLoading.value = false
      }
    }

    // 예약 삭제
    const deleteBooking = async () => {
      if (!bookingToDelete.value) {
        console.error('삭제할 예약이 선택되지 않음')
        return
      }

      try {
        deleteLoading.value = true
        
        const response = await callAPI('delete', bookingToDelete.value.id)
        
        if (response && response.success) {
          const deletedId = bookingToDelete.value.id
          currentMonthBookings.value = currentMonthBookings.value.filter(b => b.id !== deletedId)
          
          showDeleteModal.value = false
          selectedBooking.value = null
          bookingToDelete.value = null
          
          if (showDateModal.value && selectedDateString.value) {
            selectedDateBookings.value = selectedDateBookings.value.filter(b => b.id !== deletedId)
          }
          
          showToast('success', '삭제 완료', '예약이 삭제되었습니다')
        } else {
          throw new Error(response?.error || '삭제 응답이 올바르지 않습니다')
        }
        
      } catch (error) {
        console.error('예약 삭제 실패:', error)
        showToast('error', '삭제 실패', error.message || '예약 삭제 중 오류가 발생했습니다')
      } finally {
        deleteLoading.value = false
      }
    }

    // 달 변경
    const changeMonth = async (direction) => {
      const newDate = new Date(currentDate.value)
      newDate.setMonth(newDate.getMonth() + direction)
      currentDate.value = newDate
      
      await loadMonthBookings(newDate)
    }

    // 현재 달 새로고침
    const refreshCurrentMonth = async () => {
      await loadMonthBookings(currentDate.value)
      showToast('success', '새로고침 완료', '최신 데이터를 불러왔습니다')
    }

    // 예약 폼 열기
    const openCreateBooking = (date = null) => {
      resetForm()
      if (date) {
        newBooking.value.date = date
        selectedDate.value = date
      }
      showBookingForm.value = true
      pushModalHistory('bookingForm')
    }

    // 예약 수정 폼 열기
    const openEditBooking = (booking) => {
      newBooking.value = { ...booking }
      editingId.value = booking.id
      selectedBooking.value = null
      showBookingForm.value = true
      pushModalHistory('bookingForm')
    }

    // 예약 폼 닫기
    const closeBookingForm = () => {
      showBookingForm.value = false
      resetForm()
      
      if (modalHistory.value[modalHistory.value.length - 1] === 'bookingForm') {
        modalHistory.value.pop()
        if (modalHistory.value.length > 0) {
          window.history.back()
        } else {
          window.history.replaceState(null, '', window.location.href)
        }
      }
    }

    // 삭제 확인
    const confirmDelete = (booking) => {
      bookingToDelete.value = booking
      selectedBooking.value = null
      showDateModal.value = false
      showDeleteModal.value = true
      pushModalHistory('deleteModal')
    }

    // 삭제 취소
    const cancelDelete = () => {
      showDeleteModal.value = false
      bookingToDelete.value = null
      
      if (modalHistory.value[modalHistory.value.length - 1] === 'deleteModal') {
        modalHistory.value.pop()
        if (modalHistory.value.length > 0) {
          window.history.back()
        } else {
          window.history.replaceState(null, '', window.location.href)
        }
      }
    }

    // 폼 초기화
    const resetForm = () => {
      newBooking.value = {
        date: '',
        startTime: '',
        endTime: '',
        name: '',
        purpose: ''
      }
      editingId.value = null
      timeConflictWarning.value = ''
    }

    // 날짜별 예약 보기
    const showDateBookings = (dateString) => {
      selectedDateString.value = dateString
      const dayBookings = currentMonthBookings.value.filter(booking => booking.date === dateString)
      selectedDateBookings.value = [...dayBookings].sort((a, b) => {
        return a.startTime.localeCompare(b.startTime)
      })
      showDateModal.value = true
      pushModalHistory('dateModal')
    }

    // 날짜 모달 닫기
    const closeDateModal = () => {
      showDateModal.value = false
      selectedDateBookings.value = []
      selectedDateString.value = ''
      
      if (modalHistory.value[modalHistory.value.length - 1] === 'dateModal') {
        modalHistory.value.pop()
        if (modalHistory.value.length > 0) {
          window.history.back()
        } else {
          window.history.replaceState(null, '', window.location.href)
        }
      }
    }

    // 선택된 날짜 포맷팅
    const formatSelectedDate = () => {
      if (!selectedDateString.value) return ''
      const date = new Date(selectedDateString.value)
      const options = { 
        month: 'long', 
        day: 'numeric', 
        weekday: 'short' 
      }
      return date.toLocaleDateString('ko-KR', options)
    }

    // 특정 날짜에 예약 추가
    const openCreateBookingForDate = () => {
      const targetDate = selectedDateString.value
      
      showDateModal.value = false
      selectedDateBookings.value = []
      selectedDateString.value = ''
      
      if (modalHistory.value[modalHistory.value.length - 1] === 'dateModal') {
        modalHistory.value.pop()
      }
      
      setTimeout(() => {
        openCreateBooking(targetDate)
      }, 100)
    }

    // 예약 상세 보기
    const showBookingDetail = (booking) => {
      selectedBooking.value = booking
      pushModalHistory('bookingDetail')
    }

    // 예약 상세 닫기
    const closeBookingDetail = () => {
      selectedBooking.value = null
      
      if (modalHistory.value[modalHistory.value.length - 1] === 'bookingDetail') {
        modalHistory.value.pop()
        if (modalHistory.value.length > 0) {
          window.history.back()
        } else {
          window.history.replaceState(null, '', window.location.href)
        }
      }
    }

    // 토스트 알림 표시
    const showToast = (type, title, message = '') => {
      toast.value = {
        show: true,
        type,
        title,
        message
      }
      
      setTimeout(() => {
        hideToast()
      }, 3000)
    }

    // 토스트 알림 숨기기
    const hideToast = () => {
      toast.value.show = false
    }

    // Watch - 시간 충돌 확인 (단순화)
    watch(() => newBooking.value.date, checkTimeConflict)
    watch(() => newBooking.value.startTime, checkTimeConflict)
    watch(() => newBooking.value.endTime, checkTimeConflict)

    // Lifecycle
    onMounted(async () => {
      await initialLoad()
      window.addEventListener('popstate', handlePopState)
    })
    
    onUnmounted(() => {
      window.removeEventListener('popstate', handlePopState)
    })

    return {
      // 상태
      currentMonthBookings,
      initialLoading,
      monthLoading,
      formLoading,
      deleteLoading,
      loadingMessage,
      newBooking,
      editingId,
      showBookingForm,
      showDateModal,
      selectedDateBookings,
      selectedDateString,
      selectedBooking,
      showDeleteModal,
      bookingToDelete,
      timeConflictWarning,
      currentDate,
      selectedDate,
      toast,
      
      // 메서드
      addBooking,
      deleteBooking,
      changeMonth,
      refreshCurrentMonth,
      openCreateBooking,
      openEditBooking,
      closeBookingForm,
      confirmDelete,
      cancelDelete,
      showDateBookings,
      closeDateModal,
      formatSelectedDate,
      openCreateBookingForDate,
      showBookingDetail,
      closeBookingDetail,
      showToast,
      hideToast
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