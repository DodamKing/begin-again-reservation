// src/services/firebaseService.js
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
    where,
    orderBy,
    onSnapshot
} from 'firebase/firestore'
import { db } from '../firebase/config'

const COLLECTION_NAME = 'begin-again-reservations'

export class FirebaseService {

    // 월별 예약 데이터 가져오기
    static async getBookings(startDate, endDate) {
        try {
            const q = query(
                collection(db, COLLECTION_NAME),
                where('date', '>=', startDate),
                where('date', '<=', endDate),
                orderBy('date'),
                orderBy('startTime')
            )

            const querySnapshot = await getDocs(q)
            const bookings = []

            querySnapshot.forEach((doc) => {
                bookings.push({
                    id: doc.id,
                    ...doc.data()
                })
            })

            return {
                success: true,
                data: bookings
            }
        } catch (error) {
            console.error('예약 데이터 가져오기 실패:', error)
            return {
                success: false,
                error: error.message
            }
        }
    }

    // 새 예약 생성
    static async createBooking(bookingData) {
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                ...bookingData,
                createdAt: new Date().toISOString()
            })

            return {
                success: true,
                id: docRef.id,
                data: { id: docRef.id, ...bookingData }
            }
        } catch (error) {
            console.error('예약 생성 실패:', error)
            return {
                success: false,
                error: error.message
            }
        }
    }

    // 예약 수정
    static async updateBooking(id, bookingData) {
        try {
            const bookingRef = doc(db, COLLECTION_NAME, id)
            await updateDoc(bookingRef, {
                ...bookingData,
                updatedAt: new Date().toISOString()
            })

            return {
                success: true,
                data: { id, ...bookingData }
            }
        } catch (error) {
            console.error('예약 수정 실패:', error)
            return {
                success: false,
                error: error.message
            }
        }
    }

    // 예약 삭제
    static async deleteBooking(id) {
        try {
            await deleteDoc(doc(db, COLLECTION_NAME, id))

            return {
                success: true,
                id
            }
        } catch (error) {
            console.error('예약 삭제 실패:', error)
            return {
                success: false,
                error: error.message
            }
        }
    }

    // 실시간 리스너 설정 (선택사항)
    static subscribeToBookings(startDate, endDate, callback) {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('date', '>=', startDate),
            where('date', '<=', endDate),
            orderBy('date'),
            orderBy('startTime')
        )

        return onSnapshot(q, (snapshot) => {
            const bookings = []
            snapshot.forEach((doc) => {
                bookings.push({
                    id: doc.id,
                    ...doc.data()
                })
            })
            callback(bookings)
        })
    }
  }