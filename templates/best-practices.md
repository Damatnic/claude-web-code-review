# Best Practices Review Template

## Review Focus
- Code organization and structure
- Naming conventions
- Error handling
- Documentation
- Testing coverage
- SOLID principles
- DRY principle
- Code readability

## Checklist

### Code Quality
- [ ] Functions are single-purpose
- [ ] Variables clearly named
- [ ] Magic numbers avoided
- [ ] Code is self-documenting
- [ ] Comments explain why, not what

### Error Handling
- [ ] All errors caught and handled
- [ ] Error messages informative
- [ ] Graceful degradation
- [ ] Logging implemented
- [ ] User-friendly error messages

### Testing
- [ ] Unit tests present
- [ ] Integration tests where needed
- [ ] Edge cases covered
- [ ] Mocks used appropriately
- [ ] Test coverage > 80%

### Maintainability
- [ ] Code is modular
- [ ] Dependencies minimized
- [ ] Configuration externalized
- [ ] Documentation updated
- [ ] Version control best practices

### Design Patterns
- [ ] Appropriate patterns used
- [ ] Over-engineering avoided
- [ ] Consistency maintained
- [ ] Separation of concerns
- [ ] Dependency injection used

## Code Smells to Check
- Long methods (> 50 lines)
- Large classes (> 500 lines)
- Too many parameters (> 4)
- Duplicate code
- Dead code
- Complex conditionals