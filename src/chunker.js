#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { program } = require('commander');
const chalk = require('chalk');

class FileChunker {
  constructor(options = {}) {
    this.maxTokens = options.maxTokens || 4000;
    this.overlap = options.overlap || 200;
    this.chunkDir = options.chunkDir || path.join(__dirname, '..', 'chunks');
    this.preserveContext = options.preserveContext !== false;
  }

  async chunkFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const fileStats = await fs.stat(filePath);
      
      console.log(chalk.blue(`📁 Processing: ${path.basename(filePath)}`));
      console.log(chalk.gray(`   Size: ${(fileStats.size / 1024).toFixed(2)} KB`));

      const chunks = this.createChunks(content, filePath);
      
      await this.saveChunks(chunks, filePath);
      
      console.log(chalk.green(`✅ Created ${chunks.length} chunks`));
      return chunks;
    } catch (error) {
      console.error(chalk.red(`❌ Error chunking file: ${error.message}`));
      throw error;
    }
  }

  createChunks(content, filePath) {
    const extension = path.extname(filePath);
    const lines = content.split('\n');
    const chunks = [];
    let currentChunk = [];
    let currentTokens = 0;
    let chunkNumber = 1;

    // Smart chunking based on file type
    const breakpoints = this.findBreakpoints(content, extension);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineTokens = this.estimateTokens(line);
      
      if (currentTokens + lineTokens > this.maxTokens && currentChunk.length > 0) {
        // Save current chunk with overlap
        const overlapLines = this.getOverlapLines(currentChunk);
        chunks.push({
          number: chunkNumber++,
          content: currentChunk.join('\n'),
          startLine: i - currentChunk.length + 1,
          endLine: i,
          tokens: currentTokens,
          overlap: overlapLines
        });
        
        // Start new chunk with overlap
        currentChunk = overlapLines;
        currentTokens = this.estimateTokens(overlapLines.join('\n'));
      }
      
      currentChunk.push(line);
      currentTokens += lineTokens;
    }
    
    // Save final chunk
    if (currentChunk.length > 0) {
      chunks.push({
        number: chunkNumber,
        content: currentChunk.join('\n'),
        startLine: lines.length - currentChunk.length + 1,
        endLine: lines.length,
        tokens: currentTokens,
        overlap: []
      });
    }
    
    return chunks;
  }

  findBreakpoints(content, extension) {
    const breakpoints = [];
    
    // Language-specific breakpoint detection
    switch (extension) {
      case '.js':
      case '.jsx':
      case '.ts':
      case '.tsx':
        // Find function and class boundaries
        const functionRegex = /^(export\s+)?(async\s+)?function\s+\w+|^(export\s+)?const\s+\w+\s*=\s*(async\s*)?\(/gm;
        const classRegex = /^(export\s+)?class\s+\w+/gm;
        
        let match;
        while ((match = functionRegex.exec(content)) !== null) {
          breakpoints.push(match.index);
        }
        while ((match = classRegex.exec(content)) !== null) {
          breakpoints.push(match.index);
        }
        break;
        
      case '.py':
        // Find Python function and class definitions
        const pyFunctionRegex = /^def\s+\w+|^class\s+\w+/gm;
        let pyMatch;
        while ((pyMatch = pyFunctionRegex.exec(content)) !== null) {
          breakpoints.push(pyMatch.index);
        }
        break;
    }
    
    return breakpoints.sort((a, b) => a - b);
  }

  getOverlapLines(chunk) {
    const overlapTokens = this.overlap;
    const overlapLines = [];
    let tokens = 0;
    
    for (let i = chunk.length - 1; i >= 0 && tokens < overlapTokens; i--) {
      overlapLines.unshift(chunk[i]);
      tokens += this.estimateTokens(chunk[i]);
    }
    
    return overlapLines;
  }

  estimateTokens(text) {
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  async saveChunks(chunks, originalFilePath) {
    const fileName = path.basename(originalFilePath, path.extname(originalFilePath));
    const extension = path.extname(originalFilePath);
    const timestamp = Date.now();
    const chunkFolder = path.join(this.chunkDir, `${fileName}_${timestamp}`);
    
    await fs.ensureDir(chunkFolder);
    
    // Save metadata
    const metadata = {
      originalFile: originalFilePath,
      totalChunks: chunks.length,
      maxTokensPerChunk: this.maxTokens,
      overlap: this.overlap,
      timestamp: new Date().toISOString(),
      chunks: chunks.map(c => ({
        number: c.number,
        startLine: c.startLine,
        endLine: c.endLine,
        tokens: c.tokens
      }))
    };
    
    await fs.writeJson(path.join(chunkFolder, 'metadata.json'), metadata, { spaces: 2 });
    
    // Save individual chunks
    for (const chunk of chunks) {
      const chunkFileName = `chunk_${String(chunk.number).padStart(3, '0')}${extension}`;
      const chunkPath = path.join(chunkFolder, chunkFileName);
      
      const chunkHeader = `// Chunk ${chunk.number}/${chunks.length}
// Lines: ${chunk.startLine}-${chunk.endLine}
// Tokens: ~${chunk.tokens}
// Original: ${path.basename(originalFilePath)}
// -----------------------------------

`;
      
      await fs.writeFile(chunkPath, chunkHeader + chunk.content);
    }
    
    console.log(chalk.cyan(`📂 Chunks saved to: ${chunkFolder}`));
  }

  async processDirectory(dirPath, pattern = '**/*.{js,jsx,ts,tsx,py}') {
    const glob = require('glob');
    const files = glob.sync(pattern, { cwd: dirPath, absolute: true });
    
    console.log(chalk.blue(`Found ${files.length} files to process`));
    
    const results = [];
    for (const file of files) {
      try {
        const chunks = await this.chunkFile(file);
        results.push({ file, chunks: chunks.length, success: true });
      } catch (error) {
        results.push({ file, error: error.message, success: false });
      }
    }
    
    return results;
  }
}

// CLI Interface
program
  .name('chunker')
  .description('Split large code files into reviewable chunks')
  .version('1.0.0');

program
  .command('file <path>')
  .description('Chunk a single file')
  .option('-t, --tokens <number>', 'Max tokens per chunk', '4000')
  .option('-o, --overlap <number>', 'Overlap tokens between chunks', '200')
  .action(async (filePath, options) => {
    const chunker = new FileChunker({
      maxTokens: parseInt(options.tokens),
      overlap: parseInt(options.overlap)
    });
    
    try {
      await chunker.chunkFile(filePath);
    } catch (error) {
      process.exit(1);
    }
  });

program
  .command('dir <path>')
  .description('Chunk all files in a directory')
  .option('-p, --pattern <glob>', 'File pattern to match', '**/*.{js,jsx,ts,tsx,py}')
  .option('-t, --tokens <number>', 'Max tokens per chunk', '4000')
  .action(async (dirPath, options) => {
    const chunker = new FileChunker({
      maxTokens: parseInt(options.tokens)
    });
    
    const results = await chunker.processDirectory(dirPath, options.pattern);
    
    console.log('\n' + chalk.bold('Summary:'));
    console.log(chalk.green(`✅ Success: ${results.filter(r => r.success).length}`));
    console.log(chalk.red(`❌ Failed: ${results.filter(r => !r.success).length}`));
  });

program.parse();

module.exports = FileChunker;