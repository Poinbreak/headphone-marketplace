import fs from 'fs';

const tsPath = 'd:/naveen_workspace/headphone/src/data/headphones.ts';
let tsContent = fs.readFileSync(tsPath, 'utf8');

const arrayStartMarker = 'export const headphones: Headphone[] = [';
const dataPos = tsContent.indexOf(arrayStartMarker);

const fixInterface = `export interface Headphone {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  type: string;
  connectivity: string;
  wirelessProtocol: string;
  wiredInterface: string[];
  mic: boolean;
  micDetachable: boolean;
  wirelessMultiMode: boolean;
  noiseCancellationType: string | null;
  batteryLife: number;
  bestFor: string[];
  rating: number;
  source: string;
  reviews: number;
  pros: string[];
  cons: string[];
  cableDetachable?: boolean;
  driverSize?: number;
  sensitivity?: number;
  subBass?: number; // 1–10
  bass?: number;    // 1–10
  upperBass?: number; // 1–10
}

`;

tsContent = fixInterface + tsContent.substring(dataPos);
fs.writeFileSync(tsPath, tsContent);
console.log('fixed');
