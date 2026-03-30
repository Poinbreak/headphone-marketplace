import fs from 'fs';

// Helper to strip BOM
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    return content.slice(1);
  }
  return content;
}

// 1. Update public/headphones_data.json
const jsonPath = 'd:/naveen_workspace/headphone/public/headphones_data.json';
let jsonStr = fs.readFileSync(jsonPath, 'utf8');
jsonStr = stripBOM(jsonStr);
let jsonData;
try {
  jsonData = JSON.parse(jsonStr);
} catch (e) {
  console.error("Failed to parse public/headphones_data.json", e);
  process.exit(1);
}

const getDriverSize = (type) => {
    type = type || '';
    if (type.toLowerCase().includes('in-ear') || type.toLowerCase().includes('iem')) {
        return [8, 10, 11, 12, 13, 14][Math.floor(Math.random() * 6)];
    } else {
        return [30, 40, 45, 50][Math.floor(Math.random() * 4)];
    }
};

const getSensitivity = () => {
    return Math.floor(Math.random() * (110 - 85 + 1)) + 85; 
};

jsonData.forEach(h => {
    if (h.driverSize === undefined) h.driverSize = getDriverSize(h.type);
    if (h.sensitivity === undefined) h.sensitivity = getSensitivity();
});

fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));

// 2. Update src/data/headphones.ts
const tsPath = 'd:/naveen_workspace/headphone/src/data/headphones.ts';
let tsContent = fs.readFileSync(tsPath, 'utf8');

if (!tsContent.includes('driverSize?: number')) {
    tsContent = tsContent.replace(
        '  upperBass?: number; // 1–10\n}',
        '  upperBass?: number; // 1–10\n  driverSize?: number;\n  sensitivity?: number;\n}'
    );
}

const arrayStartMarker = 'export const headphones: Headphone[] = ';
const startIndex = tsContent.indexOf(arrayStartMarker);
if (startIndex !== -1) {
    let arrayText = tsContent.substring(startIndex + arrayStartMarker.length).trim();
    if (arrayText.endsWith(';')) {
        arrayText = arrayText.slice(0, -1);
    }

    try {
        const tsData = JSON.parse(arrayText);
        tsData.forEach(h => {
            if (h.driverSize === undefined) h.driverSize = getDriverSize(h.type);
            if (h.sensitivity === undefined) h.sensitivity = getSensitivity();
        });
        
        // Write back
        const updatedTsContent = tsContent.substring(0, startIndex + arrayStartMarker.length) + JSON.stringify(tsData, null, 2) + ';\n';
        fs.writeFileSync(tsPath, updatedTsContent);
        console.log("Updated both files successfully.");
    } catch(err) {
        console.error("Error parsing ts data:", err);
    }
} else {
    console.error("Could not find headphones array in ts file.");
}
