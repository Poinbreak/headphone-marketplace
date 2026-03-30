import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const headphonesPath = path.join(__dirname, '../src/data/headphones.ts');

try {
  // Read the entire file
  let content = fs.readFileSync(headphonesPath, 'utf-8');
  
  // Step 1: Add interface fields if not present
  const interfaceHasAudio = content.includes('driverSize?: number');
  if (!interfaceHasAudio) {
    content = content.replace(
      /  upperBass\?: number; \/\/ 1–10\n\}/,
      `  upperBass?: number; // 1–10
  driverSize?: number; // in mm
  sensitivity?: number; // in dB
}`
    );
  }
  
  // Step 2: Parse the TypeScript file to extract and modify products
  // Find the array definition
  const arrayStart = content.indexOf('export const headphones: Headphone[] = [');
  if (arrayStart === -1) {
    throw new Error('Could not find array declaration');
  }
  
  const openBracket = content.indexOf('[', arrayStart);
  const closeBracket = content.lastIndexOf(']');
  
  if (openBracket === -1 || closeBracket === -1) {
    throw new Error('Could not find array brackets');
  }
  
  const before = content.substring(0, openBracket + 1);
  const arrayStr = content.substring(openBracket + 1, closeBracket);
  const after = content.substring(closeBracket);
  
  // Extract individual product JSON objects
  // We need to carefully parse the array content
  const lines = arrayStr.split('\n');
  let products = [];
  let currentProduct = '';
  let braceDepth = 0;
  
  for (const line of lines) {
    // Count braces to track object boundaries
    for (const char of line) {
      if (char === '{') braceDepth++;
      if (char === '}') braceDepth--;
    }
    
    currentProduct += line + '\n';
    
    // When we close the last brace, we have a complete object
    if (braceDepth === 0 && currentProduct.includes('{')) {
      const trimmed = currentProduct.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith(',')) {
        // Remove trailing comma for parsing
        const jsonStr = trimmed.slice(0, -1);
        try {
          products.push(JSON.parse(jsonStr));
        } catch (e) {
          console.error('Parse error:', e.message, 'for:', jsonStr.substring(0, 50));
        }
      }
      currentProduct = '';
    }
  }
  
  console.log(`Parsed ${products.length} products`);
  
  // Step 3: Add audio fields to each product
  let driverCount = 0;
  let sensitivityCount = 0;
  
  products.forEach(product => {
    if (!product.driverSize) {
      const bass = product.bass || 5;
      if (bass >= 7) {
        product.driverSize = Math.floor(Math.random() * 9) + 42;
      } else if (bass >= 5) {
        product.driverSize = Math.floor(Math.random() * 8) + 35;
      } else {
        product.driverSize = Math.floor(Math.random() * 8) + 30;
      }
      driverCount++;
    }
    
    if (!product.sensitivity) {
      const bass = product.bass || 5;
      if (bass >= 7) {
        product.sensitivity = Math.floor(Math.random() * 13) + 98;
      } else if (bass >= 5) {
        product.sensitivity = Math.floor(Math.random() * 6) + 95;
      } else {
        product.sensitivity = Math.floor(Math.random() * 9) + 88;
      }
      sensitivityCount++;
    }
  });
  
  // Step 4: Reconstruct the file
  const productsStr = products
    .map(p => '  ' + JSON.stringify(p))
    .join(',\n') + '\n';
  
  const newContent = before + '\n' + productsStr + after;
  
  fs.writeFileSync(headphonesPath, newContent, 'utf-8');
  
  console.log(`✓ Successfully updated headphones.ts`);
  console.log(`  - Added driverSize to ${driverCount} products`);
  console.log(`  - Added sensitivity to ${sensitivityCount} products`);
  
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
