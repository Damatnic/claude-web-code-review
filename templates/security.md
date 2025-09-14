# Security Review Template

## Review Focus
- Authentication & Authorization vulnerabilities
- Input validation and sanitization
- SQL injection risks
- XSS vulnerabilities
- CSRF protection
- Sensitive data exposure
- Security headers
- Dependency vulnerabilities

## Checklist

### Authentication
- [ ] Passwords properly hashed (bcrypt/argon2)
- [ ] Session management secure
- [ ] JWT tokens properly validated
- [ ] Rate limiting on auth endpoints
- [ ] Account lockout mechanisms

### Input Validation
- [ ] All user inputs validated
- [ ] SQL queries parameterized
- [ ] File uploads restricted
- [ ] Path traversal prevention
- [ ] Command injection prevention

### Data Protection
- [ ] Sensitive data encrypted at rest
- [ ] HTTPS enforced
- [ ] Secrets not hardcoded
- [ ] PII properly handled
- [ ] CORS configured correctly

### Security Headers
- [ ] Content-Security-Policy
- [ ] X-Frame-Options
- [ ] X-Content-Type-Options
- [ ] Strict-Transport-Security
- [ ] X-XSS-Protection

## Severity Levels
- **Critical**: Immediate security risk
- **High**: Significant vulnerability
- **Medium**: Potential security issue
- **Low**: Best practice violation
- **Info**: Security improvement suggestion