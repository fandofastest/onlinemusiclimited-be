"use client";

import { useEffect, useMemo, useState } from "react";
import Modal from "../_components/Modal";

type ApiResult = { ok: boolean; body: unknown };

type CategoryItem = {
  _id: string;
  title: string;
  slug: string;
  isActive?: boolean;
};

type ArticleListItem = {
  _id: string;
  categoryId: string;
  title: string;
  slug: string;
  summary: string;
  readingTime: number;
  level: "beginner" | "intermediate" | "advanced";
  language: "en";
  tags: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

type ArticleFullItem = ArticleListItem & {
  content: string;
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

export default function ArticlesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [items, setItems] = useState<ArticleListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    categorySlug: "",
    title: "",
    slug: "",
    content: "",
    summary: "",
    readingTime: "5",
    level: "beginner",
    tags: "",
    published: false
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

  async function refreshCategories() {
    setCategoriesLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      const list = (json?.data?.items ?? []) as CategoryItem[];
      setCategories(list);
      if (!form.categorySlug && list.length > 0) {
        setForm((prev) => ({ ...prev, categorySlug: list[0].slug }));
      }
    } finally {
      setCategoriesLoading(false);
    }
  }

  async function refreshArticles() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/articles");
      const json = await res.json();
      const list = (json?.data?.items ?? []) as ArticleListItem[];
      setItems(list);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshCategories();
    refreshArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categoryTitleById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) map.set(c._id, c.title);
    return map;
  }, [categories]);

  function openCreate() {
    setEditingId(null);
    setForm({
      categorySlug: categories.length > 0 ? categories[0].slug : "",
      title: "",
      slug: "",
      content: "",
      summary: "",
      readingTime: "5",
      level: "beginner",
      tags: "",
      published: false
    });
    setResult(null);
    setOpen(true);
  }

  async function openEdit(id: string) {
    setEditingId(id);
    setResult(null);
    setOpen(true);

    const res = await fetch(`/api/admin/articles/${id}`);
    const json = await res.json();
    const item = json?.data?.item as ArticleFullItem | undefined;
    if (!item) return;

    const categorySlug = categories.find((c) => c._id === item.categoryId)?.slug || "";

    setForm({
      categorySlug,
      title: item.title,
      slug: item.slug,
      content: item.content,
      summary: item.summary,
      readingTime: String(item.readingTime ?? 5),
      level: item.level,
      tags: (item.tags ?? []).join(", "),
      published: !!item.published
    });
  }

  return (
    <div className="container">
      <div className="h1">Articles</div>
      <div className="p">Create learning articles (text-based educational content).</div>

      <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="p" style={{ margin: 0 }}>
          {loading ? "Loading..." : `${items.length} articles`}
        </div>
        <div className="row">
          <button className="button" onClick={async () => {
            await refreshCategories();
            await refreshArticles();
          }}>
            Refresh
          </button>
          <button className="button buttonPrimary" onClick={openCreate}>
            New Article
          </button>
        </div>
      </div>

      <div style={{ height: 16 }} />

      <div className="card" style={{ padding: 0 }}>
        <table className="table">
          <thead>
            <tr>
              <th className="th">Title</th>
              <th className="th">Category</th>
              <th className="th">Level</th>
              <th className="th">Published</th>
              <th className="th" style={{ textAlign: "right" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a._id} className="tr">
                <td className="td">{a.title}</td>
                <td className="td">{categoryTitleById.get(a.categoryId) || a.categoryId}</td>
                <td className="td">{a.level}</td>
                <td className="td">
                  <span className={a.published ? "pill pillOn" : "pill"}>{a.published ? "published" : "draft"}</span>
                </td>
                <td className="td">
                  <div className="actions">
                    <button className="button" onClick={() => openEdit(a._id)}>
                      Edit
                    </button>
                    <button
                      className="button buttonDanger"
                      onClick={async () => {
                        if (!confirm(`Delete article "${a.title}"?`)) return;
                        setResult(await deleteReq(`/api/admin/articles/${a._id}`));
                        await refreshArticles();
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
        title={editingId ? "Edit Article" : "New Article"}
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
                const payload = {
                  ...form,
                  readingTime: Number.parseInt(form.readingTime, 10),
                  tags: form.tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                };
                const res = editingId
                  ? await patchJson(`/api/admin/articles/${editingId}`, payload)
                  : await postJson("/api/admin/articles", payload);
                setResult(res);
                if (res.ok) {
                  setOpen(false);
                  await refreshArticles();
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
            Category
            <select
              className="select"
              value={form.categorySlug}
              onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
              disabled={categoriesLoading}
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title} ({c.slug})
                </option>
              ))}
            </select>
          </label>
          <label className="label">
            Level
            <select className="select" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
              <option value="beginner">beginner</option>
              <option value="intermediate">intermediate</option>
              <option value="advanced">advanced</option>
            </select>
          </label>
          <label className="label">
            Title
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>
          <label className="label">
            Slug
            <input className="input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </label>
          <label className="label" style={{ gridColumn: "1 / -1" }}>
            Summary
            <input className="input" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
          </label>
          <label className="label" style={{ gridColumn: "1 / -1" }}>
            Content (HTML/Markdown)
            <textarea className="textarea" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </label>
          <label className="label">
            Reading time (minutes)
            <input className="input" value={form.readingTime} onChange={(e) => setForm({ ...form, readingTime: e.target.value })} />
          </label>
          <label className="label">
            Tags (comma-separated)
            <input className="input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </label>
          <label className="label">
            Published
            <div className="row">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
              <span className="mono">published</span>
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
