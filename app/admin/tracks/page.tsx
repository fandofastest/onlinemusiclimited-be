"use client";

import { useEffect, useMemo, useState } from "react";
import CloudinaryUpload from "../_components/CloudinaryUpload";
import Modal from "../_components/Modal";

type ApiResult = { ok: boolean; body: unknown };

type TrackItem = {
  _id: string;
  title: string;
  mood: "relax" | "focus" | "sleep";
  genre: "ambient" | "lofi" | "piano" | "cinematic";
  duration: number;
  audioUrl: string;
  isAiGenerated: boolean;
  isFree: boolean;
  createdAt: string;
};

async function postJson(path: string, payload: unknown): Promise<ApiResult> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = await res.text();
  }

  return { ok: res.ok, body };
}

async function patchJson(path: string, payload: unknown): Promise<ApiResult> {
  const res = await fetch(path, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = await res.text();
  }

  return { ok: res.ok, body };
}

async function deleteReq(path: string): Promise<ApiResult> {
  const res = await fetch(path, { method: "DELETE" });

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = await res.text();
  }

  return { ok: res.ok, body };
}

export default function TracksPage() {
  const [items, setItems] = useState<TrackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    mood: "relax",
    genre: "ambient",
    duration: "120",
    audioUrl: "",
    isFree: true
  });
  const [result, setResult] = useState<ApiResult | null>(null);

  const pretty = useMemo(() => {
    if (!result) return "";
    try {
      return JSON.stringify(result.body, null, 2);
    } catch {
      return String(result.body);
    }
  }, [result]);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tracks");
      const json = await res.json();
      const list = (json?.data?.items ?? []) as TrackItem[];
      setItems(list);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm({ title: "", mood: "relax", genre: "ambient", duration: "120", audioUrl: "", isFree: true });
    setResult(null);
    setOpen(true);
  }

  function openEdit(item: TrackItem) {
    setEditingId(item._id);
    setForm({
      title: item.title,
      mood: item.mood,
      genre: item.genre,
      duration: String(item.duration ?? 0),
      audioUrl: item.audioUrl,
      isFree: !!item.isFree
    });
    setResult(null);
    setOpen(true);
  }

  return (
    <div className="container">
      <div className="h1">AI Tracks</div>
      <div className="p">Create AI-generated, royalty-free instrumental tracks only.</div>

      <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="p" style={{ margin: 0 }}>
          {loading ? "Loading..." : `${items.length} tracks`}
        </div>
        <div className="row">
          <button className="button" onClick={refresh}>
            Refresh
          </button>
          <button className="button buttonPrimary" onClick={openCreate}>
            New Track
          </button>
        </div>
      </div>

      <div style={{ height: 16 }} />

      <div className="card" style={{ padding: 0 }}>
        <table className="table">
          <thead>
            <tr>
              <th className="th">Title</th>
              <th className="th">Mood</th>
              <th className="th">Genre</th>
              <th className="th">Duration</th>
              <th className="th">Free</th>
              <th className="th" style={{ textAlign: "right" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t._id} className="tr">
                <td className="td">{t.title}</td>
                <td className="td">{t.mood}</td>
                <td className="td">{t.genre}</td>
                <td className="td">{t.duration}s</td>
                <td className="td">
                  <span className={t.isFree ? "pill pillOn" : "pill"}>{t.isFree ? "free" : "paid"}</span>
                </td>
                <td className="td">
                  <div className="actions">
                    <button className="button" onClick={() => openEdit(t)}>
                      Edit
                    </button>
                    <button
                      className="button buttonDanger"
                      onClick={async () => {
                        if (!confirm(`Delete track "${t.title}"?`)) return;
                        setResult(await deleteReq(`/api/admin/tracks/${t._id}`));
                        await refresh();
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        title={editingId ? "Edit Track" : "New Track"}
        onClose={() => setOpen(false)}
        footer={
          <>
            <button className="button" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button
              className="button buttonPrimary"
              onClick={async () => {
                setResult(null);
                const payload = { ...form, duration: Number.parseInt(form.duration, 10) };
                const res = editingId
                  ? await patchJson(`/api/admin/tracks/${editingId}`, payload)
                  : await postJson("/api/admin/tracks", payload);
                setResult(res);
                if (res.ok) {
                  setOpen(false);
                  await refresh();
                }
              }}
            >
              Save
            </button>
          </>
        }
      >
        <div className="grid">
          <label className="label">
            Title
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>
          <label className="label">
            Audio URL
            <input className="input" value={form.audioUrl} onChange={(e) => setForm({ ...form, audioUrl: e.target.value })} />
          </label>
          <div style={{ gridColumn: "1 / -1" }}>
            <CloudinaryUpload
              label="Upload track audio"
              accept="audio/*"
              resourceType="video"
              onUploaded={(url) => setForm((prev) => ({ ...prev, audioUrl: url }))}
            />
          </div>
          <label className="label">
            Mood
            <select className="select" value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value })}>
              <option value="relax">relax</option>
              <option value="focus">focus</option>
              <option value="sleep">sleep</option>
            </select>
          </label>
          <label className="label">
            Genre
            <select className="select" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })}>
              <option value="ambient">ambient</option>
              <option value="lofi">lofi</option>
              <option value="piano">piano</option>
              <option value="cinematic">cinematic</option>
            </select>
          </label>
          <label className="label">
            Duration (seconds)
            <input className="input" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
          </label>
          <label className="label">
            Free
            <div className="row">
              <input type="checkbox" checked={form.isFree} onChange={(e) => setForm({ ...form, isFree: e.target.checked })} />
              <span className="mono">isFree</span>
            </div>
          </label>
        </div>

        {result ? (
          <div style={{ marginTop: 12 }}>
            <div className="p" style={{ marginBottom: 10 }}>
              Last Result
            </div>
            <pre className="pre">{pretty}</pre>
          </div>
        ) : null}
      </Modal>

      <div style={{ height: 16 }} />
      <div className="card">
        <div className="p" style={{ marginBottom: 10 }}>
          Last Result
        </div>
        <pre className="pre">{pretty}</pre>
      </div>
    </div>
  );
}
