import { GoogleGenAI } from '@google/genai';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnvLocal();

const apiKey = process.env.GEMINI_API_KEY;
const imageModel = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';

if (!apiKey) {
  console.error('ERROR: GEMINI_API_KEY not found in environment or .env.local');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

const sharedStyle = `Ultra-realistic documentary photograph, full-frame camera, 35mm lens at f/2, natural soft daylight, true-to-life Indian skin tones and realistic skin texture, candid natural expressions, shallow depth of field, gentle colour grade with cool blue shadows and warm golden highlights, clean uncluttered background. No text, no letters, no logos, no watermarks, no brand names, no readable writing on books, boards or screens, no real institution names, uniforms or insignia. Anatomically correct hands and eyes. Fictional people only, not resembling any real person.`;

const imagesToGenerate = [
  {
    name: 'cluster-commerce.webp',
    width: 600,
    height: 800,
    prompt: `${sharedStyle} Vertical 3:4 portrait orientation. A young Indian finance trainee in smart business-casual attire reviewing financial charts on a laptop in a modern glass-walled meeting room with natural daylight.`,
  },
  {
    name: 'cluster-law.webp',
    width: 600,
    height: 800,
    prompt: `${sharedStyle} Vertical 3:4 portrait orientation. A young Indian lawyer in a black advocate coat and white neck bands standing thoughtfully on generic outdoor stone steps holding plain legal case files, no court signage.`,
  },
  {
    name: 'cluster-design.webp',
    width: 600,
    height: 800,
    prompt: `${sharedStyle} Vertical 3:4 portrait orientation. A young Indian designer sketching with colour pencils at a wooden studio desk surrounded by neat fabric swatches and paper design drafts in a creative sunlit studio.`,
  },
  {
    name: 'cluster-defence.webp',
    width: 600,
    height: 800,
    prompt: `${sharedStyle} Vertical 3:4 portrait orientation. Indian youth cadets in plain olive green physical training athletic kit jogging in disciplined formation across an open sports training ground at dawn, no military insignia, no flags.`,
  },
  {
    name: 'cluster-government.webp',
    width: 600,
    height: 800,
    prompt: `${sharedStyle} Vertical 3:4 portrait orientation. A young Indian civil-services aspirant studying diligently with newspapers, notebooks and highlighters at a wooden desk in a quiet public reading room at sunrise.`,
  },
  {
    name: 'ai-counsellor.webp',
    width: 800,
    height: 600,
    prompt: `${sharedStyle} Horizontal 4:3 landscape orientation. An Indian mother and her teenage son sitting comfortably on a living room sofa at home looking at a smartphone together, relieved smiles, warm soft evening lamp light.`,
  }
];

const outDir = path.resolve(process.cwd(), 'public/images/home');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function generateOne(item) {
  const targetPath = path.join(outDir, item.name);
  if (fs.existsSync(targetPath)) {
    console.log(`Skipping ${item.name} (already exists)`);
    return true;
  }
  console.log(`Generating ${item.name}...`);
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: imageModel,
        contents: item.prompt,
      });

      let base64Bytes = null;
      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          base64Bytes = part.inlineData.data;
          break;
        }
      }

      if (!base64Bytes) {
        console.error(`Attempt ${attempt}: No image bytes in response for ${item.name}`);
        await new Promise(r => setTimeout(r, 3000));
        continue;
      }

      const buffer = Buffer.from(base64Bytes, 'base64');
      await sharp(buffer)
        .resize(item.width, item.height, { fit: 'cover' })
        .webp({ quality: 82 })
        .toFile(targetPath);

      const stats = fs.statSync(targetPath);
      console.log(`✅ Saved ${item.name} (${Math.round(stats.size / 1024)} KB)`);
      return true;
    } catch (err) {
      console.error(`Attempt ${attempt} error for ${item.name}:`, err.message);
      if (attempt < 3) {
        console.log('Waiting 5s before retry...');
        await new Promise(r => setTimeout(r, 5000));
      }
    }
  }
  return false;
}

async function run() {
  console.log(`Using model: ${imageModel}`);
  for (const item of imagesToGenerate) {
    await generateOne(item);
    await new Promise(r => setTimeout(r, 2000));
  }
  console.log('Finished image generation process.');
}

run();
