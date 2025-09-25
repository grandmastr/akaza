# Akaza

A custom React-like library implementation written in TypeScript, featuring a fiber-based reconciliation engine and hooks system.

## Overview

Akaza is a lightweight React-like library that implements core React concepts from scratch, including:

- **Fiber Architecture**: A fiber-based reconciliation system for efficient rendering
- **Hooks System**: Support for useState, useSideEffect (useEffect), useRef, and useContext
- **Virtual DOM**: Virtual node system with reconciliation and diffing
- **Context API**: Component context sharing system
- **Error Boundaries**: Error handling and recovery mechanisms
- **JSX Support**: Full JSX syntax support via Babel

## Architecture

### Core Components

#### Fiber System (`src/types.ts`, `src/runtime.ts`)
- **Fiber**: The fundamental unit of work representing a component or DOM node
- **Runtime**: Global state management for the reconciliation process
- **Work Loop**: Time-sliced rendering using `requestIdleCallback`

#### Rendering Pipeline
1. **render()** (`src/utils/render.ts`): Entry point that sets up the fiber tree
2. **workLoop()**: Processes fibers incrementally during idle time
3. **performBitOfWork()** (`src/utils/performBitOfWork.ts`): Handles individual fiber processing
4. **reconcileChildren()** (`src/utils/reconcileChildren.ts`): Manages child fiber reconciliation
5. **commitRoot()** (`src/utils/dom/commitRoot.ts`): Applies changes to the actual DOM

#### Hooks Implementation
- **useState** (`src/hooks/useState.ts`): State management with queue-based updates
- **useSideEffect** (`src/hooks/useSideEffect.ts`): Side effects with dependency tracking
- **useRef** (`src/hooks/useRef.ts`): Mutable reference objects
- **useContext** (`src/hooks/useContext.ts`): Context consumption with provider lookup

#### DOM Management
- **createElement** (`src/utils/dom/createElement.ts`): Virtual node creation
- **createDom** (`src/utils/dom/createDom.ts`): Actual DOM node creation
- **updateDom** (`src/utils/dom/updateDom.ts`): Efficient DOM property updates

## Key Features

### Fiber-Based Reconciliation
Implements a work-in-progress (WIP) fiber tree system that allows for:
- Interruptible rendering
- Priority-based updates  
- Efficient reconciliation with previous renders
- Time-slicing for better performance

### Hooks System
Full implementation of React-like hooks with:
- **Hook Order Validation**: Ensures consistent hook ordering across renders
- **State Queue Processing**: Batches state updates efficiently
- **Dependency Tracking**: Optimizes side effect execution
- **Context Traversal**: Walks fiber tree to find context providers

### Error Boundaries
Comprehensive error handling system:
- Catches errors during component rendering
- Provides fallback UI components
- Propagates errors up the component tree
- Implements error recovery mechanisms

## Project Structure

```
src/
├── akaza.ts              # Main exports
├── index.tsx             # Sample application
├── runtime.ts            # Global runtime state
├── types.ts              # TypeScript definitions
├── hooks/                # Hook implementations
│   ├── useContext.ts
│   ├── useRef.ts
│   ├── useSideEffect.ts
│   └── useState.ts
└── utils/                # Core utilities
    ├── dom/              # DOM manipulation
    ├── performBitOfWork.ts
    ├── reconcileChildren.ts
    ├── render.ts
    └── error-boundary.ts
```

## Build System

- **TypeScript**: Full TypeScript support with strict typing
- **Babel**: Transpilation with JSX transformation
- **JSX Runtime**: Custom JSX factory function
- **ES Modules**: Modern module system

### Scripts
- `npm run dev`: Run development server with hot reloading
- `npm run build`: Build for production
- `npm run serve`: Serve built application
- `npm run run`: Build and run application

## Development

The project includes a sample application (`src/index.tsx`) demonstrating:
- Component state management
- Side effects with cleanup
- Context API usage  
- Ref handling
- Event handling

## Implementation Details

### Fiber Tree Structure
Each fiber contains:
- `dom`: Reference to actual DOM node
- `type`: Component function or HTML element type
- `props`: Component properties
- `parent/child/sibling`: Tree navigation pointers
- `alternate`: Previous render comparison
- `effectTag`: Change type (UPDATE/PLACEMENT/DELETION)
- `hooks`: Array of hook instances

### Hook Implementation
Hooks rely on:
- Consistent ordering across renders
- Index-based hook retrieval from previous renders
- Queue-based state updates
- Dependency comparison for side effects

### Context System
Contexts use:
- Symbol-based identification
- Provider component tagging
- Fiber tree traversal for value lookup
- Default value fallback

## Roadmap

### Upcoming Features

#### Additional Hooks
- **useReducer**: State management with reducer pattern (built as a wrapper around useState)
- **useMemo**: Memoization for expensive computations with dependency tracking
- **useCallback**: Memoization for function references to prevent unnecessary re-renders
- **useLayoutEffect**: Synchronous effects that run before browser paint (commit-time ordering)

#### Enhanced Form Handling
- **Controlled Inputs**: Improved synchronization of input values and checked states with proper event mapping

#### Performance Optimizations
- **Keyed Moves**: Advanced reconciliation that detects element reorders and uses `insertBefore` instead of detach/append operations
- **Efficient List Rendering**: Better handling of dynamic lists with minimal DOM operations

#### Developer Experience
- **Stricter Hook Validation**: Enhanced hook order checking with better error messages
- **Missing Key Warnings**: Development-time warnings for missing keys in lists
- **Enhanced Error Boundaries**: More detailed error reporting and recovery mechanisms

These features will further enhance Akaza's React compatibility while maintaining its educational value for understanding modern framework internals.
