# 스.피.커(SPCC) 연습실 예약 시스템

청주 예술원 24시 연습실 3층 2호실용 예약 SPA. Netlify 호스팅.

## 스택
Vue 3 (Composition API) + Vite + Firebase Firestore (실시간 동기화) + Pinia + vue-router + flatpickr + Tailwind CSS

## 핵심 파일
- `src/App.vue` — 메인 컨테이너. 모달/예약/달력 상태와 비즈니스 로직이 모두 여기에 있음
- `src/components/`
  - `BookingCalendar.vue` — 월별 달력, 예약 수에 따라 점 색깔(1=파랑, 2~3=노랑, 4+=빨강)
  - `BookingForm.vue` — 등록/수정 폼 + 30분 단위 시간 선택 모달
  - `BookingModals.vue` — 상세보기, 삭제 확인 모달
  - `ToastNotification.vue` — 알림
- `src/services/firebaseService.js` — CRUD + `onSnapshot` 실시간 구독
- `src/firebase/config.js` — Firestore 초기화. env 없으면 `db = null` 개발 모드

## 개발 규칙
- **모바일 퍼스트**: 모든 UI 결정은 모바일 화면 기준. 좁은 폰 화면(~375px)에서 잘 보이는 게 1순위
- 환경변수는 Netlify에 등록되어 있음. 로컬에는 `.env` 없음 → 로컬 `npm run dev`로는 Firestore CRUD 동작 안 함 (개발 모드로 빠짐)
- Firestore 컬렉션 `begin-again-reservations`는 **다른 앱과 공유 중** — 데이터 형식·보안 규칙 변경 시 영향 고려

## 명령어
- `npm run dev` — 개발 서버
- `npm run build` — 프로덕션 빌드
- `npm run lint` — ESLint --fix
- `npm run format` — Prettier
