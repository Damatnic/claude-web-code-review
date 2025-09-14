# Performance Review Template

## Review Focus
- Algorithm complexity and optimization
- Memory usage and leaks
- Database query optimization
- Caching strategies
- Bundle size optimization
- Rendering performance
- Network request optimization
- Resource loading

## Checklist

### Algorithm Optimization
- [ ] Time complexity analyzed
- [ ] Space complexity considered
- [ ] Unnecessary loops eliminated
- [ ] Efficient data structures used
- [ ] Memoization implemented where needed

### Database Performance
- [ ] Queries use proper indexes
- [ ] N+1 queries eliminated
- [ ] Batch operations used
- [ ] Connection pooling configured
- [ ] Query results cached appropriately

### Frontend Performance
- [ ] Code splitting implemented
- [ ] Lazy loading used
- [ ] Images optimized
- [ ] Bundle size minimized
- [ ] Critical CSS inlined

### Caching
- [ ] HTTP caching headers set
- [ ] CDN utilized
- [ ] Redis/Memory cache used
- [ ] Cache invalidation strategy
- [ ] Static assets cached

## Performance Metrics
- Load Time: < 3s
- Time to Interactive: < 5s
- First Contentful Paint: < 1.5s
- Bundle Size: < 200KB gzipped
- API Response: < 200ms p95