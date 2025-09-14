# ⚙️ Claude Web Code Review - Complete Configuration Guide

## Table of Contents
1. [Quick Start Configuration](#quick-start-configuration)
2. [Environment Variables](#environment-variables)
3. [Configuration Files](#configuration-files)
4. [Template Customization](#template-customization)
5. [Performance Tuning](#performance-tuning)
6. [Integration Settings](#integration-settings)
7. [Advanced Options](#advanced-options)

## Quick Start Configuration

### Minimal Setup
```json
{
  "review": {
    "defaultTemplate": "best-practices",
    "outputFormat": "markdown"
  },
  "memory": {
    "maxTokensPerChunk": 4000
  }
}
```

### Recommended Setup
```json
{
  "project": {
    "name": "My Project",
    "type": "javascript",
    "framework": "react"
  },
  "review": {
    "defaultTemplate": "best-practices",
    "outputFormat": "markdown",
    "includeMetrics": true,
    "autoFix": false
  },
  "memory": {
    "maxTokensPerChunk": 4000,
    "chunkOverlap": 200,
    "reviewBatchSize": 5
  },
  "cache": {
    "enabled": true,
    "ttl": 900
  }
}
```

## Environment Variables

### Core Variables
```bash
# Required
CLAUDE_API_KEY=your-api-key-here
CLAUDE_MODEL=claude-2.1

# Optional
CLAUDE_MAX_TOKENS=100000
CLAUDE_TEMPERATURE=0.3
CLAUDE_TIMEOUT=30000

# Performance
REVIEW_CONCURRENCY=5
CHUNK_PARALLEL_LIMIT=3
CACHE_ENABLED=true
CACHE_TTL=900

# Output
OUTPUT_DIR=./reviews
OUTPUT_FORMAT=markdown
VERBOSE=false

# GitHub Integration
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
GITHUB_OWNER=yourusername
GITHUB_REPO=yourrepo
GITHUB_AUTO_COMMENT=true

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
LOG_LEVEL=info
LOG_FILE=./logs/review.log
```

### Loading Environment Variables
```javascript
// .env file
CLAUDE_API_KEY=sk-ant-xxxxx
GITHUB_TOKEN=ghp_xxxxx
OUTPUT_DIR=./reports
LOG_LEVEL=debug

// Load in application
require('dotenv').config();

const config = {
  api: {
    key: process.env.CLAUDE_API_KEY,
    model: process.env.CLAUDE_MODEL || 'claude-2.1'
  },
  github: {
    token: process.env.GITHUB_TOKEN,
    autoComment: process.env.GITHUB_AUTO_COMMENT === 'true'
  }
};
```

## Configuration Files

### Main Configuration (`config/settings.json`)
```json
{
  "project": {
    "name": "Enterprise Application",
    "version": "2.0.0",
    "type": "fullstack",
    "languages": ["javascript", "typescript", "python"],
    "frameworks": ["react", "express", "django"]
  },
  
  "memory": {
    "maxTokensPerChunk": 4000,
    "maxFileSizeKB": 100,
    "chunkOverlap": 200,
    "reviewBatchSize": 5,
    "maxContextTokens": 100000,
    "reservedTokens": 10000,
    "compressionEnabled": true
  },
  
  "chunking": {
    "strategy": "smart",
    "preserveContext": true,
    "splitOnFunctions": true,
    "splitOnClasses": true,
    "minChunkSize": 500,
    "maxChunkSize": 4000,
    "semanticBoundaries": true,
    "syntaxAware": true
  },
  
  "review": {
    "defaultTemplate": "comprehensive",
    "outputFormat": "markdown",
    "includeMetrics": true,
    "includeSuggestions": true,
    "includeCodeSnippets": true,
    "severityLevels": ["critical", "high", "medium", "low", "info"],
    "autoFix": false,
    "generatePatch": true,
    "contextLines": 3
  },
  
  "fileTypes": {
    "javascript": {
      "extensions": [".js", ".jsx", ".mjs"],
      "template": "javascript",
      "chunkStrategy": "function-based",
      "parser": "espree",
      "linter": "eslint"
    },
    "typescript": {
      "extensions": [".ts", ".tsx", ".d.ts"],
      "template": "typescript",
      "chunkStrategy": "function-based",
      "parser": "typescript",
      "linter": "tslint"
    },
    "python": {
      "extensions": [".py", ".pyw"],
      "template": "python",
      "chunkStrategy": "class-based",
      "parser": "ast",
      "linter": "pylint"
    },
    "react": {
      "extensions": [".jsx", ".tsx"],
      "template": "react",
      "chunkStrategy": "component-based",
      "parser": "babel",
      "additionalChecks": ["hooks", "props", "state"]
    }
  },
  
  "templates": {
    "searchPaths": [
      "./templates",
      "./custom-templates",
      "~/.claude-review/templates"
    ],
    "customTemplates": {
      "security-strict": "./templates/custom/security-strict.md",
      "performance-web": "./templates/custom/performance-web.md"
    }
  },
  
  "github": {
    "enabled": true,
    "autoReview": true,
    "commentOnPR": true,
    "createIssues": false,
    "labelReviews": true,
    "labels": {
      "critical": "security-critical",
      "high": "bug",
      "medium": "enhancement",
      "low": "good first issue"
    },
    "assignees": ["lead-developer"],
    "reviewers": ["code-review-team"]
  },
  
  "cache": {
    "enabled": true,
    "type": "hybrid",
    "memory": {
      "maxSize": 100,
      "ttl": 300
    },
    "disk": {
      "path": "./.cache",
      "maxSize": 1000,
      "ttl": 3600
    },
    "redis": {
      "url": "redis://localhost:6379",
      "ttl": 900,
      "prefix": "claude-review:"
    }
  },
  
  "performance": {
    "parallelProcessing": true,
    "maxConcurrency": 5,
    "queueSize": 100,
    "timeout": 30000,
    "retryAttempts": 3,
    "retryDelay": 1000,
    "circuitBreaker": {
      "enabled": true,
      "threshold": 5,
      "timeout": 60000
    }
  },
  
  "monitoring": {
    "enabled": true,
    "metrics": {
      "enabled": true,
      "port": 9090,
      "path": "/metrics"
    },
    "logging": {
      "level": "info",
      "format": "json",
      "outputs": ["console", "file"],
      "file": {
        "path": "./logs/review.log",
        "maxSize": "10MB",
        "maxFiles": 5
      }
    },
    "tracing": {
      "enabled": false,
      "service": "claude-review",
      "endpoint": "http://localhost:14268/api/traces"
    }
  },
  
  "security": {
    "sanitizeInput": true,
    "maxFileSize": 10485760,
    "allowedExtensions": [
      ".js", ".jsx", ".ts", ".tsx", ".py", ".java", ".go", ".rs"
    ],
    "blockedPatterns": [
      "*.min.js",
      "*.bundle.js",
      "vendor/*"
    ],
    "scanForSecrets": true,
    "secretPatterns": [
      "api[_-]?key",
      "secret",
      "password",
      "token",
      "private[_-]?key"
    ]
  },
  
  "notifications": {
    "enabled": false,
    "channels": {
      "slack": {
        "enabled": false,
        "webhook": "https://hooks.slack.com/services/xxx",
        "channel": "#code-reviews",
        "mentions": {
          "critical": "@channel",
          "high": "@dev-team"
        }
      },
      "email": {
        "enabled": false,
        "smtp": {
          "host": "smtp.gmail.com",
          "port": 587,
          "secure": false,
          "auth": {
            "user": "your-email@gmail.com",
            "pass": "your-app-password"
          }
        },
        "recipients": ["team@example.com"],
        "onlyOnFailure": false
      },
      "webhook": {
        "enabled": false,
        "url": "https://your-webhook-endpoint.com",
        "method": "POST",
        "headers": {
          "Authorization": "Bearer token"
        }
      }
    }
  },
  
  "reporting": {
    "generateSummary": true,
    "formats": ["markdown", "json", "html", "pdf"],
    "includeCharts": true,
    "templatePath": "./report-templates",
    "outputPath": "./reports",
    "archiveOldReports": true,
    "archivePath": "./archive",
    "retentionDays": 30
  },
  
  "plugins": {
    "enabled": true,
    "searchPaths": ["./plugins", "~/.claude-review/plugins"],
    "loaded": [
      "eslint-integration",
      "prettier-formatter",
      "sonarqube-reporter"
    ]
  },
  
  "experimental": {
    "aiModelFallback": true,
    "fallbackModels": ["gpt-4", "gpt-3.5-turbo"],
    "adaptiveChunking": true,
    "semanticSearch": false,
    "autoLearn": false,
    "customParsers": false
  }
}
```

### File Type Configuration
```json
{
  "customFileTypes": {
    "vue": {
      "extensions": [".vue"],
      "template": "vue",
      "parser": "vue-parser",
      "chunkStrategy": "component-based",
      "sections": ["template", "script", "style"]
    },
    "rust": {
      "extensions": [".rs"],
      "template": "rust",
      "parser": "syn",
      "chunkStrategy": "module-based",
      "additionalChecks": ["ownership", "lifetimes"]
    },
    "graphql": {
      "extensions": [".graphql", ".gql"],
      "template": "api",
      "parser": "graphql",
      "chunkStrategy": "schema-based"
    }
  }
}
```

## Template Customization

### Creating Custom Templates
```markdown
<!-- templates/custom/my-template.md -->
# Custom Review Template

## Metadata
- name: my-custom-template
- version: 1.0.0
- author: Your Name
- severity_levels: [blocker, critical, major, minor, info]

## Review Patterns

### Pattern: Async/Await Best Practices
```yaml
- pattern: "async.*await.*forEach"
  message: "forEach doesn't work with async/await. Use for...of instead"
  severity: major
  category: async
```

### Pattern: Memory Leaks
```yaml
- pattern: "addEventListener(?!.*removeEventListener)"
  message: "Event listener without cleanup may cause memory leak"
  severity: major
  category: memory
```

## Checklist
- [ ] All async functions have proper error handling
- [ ] No memory leaks from event listeners
- [ ] Promises are not nested unnecessarily
- [ ] No blocking operations in async functions

## Scoring
- Weight: async_errors = 10
- Weight: memory_leaks = 8
- Weight: code_style = 2
```

### Registering Custom Templates
```javascript
// config/templates.js
module.exports = {
  templates: {
    'my-custom': require('./templates/custom/my-template.md'),
    'security-strict': require('./templates/custom/security-strict.md'),
    'performance-critical': require('./templates/custom/performance-critical.md')
  },
  
  templateMappings: {
    '*.critical.js': 'performance-critical',
    '*/auth/*': 'security-strict',
    '*/api/*': 'api'
  }
};
```

## Performance Tuning

### Memory Optimization
```json
{
  "performance": {
    "memory": {
      "heapSize": 2048,
      "gcInterval": 100,
      "clearCacheOnLowMemory": true,
      "compressionLevel": 6
    },
    "chunking": {
      "adaptiveSize": true,
      "minEfficiency": 0.7,
      "maxRetries": 3
    }
  }
}
```

### Concurrency Settings
```json
{
  "concurrency": {
    "fileProcessing": 5,
    "chunkProcessing": 10,
    "reviewGeneration": 3,
    "ioOperations": 20,
    "apiCalls": 5
  }
}
```

## Integration Settings

### CI/CD Integration
```yaml
# .claude-review.yml
version: 1
ci:
  provider: github-actions
  triggers:
    - pull_request
    - push:main
  
  settings:
    fail_on_critical: true
    comment_on_pr: true
    create_check_run: true
    
  thresholds:
    max_critical: 0
    max_high: 5
    max_medium: 20
    min_score: 80
```

### IDE Integration
```json
{
  "ide": {
    "vscode": {
      "enabled": true,
      "realtime": false,
      "showInlineHints": true,
      "severityMapping": {
        "critical": "error",
        "high": "warning",
        "medium": "information",
        "low": "hint"
      }
    },
    "intellij": {
      "enabled": false,
      "pluginPath": "./plugins/intellij"
    }
  }
}
```

## Advanced Options

### Custom Parsers
```javascript
// config/parsers.js
module.exports = {
  parsers: {
    'custom-lang': {
      parse: (content) => {
        // Custom parsing logic
        return AST;
      },
      chunk: (ast, maxTokens) => {
        // Custom chunking logic
        return chunks;
      }
    }
  }
};
```

### Rule Engine Configuration
```json
{
  "rules": {
    "engine": "json-rules-engine",
    "rulesPath": "./rules",
    "customRules": [
      {
        "name": "no-console-in-production",
        "conditions": {
          "all": [
            {
              "fact": "environment",
              "operator": "equal",
              "value": "production"
            },
            {
              "fact": "hasConsoleLog",
              "operator": "equal",
              "value": true
            }
          ]
        },
        "event": {
          "type": "violation",
          "params": {
            "message": "Console.log found in production code",
            "severity": "high"
          }
        }
      }
    ]
  }
}
```

### Webhook Configuration
```json
{
  "webhooks": {
    "onReviewComplete": {
      "url": "https://api.example.com/webhook/review",
      "method": "POST",
      "headers": {
        "X-API-Key": "${WEBHOOK_API_KEY}",
        "Content-Type": "application/json"
      },
      "body": {
        "project": "${PROJECT_NAME}",
        "timestamp": "${TIMESTAMP}",
        "findings": "${FINDINGS}",
        "score": "${SCORE}"
      },
      "retry": {
        "attempts": 3,
        "delay": 1000
      }
    }
  }
}
```

## Configuration Validation

### Schema Validation
```javascript
// config/validate.js
const Joi = require('joi');

const configSchema = Joi.object({
  project: Joi.object({
    name: Joi.string().required(),
    type: Joi.string().valid('frontend', 'backend', 'fullstack')
  }).required(),
  
  memory: Joi.object({
    maxTokensPerChunk: Joi.number().min(1000).max(10000),
    chunkOverlap: Joi.number().min(0).max(1000)
  }),
  
  review: Joi.object({
    defaultTemplate: Joi.string(),
    outputFormat: Joi.string().valid('markdown', 'json', 'html')
  })
});

function validateConfig(config) {
  const { error, value } = configSchema.validate(config);
  
  if (error) {
    throw new Error(`Invalid configuration: ${error.message}`);
  }
  
  return value;
}
```

### Configuration Testing
```javascript
// test/config.test.js
describe('Configuration', () => {
  it('should load default configuration', () => {
    const config = require('../config/settings.json');
    expect(config).toBeDefined();
    expect(config.memory.maxTokensPerChunk).toBe(4000);
  });
  
  it('should override with environment variables', () => {
    process.env.MAX_TOKENS = '5000';
    const config = loadConfig();
    expect(config.memory.maxTokensPerChunk).toBe(5000);
  });
  
  it('should validate configuration schema', () => {
    const invalidConfig = { project: {} };
    expect(() => validateConfig(invalidConfig)).toThrow();
  });
});
```

---

*This configuration guide provides comprehensive options for customizing the Claude Web Code Review system to meet specific project needs.*