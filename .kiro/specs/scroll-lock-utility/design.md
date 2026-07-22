# Design Document

## Overview

The scroll lock utility provides a robust mechanism to prevent scrolling on the page body when modals or overlays are displayed. It will be implemented as both a standalone utility module and a React hook, ensuring flexibility for different use cases throughout the application.

The solution handles edge cases like nested modals (reference counting), scrollbar width compensation (preventing layout shift), and mobile touch scrolling prevention.

## Architecture

The implementation follows a layered approach:

1. **Core Utility Layer**: Pure JavaScript functions that manipulate DOM and CSS
2. **React Hook Layer**: React-specific wrapper that handles component lifecycle
3. **Consumer Layer**: Components (modals, overlays) that use the utility

```
┌─────────────────────────────────┐
│   Modal/Overlay Components      │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│   useScrollLock Hook            │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│   scrollLock Utility            │
│   - lock()                      │
│   - unlock()                    │
│   - getScrollbarWidth()         │
└─────────────────────────────────┘
```

## Components and Interfaces

### 1. Core Utility Module (`scrollLock.ts`)

```typescript
interface ScrollLockState {
  lockCount: number;
  originalOverflow: string;
  originalPaddingRight: string;
  scrollPosition: number;
}

export function lock(): void;
export function unlock(): void;
export function isLocked(): boolean;
function getScrollbarWidth(): number;
```

### 2. React Hook (`useScrollLock.ts`)

```typescript
interface UseScrollLockOptions {
  enabled?: boolean;
  autoLock?: boolean;
}

export function useScrollLock(options?: UseScrollLockOptions): {
  lock: () => void;
  unlock: () => void;
  isLocked: boolean;
};
```

## Data Models

### ScrollLockState

Internal state maintained by the utility to track:
- `lockCount`: Reference counter for nested locks
- `originalOverflow`: Original CSS overflow value to restore
- `originalPaddingRight`: Original padding to restore after scrollbar compensation
- `scrollPosition`: Scroll position when lock was applied

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Lock prevents scrolling
*For any* page state, when scroll lock is applied, the body element should have `overflow: hidden` set.
**Validates: Requirements 1.1, 2.2**

### Property 2: Unlock restores scrolling
*For any* locked state, when scroll lock is removed and lock count reaches zero, the body element should have its original overflow value restored.
**Validates: Requirements 1.2, 2.3**

### Property 3: Scroll position preservation
*For any* scroll position, applying and then removing scroll lock should result in the same scroll position.
**Validates: Requirements 1.3, 1.4**

### Property 4: Reference counting for nested locks
*For any* sequence of N lock calls followed by M unlock calls where M < N, the body should remain locked. Only when M = N should the body unlock.
**Validates: Requirements 1.5, 3.3**

### Property 5: Scrollbar width compensation
*For any* page with a visible scrollbar, applying scroll lock should add padding-right equal to the scrollbar width to prevent layout shift.
**Validates: Requirements 3.2**

### Property 6: Hook cleanup on unmount
*For any* component using useScrollLock that locks scrolling, when the component unmounts, the lock count should decrease appropriately.
**Validates: Requirements 2.5**

## Error Handling

1. **Missing Body Element**: If `document.body` is not available, log a warning and return early
2. **Invalid State**: If unlock is called more times than lock, clamp lock count to 0
3. **Browser Compatibility**: Use feature detection for touch event prevention
4. **Concurrent Modifications**: Use a single source of truth (lock count) to prevent race conditions

## Testing Strategy

### Unit Tests
- Test lock/unlock functions with various call sequences
- Test scrollbar width calculation
- Test state preservation and restoration
- Test edge cases (no scrollbar, already locked, etc.)

### Property-Based Tests
The design includes 6 correctness properties that should be validated through property-based testing:

1. **Lock prevents scrolling**: Generate random page states, apply lock, verify overflow is hidden
2. **Unlock restores scrolling**: Generate random locked states, unlock, verify restoration
3. **Scroll position preservation**: Generate random scroll positions, lock/unlock, verify position unchanged
4. **Reference counting**: Generate random sequences of lock/unlock calls, verify correct behavior
5. **Scrollbar compensation**: Generate pages with/without scrollbars, verify padding adjustment
6. **Hook cleanup**: Generate random component mount/unmount sequences, verify lock count

### Integration Tests
- Test with actual modal components
- Test with nested modals
- Test on mobile devices (touch events)
- Test with different viewport sizes

### Testing Framework
- **Unit Testing**: Vitest (already configured in the project)
- **Property-Based Testing**: fast-check library for TypeScript
- Each property-based test should run a minimum of 100 iterations
- Each test must be tagged with: `**Feature: scroll-lock-utility, Property {number}: {property_text}**`

## Implementation Notes

1. **Scrollbar Width Detection**: Measure by creating a temporary div with overflow scroll
2. **Mobile Touch Prevention**: Use `touchmove` event listener with `preventDefault`
3. **React Hook**: Use `useEffect` for lifecycle management and `useRef` for tracking lock state
4. **TypeScript**: Full type safety with proper interfaces
5. **Side Effects**: All DOM manipulation should be reversible and tracked
