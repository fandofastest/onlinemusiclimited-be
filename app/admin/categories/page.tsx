"use client";

import { useEffect, useMemo, useState } from "react";
import CloudinaryUpload from "../_components/CloudinaryUpload";
import Modal from "../_components/Modal";

type ApiResult = { ok: boolean; body: unknown };

type CategoryItem = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl?: string;
  order: number;
  isActive: boolean;
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

export default function CategoriesPage() {
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({ title: "", slug: "", description: "", imageUrl: "", order: "0", isActive: true });
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
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      const list = (json?.data?.items ?? []) as CategoryItem[];
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
    setForm({ title: "", slug: "", description: "", imageUrl: "", order: "0", isActive: true });
    setResult(null);
    setOpen(true);
  }

  function openEdit(item: CategoryItem) {
    setEditingId(item._id);
    setForm({
      title: item.title,
      slug: item.slug,
      description: item.description,
      imageUrl: item.imageUrl || "",
      order: String(item.order ?? 0),
      isActive: !!item.isActive
    });
    setResult(null);
    setOpen(true);
  }

  return (
    <div className="container">
      <div className="h1">Categories</div>
      <div className="p">Create and manage learning categories.</div>

      <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="p" style={{ margin: 0 }}>
          {loading ? "Loading..." : `${items.length} categories`}
        </div>
        <div className="row">
          <button className="button" onClick={refresh}>
            Refresh
          </button>
          <button className="button buttonPrimary" onClick={openCreate}>
            New Category
          </button>
        </div>
      </div>

      <div style={{ height: 16 }} />

      <div className="card" style={{ padding: 0 }}>
        <table className="table">
          <thead>
            <tr>
              <th className="th">Title</th>
              <th className="th">Slug</th>
              <th className="th">Order</th>
              <th className="th">Active</th>
              <th className="th" style={{ textAlign: "right" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c._id} className="tr">
                <td className="td">{c.title}</td>
                <td className="td mono">{c.slug}</td>
                <td className="td">{c.order}</td>
                <td className="td">
                  <span className={c.isActive ? "pill pillOn" : "pill"}>{c.isActive ? "active" : "inactive"}</span>
                </td>
                <td className="td">
                  <div className="actions">
                    <button className="button" onClick={() => openEdit(c)}>
                      Edit
                    </button>
                    <button
                      className="button buttonDanger"
                      onClick={async () => {
                        if (!confirm(`Delete category "${c.title}"?`)) return;
                        setResult(await deleteReq(`/api/admin/categories/${c._id}`));
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
        title={editingId ? "Edit Category" : "New Category"}
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
                const payload = { ...form, order: Number.parseInt(form.order, 10) };
                const res = editingId
                  ? await patchJson(`/api/admin/categories/${editingId}`, payload)
                  : await postJson("/api/admin/categories", payload);
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
            Slug
            <input className="input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </label>
          <label className="label" style={{ gridColumn: "1 / -1" }}>
            Description
            <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <label className="label" style={{ gridColumn: "1 / -1" }}>
            Image URL (Cloudinary)
            <input className="input" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          </label>
          <div style={{ gridColumn: "1 / -1" }}>
            <CloudinaryUpload
              label="Upload category image"
              accept="image/*"
              resourceType="image"
              onUploaded={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))}
            />
          </div>
          <label className="label">
            Order
            <input className="input" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
          </label>
          <label className="label">
            Active
            <div className="row">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              <span className="mono">isActive</span>
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
