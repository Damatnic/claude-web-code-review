#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

const DIRECTORIES_TO_CLEAN = [
  'chunks',
  'reviews',
  '.tmp'
];

const FILE_PATTERNS_TO_CLEAN = [
  '*.tmp',
  '*.temp',
  '*.cache'
];

async function clean() {
  console.log(chalk.blue('🧹 Cleaning temporary files and directories...'));
  
  let cleanedCount = 0;
  
  // Clean directories
  for (const dir of DIRECTORIES_TO_CLEAN) {
    const dirPath = path.join(__dirname, '..', dir);
    
    if (await fs.pathExists(dirPath)) {
      try {
        const files = await fs.readdir(dirPath);
        
        if (files.length > 0) {
          console.log(chalk.yellow(`  Cleaning ${dir}/ (${files.length} items)`));
          await fs.emptyDir(dirPath);
          cleanedCount += files.length;
        }
      } catch (error) {
        console.error(chalk.red(`  Error cleaning ${dir}: ${error.message}`));
      }
    }
  }
  
  // Clean file patterns
  const glob = require('glob');
  
  for (const pattern of FILE_PATTERNS_TO_CLEAN) {
    const files = glob.sync(pattern, { 
      cwd: path.join(__dirname, '..'),
      absolute: true 
    });
    
    for (const file of files) {
      try {
        await fs.remove(file);
        console.log(chalk.gray(`  Removed: ${path.basename(file)}`));
        cleanedCount++;
      } catch (error) {
        console.error(chalk.red(`  Error removing ${file}: ${error.message}`));
      }
    }
  }
  
  if (cleanedCount > 0) {
    console.log(chalk.green(`✅ Cleaned ${cleanedCount} items`));
  } else {
    console.log(chalk.gray('✓ Nothing to clean'));
  }
  
  // Show disk space saved
  console.log(chalk.blue('\n📊 Cleanup complete!'));
}

// Run cleanup
clean().catch(error => {
  console.error(chalk.red(`❌ Cleanup failed: ${error.message}`));
  process.exit(1);
});