#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { program } = require('commander');
const chalk = require('chalk');
const marked = require('marked');

class CodeReviewer {
  constructor(options = {}) {
    this.configPath = options.config || path.join(__dirname, '..', 'config', 'settings.json');
    this.templatesDir = options.templatesDir || path.join(__dirname, '..', 'templates');
    this.reviewsDir = options.reviewsDir || path.join(__dirname, '..', 'reviews');
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      return fs.readJsonSync(this.configPath);
    } catch (error) {
      console.warn(chalk.yellow('⚠️ Using default configuration'));
      return {
        memory: { maxTokensPerChunk: 4000 },
        review: { defaultTemplate: 'best-practices' }
      };
    }
  }

  async reviewFile(filePath, options = {}) {
    console.log(chalk.blue(`🔍 Starting review of: ${path.basename(filePath)}`));
    
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const fileExtension = path.extname(filePath);
    const template = options.template || this.selectTemplate(fileExtension);
    
    // Check if file needs chunking
    const estimatedTokens = this.estimateTokens(fileContent);
    if (estimatedTokens > this.config.memory.maxTokensPerChunk) {
      console.log(chalk.yellow(`⚡ File requires chunking (${estimatedTokens} tokens)`));
      return this.reviewChunkedFile(filePath, template);
    }
    
    // Review single file
    const review = await this.performReview(fileContent, template, filePath);
    await this.saveReview(review, filePath);
    
    return review;
  }

  async reviewChunkedFile(filePath, template) {
    const FileChunker = require('./chunker');
    const chunker = new FileChunker(this.config.memory);
    
    const chunks = await chunker.chunkFile(filePath);
    const reviews = [];
    
    console.log(chalk.cyan(`📊 Reviewing ${chunks.length} chunks...`));
    
    for (const chunk of chunks) {
      const chunkReview = await this.performReview(chunk.content, template, filePath, chunk.number);
      reviews.push(chunkReview);
      
      console.log(chalk.gray(`   ✓ Chunk ${chunk.number}/${chunks.length} reviewed`));
    }
    
    // Combine chunk reviews
    const combinedReview = this.combineReviews(reviews, filePath);
    await this.saveReview(combinedReview, filePath);
    
    return combinedReview;
  }

  async performReview(content, templateName, filePath, chunkNumber = null) {
    const template = await this.loadTemplate(templateName);
    
    const review = {
      file: path.basename(filePath),
      fullPath: filePath,
      template: templateName,
      timestamp: new Date().toISOString(),
      chunkNumber: chunkNumber,
      findings: [],
      metrics: {},
      summary: ''
    };
    
    // Analyze code based on template criteria
    review.findings = this.analyzeCode(content, template);
    review.metrics = this.calculateMetrics(content);
    review.summary = this.generateSummary(review.findings);
    
    return review;
  }

  analyzeCode(content, template) {
    const findings = [];
    const lines = content.split('\n');
    
    // Example analysis patterns (would be more sophisticated in production)
    const patterns = {
      security: [
        { regex: /eval\s*\(/, severity: 'critical', message: 'Avoid using eval() - security risk' },
        { regex: /innerHTML\s*=/, severity: 'high', message: 'Direct innerHTML assignment - XSS risk' },
        { regex: /password\s*=\s*['"]/, severity: 'critical', message: 'Hardcoded password detected' }
      ],
      performance: [
        { regex: /for\s*\(.*in\s+/, severity: 'medium', message: 'for...in loop can be slow' },
        { regex: /document\.querySelector.*inside.*loop/, severity: 'high', message: 'DOM query inside loop' }
      ],
      bestPractices: [
        { regex: /console\.(log|error|warn)/, severity: 'low', message: 'Remove console statements' },
        { regex: /var\s+\w+\s*=/, severity: 'info', message: 'Use const/let instead of var' },
        { regex: /function\s+\w+\s*\([^)]{40,}/, severity: 'medium', message: 'Too many parameters' }
      ]
    };
    
    const activePatterns = patterns[template.toLowerCase()] || patterns.bestPractices;
    
    lines.forEach((line, index) => {
      activePatterns.forEach(pattern => {
        if (pattern.regex.test(line)) {
          findings.push({
            line: index + 1,
            severity: pattern.severity,
            message: pattern.message,
            code: line.trim()
          });
        }
      });
    });
    
    return findings;
  }

  calculateMetrics(content) {
    const lines = content.split('\n');
    const nonEmptyLines = lines.filter(l => l.trim().length > 0);
    
    return {
      totalLines: lines.length,
      codeLines: nonEmptyLines.length,
      commentLines: lines.filter(l => l.trim().startsWith('//') || l.trim().startsWith('#')).length,
      complexity: this.estimateComplexity(content),
      tokens: this.estimateTokens(content)
    };
  }

  estimateComplexity(content) {
    // Simplified cyclomatic complexity estimation
    const complexityIndicators = [
      /if\s*\(/g,
      /else\s*{/g,
      /for\s*\(/g,
      /while\s*\(/g,
      /case\s+/g,
      /catch\s*\(/g
    ];
    
    let complexity = 1;
    complexityIndicators.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) complexity += matches.length;
    });
    
    return complexity;
  }

  estimateTokens(text) {
    return Math.ceil(text.length / 4);
  }

  generateSummary(findings) {
    const severityCounts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0
    };
    
    findings.forEach(f => {
      severityCounts[f.severity]++;
    });
    
    const parts = [];
    if (severityCounts.critical > 0) {
      parts.push(`${severityCounts.critical} critical issues`);
    }
    if (severityCounts.high > 0) {
      parts.push(`${severityCounts.high} high priority issues`);
    }
    if (severityCounts.medium > 0) {
      parts.push(`${severityCounts.medium} medium priority issues`);
    }
    
    return parts.length > 0 
      ? `Found ${parts.join(', ')}. Immediate attention required.`
      : 'No significant issues found. Code meets quality standards.';
  }

  combineReviews(reviews, filePath) {
    const combined = {
      file: path.basename(filePath),
      fullPath: filePath,
      timestamp: new Date().toISOString(),
      totalChunks: reviews.length,
      findings: [],
      metrics: {
        totalLines: 0,
        codeLines: 0,
        commentLines: 0,
        complexity: 0,
        tokens: 0
      },
      summary: ''
    };
    
    // Merge findings from all chunks
    reviews.forEach((review, index) => {
      review.findings.forEach(finding => {
        combined.findings.push({
          ...finding,
          chunk: index + 1
        });
      });
      
      // Aggregate metrics
      Object.keys(combined.metrics).forEach(key => {
        combined.metrics[key] += review.metrics[key] || 0;
      });
    });
    
    combined.summary = this.generateSummary(combined.findings);
    
    return combined;
  }

  async saveReview(review, originalFilePath) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = path.basename(originalFilePath, path.extname(originalFilePath));
    const reviewFileName = `${fileName}_${timestamp}.json`;
    const reviewPath = path.join(this.reviewsDir, reviewFileName);
    
    await fs.ensureDir(this.reviewsDir);
    await fs.writeJson(reviewPath, review, { spaces: 2 });
    
    // Also generate markdown report
    const markdownReport = this.generateMarkdownReport(review);
    const mdPath = path.join(this.reviewsDir, `${fileName}_${timestamp}.md`);
    await fs.writeFile(mdPath, markdownReport);
    
    console.log(chalk.green(`✅ Review saved to: ${reviewPath}`));
    console.log(chalk.green(`📄 Report saved to: ${mdPath}`));
    
    return reviewPath;
  }

  generateMarkdownReport(review) {
    let report = `# Code Review Report\n\n`;
    report += `**File:** ${review.file}\n`;
    report += `**Date:** ${new Date(review.timestamp).toLocaleString()}\n`;
    report += `**Template:** ${review.template || 'default'}\n\n`;
    
    report += `## Summary\n${review.summary}\n\n`;
    
    report += `## Metrics\n`;
    report += `- Total Lines: ${review.metrics.totalLines}\n`;
    report += `- Code Lines: ${review.metrics.codeLines}\n`;
    report += `- Comment Lines: ${review.metrics.commentLines}\n`;
    report += `- Complexity: ${review.metrics.complexity}\n`;
    report += `- Estimated Tokens: ${review.metrics.tokens}\n\n`;
    
    if (review.findings.length > 0) {
      report += `## Findings\n\n`;
      
      const findingsBySeverity = {};
      review.findings.forEach(f => {
        if (!findingsBySeverity[f.severity]) {
          findingsBySeverity[f.severity] = [];
        }
        findingsBySeverity[f.severity].push(f);
      });
      
      ['critical', 'high', 'medium', 'low', 'info'].forEach(severity => {
        if (findingsBySeverity[severity]) {
          report += `### ${severity.toUpperCase()}\n\n`;
          findingsBySeverity[severity].forEach(finding => {
            report += `- **Line ${finding.line}**: ${finding.message}\n`;
            report += `  \`\`\`\n  ${finding.code}\n  \`\`\`\n`;
          });
          report += '\n';
        }
      });
    } else {
      report += `## Findings\nNo issues detected.\n\n`;
    }
    
    return report;
  }

  selectTemplate(fileExtension) {
    const fileTypeConfig = Object.values(this.config.fileTypes || {})
      .find(ft => ft.extensions.includes(fileExtension));
    
    return fileTypeConfig?.template || this.config.review?.defaultTemplate || 'best-practices';
  }

  async loadTemplate(templateName) {
    const templatePath = path.join(this.templatesDir, `${templateName}.md`);
    
    try {
      const content = await fs.readFile(templatePath, 'utf-8');
      return templateName;
    } catch (error) {
      console.warn(chalk.yellow(`Template ${templateName} not found, using default`));
      return 'best-practices';
    }
  }
}

// CLI Interface
program
  .name('review')
  .description('AI-powered code review system')
  .version('1.0.0');

program
  .command('file <path>')
  .description('Review a single file')
  .option('-t, --template <name>', 'Review template to use')
  .option('-o, --output <dir>', 'Output directory for reviews')
  .action(async (filePath, options) => {
    const reviewer = new CodeReviewer({
      reviewsDir: options.output
    });
    
    try {
      await reviewer.reviewFile(filePath, {
        template: options.template
      });
    } catch (error) {
      console.error(chalk.red(`❌ Review failed: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('batch <pattern>')
  .description('Review multiple files matching a pattern')
  .option('-t, --template <name>', 'Review template to use')
  .action(async (pattern, options) => {
    const glob = require('glob');
    const files = glob.sync(pattern);
    
    if (files.length === 0) {
      console.error(chalk.red('No files found matching pattern'));
      process.exit(1);
    }
    
    const reviewer = new CodeReviewer();
    
    console.log(chalk.blue(`📋 Reviewing ${files.length} files...`));
    
    for (const file of files) {
      try {
        await reviewer.reviewFile(file, {
          template: options.template
        });
      } catch (error) {
        console.error(chalk.red(`Failed to review ${file}: ${error.message}`));
      }
    }
  });

program.parse();

module.exports = CodeReviewer;