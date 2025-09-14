# React Component Review Template

## Review Focus
- Component architecture
- State management
- Performance optimization
- Hook usage
- Props validation
- Side effects handling
- Accessibility
- Testing

## Checklist

### Component Design
- [ ] Components are reusable
- [ ] Single responsibility principle
- [ ] Props interface well-defined
- [ ] PropTypes/TypeScript used
- [ ] Default props provided

### State Management
- [ ] State lifted appropriately
- [ ] No unnecessary re-renders
- [ ] Context used properly
- [ ] Redux/Zustand patterns followed
- [ ] Local vs global state correct

### Performance
- [ ] React.memo used where needed
- [ ] useMemo for expensive computations
- [ ] useCallback for stable references
- [ ] Key props unique and stable
- [ ] Virtual scrolling for long lists

### Hooks
- [ ] Custom hooks extracted
- [ ] Hook rules followed
- [ ] Dependencies correct
- [ ] Cleanup in useEffect
- [ ] No side effects in render

### Best Practices
- [ ] Controlled vs uncontrolled components
- [ ] Error boundaries implemented
- [ ] Suspense for code splitting
- [ ] Fragments used appropriately
- [ ] Event handlers optimized

## Anti-patterns to Avoid
- Direct state mutation
- Using index as key in dynamic lists
- Inline function definitions in JSX
- useEffect without dependencies
- Memory leaks from subscriptions
- Excessive prop drilling