import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

let socket = null

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, { transports: ['websocket', 'polling'], reconnectionAttempts: 5 })
    socket.on('connect', () => console.log('🔌 Socket connected'))
    socket.on('disconnect', () => console.log('🔌 Socket disconnected'))
    socket.on('connect_error', (e) => console.warn('Socket error:', e.message))
  }
  return socket
}

export const joinApp = (appId) => getSocket().emit('join_app', appId)
export const leaveApp = (appId) => getSocket().emit('leave_app', appId)

export default getSocket
