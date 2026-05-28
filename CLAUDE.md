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

## 향후 개선 (시간 될 때)
첫 진입 번들 사이즈가 약 500KB(gzip 142KB). 빌드 시 Vite가 500KB 초과 청크 경고. 동작엔 문제 없음. 줄이려면:

- **Firebase 동적 import** (효과 큼) — `firebaseService` import를 `onMounted` 안의 `await import()`로 옮기면 초기 번들에서 ~300KB 빠지고 Vue 코어만 받으면 화면이 먼저 뜸. 모바일 첫 진입 체감 큰 개선
- **manualChunks로 vendor 분리** (캐시 효율) — `vite.config.js`에 Firebase/Vue 등 vendor 청크 분리. 우리 코드 배포해도 vendor 캐시 유지되어 재방문 시 효과
- **flatpickr 동적 import** (가성비 작음) — ~40KB 빠짐. 위 두 가지 대비 미미함

크기 더 줄이긴 어려움: Firebase는 이미 modular import, `firestore/lite`는 `onSnapshot` 미지원이라 사용 불가.

추가로 두 번째 방문 즉시 표시까지 원하면 Firestore `persistentLocalCache` 활성화 ([firebase/config.js](src/firebase/config.js)에서 `initializeFirestore` + `persistentLocalCache()`로 교체). 클라이언트 IndexedDB 캐시라 다른 앱·Firestore 서버에 영향 없음.
