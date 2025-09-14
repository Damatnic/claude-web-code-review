# 🤖 Claude Web Code Review System

> A memory-efficient code review system optimized for Claude AI's context limits

## 📋 Features

- **Chunked File Processing**: Automatically splits large files into reviewable chunks
- **Modular Review Templates**: Focused review patterns for different code types
- **Memory-Optimized**: Designed to work within Claude's token limits
- **GitHub Integration**: Automated workflows for PR reviews
- **Progressive Review**: Reviews code in manageable sections

## 🚀 Quick Start

### 1. Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/claude-web-code-review.git
cd claude-web-code-review

# Install dependencies
npm install

# Configure settings
cp config/settings.example.json config/settings.json
```

### 2. Submit Code for Review
```bash
# For single file review
./scripts/review.sh path/to/your/file.js

# For directory review
./scripts/review-dir.sh path/to/your/project

# For large file (auto-chunks)
./scripts/review-large.sh path/to/large/file.js
```

## 📁 Project Structure

```
claude-web-code-review/
├── chunks/           # Temporary storage for file chunks
├── config/          # Configuration files
├── docs/            # Documentation
├── reviews/         # Completed reviews
├── scripts/         # Automation scripts
├── src/             # Source code
└── templates/       # Review templates
```

## 🔧 Configuration

### Memory Limits
Edit `config/settings.json`:
```json
{
  "maxTokensPerChunk": 4000,
  "maxFileSizeKB": 100,
  "chunkOverlap": 200,
  "reviewBatchSize": 5
}
```

## 📝 Review Templates

### Available Templates
- `security.md` - Security vulnerability checks
- `performance.md` - Performance optimization review
- `best-practices.md` - Code quality and best practices
- `accessibility.md` - Web accessibility review
- `react.md` - React-specific patterns
- `api.md` - API design review

## 🔄 Workflow

1. **File Submission** → Code is submitted for review
2. **Chunking** → Large files are split into manageable chunks
3. **Template Selection** → Appropriate review template is chosen
4. **Review Process** → Each chunk is reviewed independently
5. **Report Generation** → Results are compiled into a final report

## 💡 Usage Examples

### Basic Review
```bash
# Review a React component
./scripts/review.sh --template react components/Button.jsx

# Review with security focus
./scripts/review.sh --template security api/auth.js
```

### Batch Review
```bash
# Review multiple files
./scripts/batch-review.sh src/**/*.js
```

### Custom Review
```bash
# Use custom template
./scripts/review.sh --template custom --template-file my-template.md code.js
```

## 🎯 Best Practices

1. **Keep files under 100KB** for optimal performance
2. **Use specific templates** for targeted reviews
3. **Review in batches** for large projects
4. **Clear chunks** directory regularly
5. **Archive completed reviews** for reference

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your templates or improvements
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🔗 Links

- [Documentation](./docs/README.md)
- [Templates Guide](./templates/README.md)
- [API Reference](./docs/api.md)
- [Examples](./docs/examples.md)

---

**Note**: This system is designed to work within Claude's context window limitations. For very large codebases, consider reviewing modules separately.