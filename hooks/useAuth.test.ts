import { renderHook, waitFor } from '@testing-library/react'
import { onAuthStateChanged } from 'firebase/auth'
import { useAuth } from '@/hooks/useAuth'

// Mock firebase/auth
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
}))

// Mock the firebase config
jest.mock('@/lib/firebase', () => ({
  auth: {},
}))

describe('useAuth hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return initial loading state', () => {
    ;(onAuthStateChanged as jest.Mock).mockImplementation(() => jest.fn())
    const { result } = renderHook(() => useAuth())

    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBe(null)
  })

  it('should set user when auth state changes', async () => {
    const mockUser = {
      uid: '123',
      email: 'test@example.com',
      displayName: 'Test User',
    }

    ;(onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      callback(mockUser)
      return jest.fn()
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.loading).toBe(false)
    })
  })

  it('should set user to null when signed out', async () => {
    ;(onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      callback(null)
      return jest.fn()
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.user).toBe(null)
      expect(result.current.loading).toBe(false)
    })
  })

  it('should unsubscribe on cleanup', () => {
    const mockUnsubscribe = jest.fn()
    ;(onAuthStateChanged as jest.Mock).mockImplementation(() => mockUnsubscribe)

    const { unmount } = renderHook(() => useAuth())

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })

  it('should call onAuthStateChanged with auth and callback', () => {
    ;(onAuthStateChanged as jest.Mock).mockImplementation(() => jest.fn())

    renderHook(() => useAuth())

    expect(onAuthStateChanged).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Function)
    )
  })
})
