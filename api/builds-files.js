// Vercel Serverless Function - 自动扫描 builds/ 目录下的 HTML 文件
// 返回 BD HTML 文件列表，供管理后台 HTML 文件下拉使用
// 不再依赖 manifest.json，新增/删除 HTML 文件后自动反映

import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const BUILDS_DIR = join(process.cwd(), 'builds');

// 从 HTML 文件中提取 <title> 内容
function extractTitle(filename) {
  try {
    const html = readFileSync(join(BUILDS_DIR, filename), 'utf-8');
    const m = html.match(/<title>([^<]*)<\/title>/i);
    if (m && m[1]) {
      // 去除常见后缀如 " - POE2 Hub"
      return m[1].replace(/\s*[-·|]\s*POE2.*$/i, '').trim();
    }
  } catch (e) {}
  // fallback: 用 slug
  return filename.replace(/\.html$/i, '');
}

function listBuildFiles() {
  try {
    return readdirSync(BUILDS_DIR)
      .filter(f => /\.html$/i.test(f))
      .sort()
      .map(filename => {
        const slug = filename.replace(/\.html$/i, '');
        return {
          value: `/builds/${filename}`,
          label: extractTitle(filename),
          description: '',
          slug
        };
      });
  } catch (e) {
    return [];
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const files = listBuildFiles();
    // 文件系统读取很快，但仍给 5 分钟 CDN 缓存
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ success: true, files });
  } catch (error) {
    console.error('builds-files API error:', error);
    return res.status(500).json({ error: error.message || '读取失败' });
  }
}
