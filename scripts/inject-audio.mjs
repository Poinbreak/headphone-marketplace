import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const headphonesPath = path.join(__dirname, '../src/data/headphones.ts');

try {
  console.log('Reading file...');
  let content = fs.readFileSync(headphonesPath, 'utf-8');
  
  // Step 1: Add interface fields  
  const interfaceHasAudio = content.includes('driverSize?: number');
  if (!interfaceHasAudio) {
    console.log('Adding interface fields...');
    content = content.replace(
      /  upperBass\?: number; \/\/ 1–10\n\}/,
      `  upperBass?: number; // 1–10
  driverSize?: number; // in mm
  sensitivity?: number; // in dB
}`
    );
  }
  
  // Step 2: Find each product and add audio fields
  // Strategy: for each product (marked by "id": "..."), find where it ends and add the fields before the closing }
  
  let result = '';
  let lines = content.split('\n');
  let inProduct = false;
  let productCount = 0;
  let driverCount = 0;
  let sensitivityCount = 0;
  let productBass = 5;
  let closingBraceLine = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Track when we start a product
    if (line.includes('"id":')) {
      inProduct = true;
      productCount++;
    }
    
    // Track bass value for the current product
    if (inProduct && line.includes('"bass":')) {
      const match = line.match(/"bass":\s*(\d+)/);
      if (match) {
        productBass = parseInt(match[1]);
      }
    }
    
    // Check if this line has the closing brace
    if (inProduct && line.match(/^\s*\}\s*[,}]?\s*$/)) {
      closingBraceLine = true;
      inProduct = false;
    }
    
    // If we have a closing brace and the product doesn't have audio fields yet
    if (closingBraceLine) {
      if (!line.includes('driverSize') && !line.includes('sensitivity')) {
        //  Add audio fields before the closing brace
        // Find the position to insert
        const trimmed = line.trim();
        const isLastProduct = trimmed.endsWith('}');
        const isProductEnd = trimmed === '}' || trimmed === '},' || trimmed === '}];'|| trimmed === '],';
        
        if (isProductEnd) {
          // Remove trailing brace/comma combination
          let lineWithoutEnd = line.replace(/(\s*)\}(,?)(\s*)$/, '$1XXX$2$3');
          
          // Generate audio values based on bass
          let driverSize;
          if (productBass >= 7) {
            driverSize = Math.floor(Math.random() * 9) + 42;
          } else if (productBass >= 5) {
            driverSize = Math.floor(Math.random() * 8) + 35;
          } else {
            driverSize = Math.floor(Math.random() * 8) + 30;
          }
          
          let sensitivity;
          if (productBass >= 7) {
            sensitivity = Math.floor(Math.random() * 13) + 98;
          } else if (productBass >= 5) {
            sensitivity = Math.floor(Math.random() * 6) + 95;
          } else {
            sensitivity = Math.floor(Math.random() * 9) + 88;
          }
          
          // Build the new line with audio fields
          const indentMatch = line.match(/^(\s*)/);
          const indent = indentMatch ? indentMatch[1] : '  ';
          
          lineWithoutEnd = lineWithoutEnd.replace('XXX', `"driverSize": ${driverSize}, "sensitivity": ${sensitivity}\n${indent.slice(0, -2)}}`);
          result += lineWithoutEnd + '\n';
          driverCount++;
          sensitivityCount++;
        } else {
          result += line + '\n';
        }
      } else {
        result += line + '\n';
      }
      closingBraceLine = false;
    } else {
      result += line + '\n';
    }
  }
  
  fs.writeFileSync(headphonesPath, result, 'utf-8');
  
  console.log(`✓ Successfully updated headphones.ts`);
  console.log(`  - Found ${productCount} products`);
  console.log(`  - Added driverSize to ${driverCount} products`);
  console.log(`  - Added sensitivity to ${sensitivityCount} products`);
  
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
