import { NextResponse } from 'next/server';
import { analyzeChangelog } from '@/lib/gemini';
import { prisma } from '@/lib/prisma';

const TARGET_REPOS = [
  'vercel/next.js',
  'prisma/prisma',
  'tailwindlabs/tailwindcss',
];

// GET: Obtiene todos los reportes guardados en la base de datos
export async function GET() {
  try {
    const reports = await prisma.releaseReport.findMany({
      orderBy: { publishedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error: any) {
    console.error('Error al leer de la base de datos:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al consultar BD' },
      { status: 500 }
    );
  }
}

// POST: Ejecuta la sincronización con GitHub + Gemini y persiste en Postgres
export async function POST() {
  try {
    const results = [];

    for (const repo of TARGET_REPOS) {
      // 1. Consultar última release en GitHub
      const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
        headers: {
          'User-Agent': 'DevPulse-Monitor',
          Accept: 'application/vnd.github.v3+json',
        },
        cache: 'no-store',
      });

      if (!res.ok) continue;

      const releaseData = await res.json();

      // 2. Revisar si ya fue analizado previamente en Postgres
      const existing = await prisma.releaseReport.findUnique({
        where: {
          repoName_version: {
            repoName: repo,
            version: releaseData.tag_name,
          },
        },
      });

      if (existing) {
        results.push(existing);
        continue;
      }

      // 3. Procesar con Gemini si es una versión no registrada
      const analysis = await analyzeChangelog(
        repo,
        releaseData.tag_name,
        releaseData.body || 'Sin descripción detallada.'
      );

      // 4. Guardar en Postgres (Supabase)
      const saved = await prisma.releaseReport.create({
        data: {
          repoName: analysis.repo_name,
          version: analysis.version,
          hasBreakingChanges: analysis.has_breaking_changes,
          summary: analysis.summary,
          keyChanges: analysis.key_changes,
          urgency: analysis.urgency,
          publishedAt: new Date(releaseData.published_at),
          htmlUrl: releaseData.html_url,
        },
      });

      results.push(saved);
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      count: results.length,
      data: results,
    });
  } catch (error: any) {
    console.error('Error en sync:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Fallo en la sincronización' },
      { status: 500 }
    );
  }
}