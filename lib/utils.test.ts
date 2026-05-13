import { cn } from '@/lib/utils'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('px-2 py-1', 'p-3')
    expect(result).toBe('p-3')
  })

  it('should handle string inputs', () => {
    const result = cn('flex', 'items-center')
    expect(result).toContain('flex')
    expect(result).toContain('items-center')
  })

  it('should filter out falsy values', () => {
    const result = cn('px-2', undefined, null, false, 'py-1')
    expect(result).toContain('px-2')
    expect(result).toContain('py-1')
  })

  it('should handle conditional classes', () => {
    const isActive = true
    const result = cn('base-class', isActive && 'active-class')
    expect(result).toContain('base-class')
    expect(result).toContain('active-class')
  })

  it('should handle array inputs', () => {
    const result = cn(['flex', 'items-center'], 'justify-between')
    expect(result).toContain('flex')
    expect(result).toContain('items-center')
    expect(result).toContain('justify-between')
  })

  it('should handle object inputs with boolean values', () => {
    const result = cn({
      'flex': true,
      'grid': false,
      'p-2': true,
    })
    expect(result).toContain('flex')
    expect(result).toContain('p-2')
    expect(result).not.toContain('grid')
  })

  it('should resolve tailwind conflicts correctly', () => {
    // When two conflicting tailwind classes are provided, merge should keep the rightmost
    const result = cn('w-1/2', 'w-full')
    expect(result).toContain('w-full')
  })

  it('should handle empty input', () => {
    const result = cn('')
    expect(result).toBe('')
  })

  it('should handle multiple conflicting padding values', () => {
    const result = cn('p-2', 'px-4', 'py-1')
    expect(result).toContain('px-4')
    expect(result).toContain('py-1')
  })
})
