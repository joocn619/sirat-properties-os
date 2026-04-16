'use client'

import { Toaster } from 'react-hot-toast'

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3200,
        style: {
          background: 'rgba(17, 17, 24, 0.94)',
          color: '#F0EDE8',
          border: '1px solid rgba(255,255,255,0.08)',
          borderLeft: '3px solid #C9A96E',
          borderRadius: '18px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.28)',
          backdropFilter: 'blur(18px)',
        },
        success: {
          iconTheme: {
            primary: '#10B981',
            secondary: '#0A0A0F',
          },
        },
        error: {
          iconTheme: {
            primary: '#F43F5E',
            secondary: '#0A0A0F',
          },
        },
      }}
    />
  )
}
