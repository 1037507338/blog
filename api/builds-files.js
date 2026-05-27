// Vercel Serverless Function - 读取 builds/ 目录下的 manifest.json
// 返回 BD HTML 文件列表，供管理后台 HTML 文件下拉使用
// manifest.json 结构见 /builds/manifest.json

import { readFileSync } from 'fs';
import { join } from 'path';

// 读取 builds/manifest.json（与 api/ 同级的 builds/ 目录）
function getManifest() {
  try {
    const manifestPath = join(process.cwd(), 'builds', 'manifest.json');
    const raw = readFileSync(manifestPath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    // manifest 不存在时返回空列表
    return { version: '0', description: 'manifest not found', updated: '', files: [] };
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const manifest = getManifest();

    // 转换为前端需要的下拉选项格式
    const files = manifest.files.map(f => ({
      value: `/builds/${f.filename}`,
      label: f.title,
      description: f.description || '',
      slug: f.slug || ''
    }));

    return res.status(200).json({
      success: true,
      updated: manifest.updated,
      files
    });
  } catch (error) {
    console.error('builds-files API error:', error);
    return res.status(500).json({ error: error.message || '读取失败' });
  }
}
