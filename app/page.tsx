'use client';

import { useState, useEffect } from 'react';

interface ReleaseData {
  id?: string;
  repoName: string;
  version: string;
  hasBreakingChanges: boolean;
  summary: string;
  keyChanges: string[];
  urgency: 'low' | 'medium' | 'high';
  publishedAt: string;
  htmlUrl: string;
}

export default function Dashboard() {
  const [releases, setReleases] = useState<ReleaseData[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [lastSync, setLastSync] = useState<string | null>(null);

  // Cargar datos persistidos desde Postgres al iniciar
  const loadStoredReleases = async () => {
    try {
      const res = await fetch('/api/sync');
      const json = await res.json();
      if (json.success && json.data) {
        setReleases(json.data);
      }
    } catch (err) {
      console.error('Error al cargar datos locales:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadStoredReleases();
  }, []);

  // Ejecutar sincronización manual
  const triggerSync = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setReleases(json.data);
        setLastSync(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('Error al sincronizar:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyBadge = (urgency: string, breaking: boolean) => {
    if (breaking || urgency === 'high') {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-950/80 text-red-400 border border-red-800">
          Breaking Changes / High
        </span>
      );
    }
    if (urgency === 'medium') {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-950/80 text-yellow-400 border border-yellow-800">
          Urgencia Media
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800">
        Estable / Low
      </span>
    );
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-4 sm:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              DevPulse <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Live LLM Agent</span>
            </h1>
            <p className="text-neutral-400 text-sm mt-1">
              Monitoreo autónomo de dependencias persistido en PostgreSQL (Supabase)
            </p>
          </div>

          <div className="flex items-center gap-3">
            {lastSync && (
              <span className="text-xs text-neutral-400">
                Sync reciente: {lastSync}
              </span>
            )}
            <button
              onClick={triggerSync}
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Sincronizando con BD...
                </>
              ) : (
                'Ejecutar Sync Manual'
              )}
            </button>
          </div>
        </header>

        {initialLoading && (
          <div className="text-center py-12 text-sm text-neutral-500">
            Consultando registros en base de datos...
          </div>
        )}

        {!initialLoading && releases.length === 0 && !loading && (
          <div className="text-center py-16 border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/30">
            <h3 className="text-lg font-medium text-neutral-300">Base de datos vacía</h3>
            <p className="text-sm text-neutral-500 mt-1 max-w-sm mx-auto">
              Presiona "Ejecutar Sync Manual" para analizar con Gemini y guardar los primeros registros en Postgres.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {releases.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-5 sm:p-6 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-4 shadow-sm hover:border-neutral-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {item.repoName}{' '}
                    <span className="text-neutral-400 font-normal text-sm">
                      ({item.version})
                    </span>
                  </h2>
                  <a
                    href={item.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-400 hover:underline inline-block mt-0.5"
                  >
                    Ver notas en GitHub &rarr;
                  </a>
                </div>
                <div>{getUrgencyBadge(item.urgency, item.hasBreakingChanges)}</div>
              </div>

              <div className="bg-neutral-950/70 p-3.5 rounded-lg border border-neutral-800/80">
                <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold block mb-1">
                  Resumen Ejecutivo (Almacenado en Postgres)
                </span>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              {item.keyChanges?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                    Cambios Destacados:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-neutral-300">
                    {item.keyChanges.map((change, i) => (
                      <li key={i} className="leading-snug">{change}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}