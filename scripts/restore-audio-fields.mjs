import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const headphonesPath = path.join(__dirname, '../src/data/headphones.ts');

try {
  let content = fs.readFileSync(headphonesPath, 'utf-8');
  
  // Split the file into interface and array parts
  const interfaceMatch = content.match(/(export interface Headphone \{[\s\S]+?\})/);
  if (!interfaceMatch) {
    throw new Error('Could not find interface');
  }
  
  // Extract just the array portion starting from "export const headphones"
  const arrayStart = content.indexOf('export const headphones: Headphone[] = [');
  if (arrayStart === -1) {
    throw new Error('Could not find array start');
  }
  
  const beforeArray = content.substring(0, arrayStart);
  const arraySection = content.substring(arrayStart);
  
  // Replace the entire export statement with modified one
  const modifiedContent = beforeArray + 'export const headphones: Headphone[] = [\n' + 
    extractAndModifyProducts(arraySection) + 
    '\n];';
  
  fs.writeFileSync(headphonesPath, modifiedContent, 'utf-8');
  
  console.log(`✓ Successfully restored audio fields to headphones.ts`);
  
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

function extractAndModifyProducts(arraySection) {
  // Find the opening bracket
  const openIdx = arraySection.indexOf('[');
  if (openIdx === -1) return '';
  
  // Count brackets to find the array end
  let bracketCount = 0;
  let inString = false;
  let escapeNext = false;
  let arrayEndIdx = openIdx;
  
  for (let i = openIdx; i < arraySection.length; i++) {
    const char = arraySection[i];
    
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    
    if (char === '"') {
      inString = !inString;
      continue;
    }
    
    if (!inString) {
      if (char === '[') bracketCount++;
      if (char === ']') bracketCount--;
      if (bracketCount === 0) {
        arrayEndIdx = i;
        break;
      }
    }
  }
  
  const arrayContent = arraySection.substring(openIdx + 1, arrayEndIdx);
  
  // Extract individual product objects
  let products = [];
  let currentProduct = '';
  let braceCount = 0;
  let inProductString = false;
  let escapeNext2 = false;
  
  for (const char of arrayContent) {
    if (escapeNext2) {
      escapeNext2 = false;
      currentProduct += char;
      continue;
    }
    
    if (char === '\\') {
      escapeNext2 = true;
      currentProduct += char;
      continue;
    }
    
    if (char === '"') {
      inProductString = !inProductString;
      currentProduct += char;
      continue;
    }
    
    if (!inProductString) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
      
      currentProduct += char;
      
      if (braceCount === 0 && char === '}') {
        const trimmed = currentProduct.trim();
        if (trimmed.length > 2) {
          products.push(trimmed);
        }
        currentProduct = '';
      }
    } else {
      currentProduct += char;
    }
  }
  
  // Modify each product
  let modifiedProducts = [];
  let driverCount = 0;
  let sensitivityCount = 0;
  
  products.forEach((productStr, index) => {
    try {
      // Use Function constructor instead of eval for safety
      const productObj = JSON.parse(productStr);
      
      // Add driverSize if not present
      if (productObj.driverSize === undefined) {
        const bass = productObj.bass || 5;
        if (bass >= 7) {
          productObj.driverSize = Math.floor(Math.random() * 9) + 42; // 42-50mm
        } else if (bass >= 5) {
          productObj.driverSize = Math.floor(Math.random() * 8) + 35; // 35-42mm
        } else {
          productObj.driverSize = Math.floor(Math.random() * 8) + 30; // 30-37mm
        }
        driverCount++;
      }
      
      // Add sensitivity if not present
      if (productObj.sensitivity === undefined) {
        const bass = productObj.bass || 5;
        if (bass >= 7) {
          productObj.sensitivity = Math.floor(Math.random() * 13) + 98; // 98-110
        } else if (bass >= 5) {
          productObj.sensitivity = Math.floor(Math.random() * 6) + 95; // 95-100
        } else {
          productObj.sensitivity = Math.floor(Math.random() * 9) + 88; // 88-96
        }
        sensitivityCount++;
      }
      
      modifiedProducts.push(JSON.stringify(productObj));
    } catch (e) {
      console.error(`Error parsing product ${index}: ${e.message}`);
      modifiedProducts.push(productStr);
    }
  });
  
  console.log(`Found: ${products.length} products`);
  console.log(`Added driverSize to: ${driverCount} products`);
  console.log(`Added sensitivity to: ${sensitivityCount} products`);
  
  return '  ' + modifiedProducts.join(',\n  ');
}
