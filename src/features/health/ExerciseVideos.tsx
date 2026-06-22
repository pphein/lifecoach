import { useState } from "react";
import { Plus, Trash2, Play } from "lucide-react";

const STORAGE_KEY = "life100_exercise_videos";

interface VideoItem {
  id: string;
  title: string;
  ytId: string;
}

function parseYouTubeId(url: string): string | null {
  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /embed\/([A-Za-z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function loadVideos(): VideoItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveVideos(items: VideoItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const CARD = "bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700";
const INPUT = "w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-400 dark:placeholder-gray-400";

export default function ExerciseVideos() {
  const [videos, setVideos] = useState<VideoItem[]>(loadVideos);
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState<string | null>(null);

  function handleAdd() {
    const ytId = parseYouTubeId(url.trim());
    if (!ytId) { setError("Invalid YouTube URL"); return; }
    const item: VideoItem = {
      id: crypto.randomUUID(),
      title: title.trim() || "Exercise Video",
      ytId,
    };
    const updated = [...videos, item];
    setVideos(updated);
    saveVideos(updated);
    setUrl(""); setTitle(""); setError(""); setShowForm(false);
  }

  function handleDelete(id: string) {
    if (playing === id) setPlaying(null);
    const updated = videos.filter((v) => v.id !== id);
    setVideos(updated);
    saveVideos(updated);
  }

  return (
    <div className={CARD + " space-y-4"}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Play size={16} className="text-indigo-500" />
          <h2 className="font-bold text-gray-900 dark:text-white">Exercise Videos</h2>
        </div>
        <button
          onClick={() => { setShowForm((s) => !s); setError(""); }}
          className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white"
        >
          <Plus size={16} />
        </button>
      </div>

      {showForm && (
        <div className="space-y-2">
          <input
            className={INPUT}
            placeholder="YouTube URL (e.g. https://youtu.be/...)"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(""); }}
          />
          <input
            className={INPUT}
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium">
              Add
            </button>
            <button onClick={() => { setShowForm(false); setError(""); }} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-2.5 rounded-lg text-sm font-medium">
              Cancel
            </button>
          </div>
        </div>
      )}

      {videos.length === 0 && !showForm && (
        <p className="text-sm text-gray-400 text-center py-2">No videos yet. Tap + to add a YouTube link.</p>
      )}

      <div className="space-y-4">
        {videos.map((v) => (
          <div key={v.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{v.title}</p>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button
                  onClick={() => setPlaying(playing === v.id ? null : v.id)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium"
                >
                  {playing === v.id ? "Hide" : "Play"}
                </button>
                <button onClick={() => handleDelete(v.id)} className="p-1.5 text-gray-300 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            {playing === v.id && (
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  className="absolute inset-0 w-full h-full rounded-xl"
                  src={`https://www.youtube.com/embed/${v.ytId}?autoplay=1`}
                  title={v.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
