# 📚 Claude Web Code Review - Usage Examples

## Quick Start Examples

### 1. Basic File Review
```bash
# Review a single JavaScript file
node src/review.js file ./components/Button.js

# Review with specific template
node src/review.js file ./api/auth.js --template security

# Review TypeScript file with performance focus
node src/review.js file ./services/data.ts --template performance
```

### 2. Chunking Large Files
```bash
# Chunk a large file (auto-detects when needed)
node src/chunker.js file ./dist/bundle.js

# Chunk with custom token limit
node src/chunker.js file ./lib/vendor.js --tokens 3000

# Chunk entire directory
node src/chunker.js dir ./src --pattern "**/*.js"
```

### 3. Batch Processing
```bash
# Review all JavaScript files in a directory
node src/review.js batch "src/**/*.js"

# Review with multiple templates
node src/review.js batch "**/*.tsx" --template react

# Review only changed files (git diff)
git diff --name-only | xargs -I {} node src/review.js file {}
```

## Real-World Scenarios

### Scenario 1: PR Review Automation
```yaml
# .github/workflows/review.yml
name: Automated Code Review
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install Claude Review
        run: |
          git clone https://github.com/yourusername/claude-web-code-review.git
          cd claude-web-code-review
          npm install
      
      - name: Review Changed Files
        run: |
          # Get changed files
          CHANGED_FILES=$(git diff --name-only origin/main...HEAD)
          
          # Review each file
          for file in $CHANGED_FILES; do
            if [[ $file == *.js || $file == *.ts || $file == *.jsx || $file == *.tsx ]]; then
              node claude-web-code-review/src/review.js file "$file" \
                --template best-practices \
                --output ./reviews
            fi
          done
      
      - name: Post Review Comments
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const reviews = fs.readdirSync('./reviews');
            
            for (const review of reviews) {
              const content = fs.readFileSync(`./reviews/${review}`, 'utf8');
              
              await github.rest.issues.createComment({
                issue_number: context.issue.number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                body: content
              });
            }
```

### Scenario 2: Security Audit Pipeline
```bash
#!/bin/bash
# security-audit.sh

echo "🔒 Starting Security Audit..."

# Clone the review tool
if [ ! -d "claude-web-code-review" ]; then
  git clone https://github.com/yourusername/claude-web-code-review.git
fi

cd claude-web-code-review
npm install

# Review all source files with security template
echo "Scanning for security vulnerabilities..."
node src/review.js batch "../src/**/*.{js,ts,jsx,tsx}" \
  --template security \
  --output ../security-report

# Check for critical issues
CRITICAL=$(grep -l '"severity":"critical"' ../security-report/*.json | wc -l)

if [ $CRITICAL -gt 0 ]; then
  echo "❌ Found $CRITICAL critical security issues!"
  echo "Review the reports in ./security-report/"
  exit 1
else
  echo "✅ No critical security issues found"
fi

# Generate consolidated report
node -e "
const fs = require('fs');
const reports = fs.readdirSync('../security-report')
  .filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync('../security-report/' + f)));

const summary = {
  totalFiles: reports.length,
  totalFindings: reports.reduce((sum, r) => sum + r.findings.length, 0),
  critical: reports.reduce((sum, r) => 
    sum + r.findings.filter(f => f.severity === 'critical').length, 0),
  high: reports.reduce((sum, r) => 
    sum + r.findings.filter(f => f.severity === 'high').length, 0)
};

console.log('Security Audit Summary:');
console.log(JSON.stringify(summary, null, 2));
"
```

### Scenario 3: Large Codebase Review
```javascript
// large-codebase-review.js
const { FileChunker } = require('./src/chunker');
const { CodeReviewer } = require('./src/review');
const fs = require('fs-extra');
const glob = require('glob');

async function reviewLargeCodebase(directory, options = {}) {
  const chunker = new FileChunker({
    maxTokens: 4000,
    overlap: 200
  });
  
  const reviewer = new CodeReviewer({
    template: options.template || 'best-practices'
  });
  
  // Find all code files
  const files = glob.sync('**/*.{js,ts,jsx,tsx,py}', {
    cwd: directory,
    ignore: ['node_modules/**', 'dist/**', 'build/**']
  });
  
  console.log(`Found ${files.length} files to review`);
  
  const results = {
    processed: 0,
    chunked: 0,
    findings: [],
    errors: []
  };
  
  for (const file of files) {
    try {
      const filePath = `${directory}/${file}`;
      const stats = await fs.stat(filePath);
      
      if (stats.size > 100000) {
        // Large file - needs chunking
        console.log(`Chunking large file: ${file}`);
        const chunks = await chunker.chunkFile(filePath);
        results.chunked++;
        
        for (const chunk of chunks) {
          const review = await reviewer.performReview(
            chunk.content,
            options.template,
            filePath,
            chunk.number
          );
          results.findings.push(...review.findings);
        }
      } else {
        // Small file - direct review
        const review = await reviewer.reviewFile(filePath, options);
        results.findings.push(...review.findings);
      }
      
      results.processed++;
      
      // Progress update
      if (results.processed % 10 === 0) {
        console.log(`Progress: ${results.processed}/${files.length} files`);
      }
      
    } catch (error) {
      results.errors.push({ file, error: error.message });
    }
  }
  
  // Generate summary report
  const report = {
    summary: {
      totalFiles: files.length,
      processed: results.processed,
      chunkedFiles: results.chunked,
      totalFindings: results.findings.length,
      errors: results.errors.length
    },
    findingsBySevert: {
      critical: results.findings.filter(f => f.severity === 'critical').length,
      high: results.findings.filter(f => f.severity === 'high').length,
      medium: results.findings.filter(f => f.severity === 'medium').length,
      low: results.findings.filter(f => f.severity === 'low').length
    },
    topIssues: results.findings
      .sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      })
      .slice(0, 10)
  };
  
  await fs.writeJson('./codebase-review-report.json', report, { spaces: 2 });
  console.log('Review complete! Report saved to codebase-review-report.json');
  
  return report;
}

// Run the review
reviewLargeCodebase('./my-project', {
  template: 'best-practices'
});
```

### Scenario 4: React Component Review
```bash
#!/bin/bash
# react-component-review.sh

# Review all React components
echo "🎨 Reviewing React Components..."

# Find all React component files
COMPONENTS=$(find ./src -name "*.jsx" -o -name "*.tsx" | grep -E "(components|pages)")

for component in $COMPONENTS; do
  echo "Reviewing: $component"
  
  # Run React-specific review
  node claude-web-code-review/src/review.js file "$component" \
    --template react \
    --output ./component-reviews
  
  # Extract component name
  COMPONENT_NAME=$(basename "$component" | cut -d. -f1)
  
  # Check for specific React issues
  node -e "
  const fs = require('fs');
  const review = JSON.parse(
    fs.readFileSync('./component-reviews/${COMPONENT_NAME}*.json')
  );
  
  // Check for common React anti-patterns
  const antiPatterns = [
    'Direct state mutation',
    'Missing key props',
    'useEffect without dependencies',
    'Inline function definitions'
  ];
  
  const found = review.findings.filter(f => 
    antiPatterns.some(pattern => f.message.includes(pattern))
  );
  
  if (found.length > 0) {
    console.log('⚠️  Found React anti-patterns:');
    found.forEach(f => console.log('  - Line ' + f.line + ': ' + f.message));
  } else {
    console.log('✅ No React anti-patterns detected');
  }
  "
done
```

### Scenario 5: Performance Profiling
```javascript
// performance-profiling.js
const { CodeReviewer } = require('./src/review');
const fs = require('fs-extra');

async function profilePerformance(filePath) {
  const reviewer = new CodeReviewer();
  const content = await fs.readFile(filePath, 'utf-8');
  
  // Custom performance patterns
  const performancePatterns = [
    {
      pattern: /for\s*\([^)]*\)\s*{[^}]*querySelector/,
      message: 'DOM query inside loop - cache outside loop',
      severity: 'high'
    },
    {
      pattern: /\.map\([^)]*\)\.filter\([^)]*\)\.map/,
      message: 'Multiple array iterations - combine operations',
      severity: 'medium'
    },
    {
      pattern: /JSON\.parse\(JSON\.stringify/,
      message: 'Inefficient deep clone - use structured clone',
      severity: 'medium'
    },
    {
      pattern: /await\s+.*await\s+.*await/,
      message: 'Sequential awaits - consider Promise.all',
      severity: 'medium'
    }
  ];
  
  const findings = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    performancePatterns.forEach(({ pattern, message, severity }) => {
      if (pattern.test(line)) {
        findings.push({
          line: index + 1,
          severity,
          message,
          code: line.trim(),
          type: 'performance'
        });
      }
    });
  });
  
  // Calculate performance score
  const score = Math.max(0, 100 - (findings.length * 5));
  
  const report = {
    file: filePath,
    performanceScore: score,
    findings,
    recommendations: generateRecommendations(findings)
  };
  
  console.log(`Performance Score: ${score}/100`);
  console.log(`Found ${findings.length} performance issues`);
  
  return report;
}

function generateRecommendations(findings) {
  const recommendations = [];
  
  if (findings.some(f => f.message.includes('DOM query'))) {
    recommendations.push('Consider caching DOM queries outside loops');
  }
  
  if (findings.some(f => f.message.includes('array iterations'))) {
    recommendations.push('Combine multiple array operations into single pass');
  }
  
  if (findings.some(f => f.message.includes('Sequential awaits'))) {
    recommendations.push('Use Promise.all() for parallel async operations');
  }
  
  return recommendations;
}

// Run performance profiling
profilePerformance('./src/services/dataProcessor.js')
  .then(report => fs.writeJson('./performance-report.json', report, { spaces: 2 }));
```

## Integration Examples

### VS Code Extension Integration
```javascript
// vscode-extension/extension.js
const vscode = require('vscode');
const { CodeReviewer } = require('claude-web-code-review');

function activate(context) {
  const reviewer = new CodeReviewer();
  
  // Register command
  const disposable = vscode.commands.registerCommand(
    'claude-review.reviewFile',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      
      const document = editor.document;
      const filePath = document.fileName;
      
      // Show progress
      vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Reviewing code with Claude...",
        cancellable: false
      }, async (progress) => {
        progress.report({ increment: 0 });
        
        // Review the file
        const review = await reviewer.reviewFile(filePath);
        
        progress.report({ increment: 50 });
        
        // Create diagnostics
        const diagnostics = [];
        
        review.findings.forEach(finding => {
          const line = finding.line - 1;
          const range = new vscode.Range(
            line, 0,
            line, document.lineAt(line).text.length
          );
          
          const severity = finding.severity === 'critical' 
            ? vscode.DiagnosticSeverity.Error
            : finding.severity === 'high'
            ? vscode.DiagnosticSeverity.Warning
            : vscode.DiagnosticSeverity.Information;
          
          diagnostics.push(new vscode.Diagnostic(
            range,
            finding.message,
            severity
          ));
        });
        
        // Set diagnostics
        const diagnosticCollection = vscode.languages.createDiagnosticCollection('claude-review');
        diagnosticCollection.set(document.uri, diagnostics);
        
        progress.report({ increment: 100 });
        
        vscode.window.showInformationMessage(
          `Review complete: ${review.findings.length} issues found`
        );
      });
    }
  );
  
  context.subscriptions.push(disposable);
}

module.exports = { activate };
```

### Pre-commit Hook
```bash
#!/bin/bash
# .git/hooks/pre-commit

# Claude Code Review Pre-commit Hook
echo "Running Claude Code Review..."

# Get staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|ts|jsx|tsx)$')

if [ -z "$STAGED_FILES" ]; then
  exit 0
fi

# Review each staged file
CRITICAL_ISSUES=0

for FILE in $STAGED_FILES; do
  echo "Reviewing $FILE..."
  
  # Run review
  OUTPUT=$(node claude-web-code-review/src/review.js file "$FILE" --template security 2>&1)
  
  # Check for critical issues
  if echo "$OUTPUT" | grep -q '"severity":"critical"'; then
    echo "❌ Critical issue found in $FILE"
    CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))
  fi
done

if [ $CRITICAL_ISSUES -gt 0 ]; then
  echo "❌ Commit blocked: $CRITICAL_ISSUES critical issues found"
  echo "Run 'npm run review' to see detailed report"
  exit 1
fi

echo "✅ Code review passed"
exit 0
```

### Docker Integration
```dockerfile
# Dockerfile for review service
FROM node:18-alpine

WORKDIR /app

# Copy review tool
COPY claude-web-code-review/ ./claude-web-code-review/

# Install dependencies
RUN cd claude-web-code-review && npm install

# Copy project to review
COPY . ./project

# Run review
CMD ["node", "claude-web-code-review/src/review.js", "batch", "project/**/*.js"]
```

### CI/CD Pipeline Integration
```yaml
# Jenkins Pipeline
pipeline {
  agent any
  
  stages {
    stage('Code Review') {
      steps {
        script {
          // Clone review tool
          sh 'git clone https://github.com/yourusername/claude-web-code-review.git'
          
          // Install dependencies
          sh 'cd claude-web-code-review && npm install'
          
          // Run review
          def reviewOutput = sh(
            script: 'node claude-web-code-review/src/review.js batch "src/**/*.js"',
            returnStdout: true
          )
          
          // Parse results
          def criticalIssues = sh(
            script: 'grep -c "critical" reviews/*.json || true',
            returnStdout: true
          ).trim().toInteger()
          
          if (criticalIssues > 0) {
            error("Found ${criticalIssues} critical issues")
          }
        }
      }
    }
  }
  
  post {
    always {
      // Archive review reports
      archiveArtifacts artifacts: 'reviews/**/*', allowEmptyArchive: true
      
      // Publish HTML report
      publishHTML([
        reportDir: 'reviews',
        reportFiles: '*.html',
        reportName: 'Code Review Report'
      ])
    }
  }
}
```

---

*These examples demonstrate various ways to integrate and use the Claude Web Code Review system in real-world scenarios.*