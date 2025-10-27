// src/firebase/config.js
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Firebase 앱 초기화
// const app = initializeApp(firebaseConfig)

// 환경변수가 설정되어 있을 때만 초기화
let app = null
let db = null

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
} else {
    console.log('Firebase 설정 없음 - 개발 모드로 실행')
}


// Firestore 데이터베이스 인스턴스
// export const db = getFirestore(app)
export { db }
export default app