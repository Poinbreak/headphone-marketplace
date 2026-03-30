import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const headphonesPath = path.join(__dirname, '../src/data/headphones.ts');

async function main() {
  try {
    console.log('Reading headphones.ts...');
    const content = fs.readFileSync(headphonesPath, 'utf-8');
    
    // Find where the array starts
    const arrayStart = content.indexOf('[');
    if (arrayStart === -1) {
      throw new Error('Could not find array start [');
    }
    
    // Find where the array ends
    const fileEnd = content.lastIndexOf(']');
    if (fileEnd === -1) {
      throw new Error('Could not find array end ]');
    }
    
    const beforeArray = content.substring(0, arrayStart + 1);
    const arrayContent = content.substring(arrayStart + 1, fileEnd);
    const afterArray = content.substring(fileEnd);
    
    console.log(`Array content length: ${arrayContent.length}`);
    
    // Split by closing and opening braces to get individual products
    const products = [];
    let currentProduct = '';
    let braceCount = 0;
    let inString = false;
    let escape = false;
    
    for (let i = 0; i < arrayContent.length; i++) {
      const char = arrayContent[i];
      const prevChar = i > 0 ? arrayContent[i - 1] : '';
      
      // Handle escape sequences
      if (escape) {
        currentProduct += char;
        escape = false;
        continue;
      }
      
      if (char === '\\' && inString) {
        escape = true;
        currentProduct += char;
        continue;
      }
      
      // Track string state
      if (char === '"' && prevChar !== '\\') {
        inString = !inString;
      }
      
      // Track braces only outside strings
      if (!inString) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
      }
      
      currentProduct += char;
      
      // When brace count returns to 0, we have a complete product
      if (braceCount === 0 && char === '}') {
        const trimmed = currentProduct.trim();
        if (trimmed.length > 2 && trimmed.startsWith('{')) {
          try {
            JSON.parse(trimmed);
            products.push(trimmed);
          } catch (e) {
            console.error('Failed to parse product:', e.message);
          }
        }
        currentProduct = '';
      }
    }
    
    console.log(`Found ${products.length} products`);
    
    // Add audio fields to each product
    let modified = [];
    let driverAdded = 0;
    let sensitivityAdded = 0;
    
    products.forEach((productStr, idx) => {
      try {
        const product = JSON.parse(productStr);
        
        // Add driverSize
        if (!product.driverSize) {
          const bass = product.bass || 5;
          if (bass >= 7) {
            product.driverSize = Math.floor(Math.random() * 9) + 42;
          } else if (bass >= 5) {
            product.driverSize = Math.floor(Math.random() * 8) + 35;
          } else {
            product.driverSize = Math.floor(Math.random() * 8) + 30;
          }
          driverAdded++;
        }
        
        // Add sensitivity
        if (!product.sensitivity) {
          const bass = product.bass || 5;
          if (bass >= 7) {
            product.sensitivity = Math.floor(Math.random() * 13) + 98;
          } else if (bass >= 5) {
            product.sensitivity = Math.floor(Math.random() * 6) + 95;
          } else {
            product.sensitivity = Math.floor(Math.random() * 9) + 88;
          }
          sensitivityAdded++;
        }
        
        modified.push(product);
      } catch (e) {
        console.error(`Error processing product ${idx}: ${e.message}`);
      }
    });
    
    // Reconstruct the file
    const newArrayContent = '  ' + modified.map(p => JSON.stringify(p)).join(',\n  ') + '\n';
    const newContent = beforeArray + newArrayContent + afterArray;
    
    fs.writeFileSync(headphonesPath, newContent, 'utf-8');
    
    console.log(`✓ Successfully updated headphones.ts`);
    console.log(`  - Found: ${products.length} products`);
    console.log(`  - Added driverSize to: ${driverAdded} products`);
    console.log(`  - Added sensitivity to: ${sensitivityAdded} products`);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
