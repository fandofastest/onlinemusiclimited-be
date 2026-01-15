"use client";

import { useState } from "react";

type SignResponse = {
  success: boolean;
  data?: {
    cloudName: string;
    apiKey: string;
    folder: string;
    timestamp: number;
    signature: string;
    resourceType: "image" | "video";
  };
  error?: { message?: string };
};

type Props = {
  label: string;
  accept: string;
  resourceType: "image" | "video";
  onUploaded: (url: string) => void;
};

export default function CloudinaryUpload({ label, accept, resourceType, onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <div className="row" style={{ alignItems: "flex-end" }}>
        <label className="label" style={{ flex: 1 }}>
          {label}
          <input
            className="input"
            type="file"
            accept={accept}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <button
          className="button"
          disabled={!file || busy}
          onClick={async () => {
            if (!file) return;
            setError(null);
            setBusy(true);
            try {
              const signRes = await fetch("/api/admin/cloudinary/sign", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ resourceType })
              });

              const signed = (await signRes.json()) as SignResponse;
              if (!signRes.ok || !signed.success || !signed.data) {
                setError(signed?.error?.message || "Failed to prepare upload");
                return;
              }

              const { cloudName, apiKey, folder, timestamp, signature } = signed.data;
              const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

              const fd = new FormData();
              fd.append("file", file);
              fd.append("api_key", apiKey);
              fd.append("timestamp", String(timestamp));
              fd.append("signature", signature);
              fd.append("folder", folder);

              const uploadRes = await fetch(endpoint, { method: "POST", body: fd });
              const uploadJson = (await uploadRes.json()) as { secure_url?: string; url?: string; error?: { message?: string } };

              if (!uploadRes.ok) {
                setError(uploadJson?.error?.message || "Upload failed");
                return;
              }

              const url = uploadJson.secure_url || uploadJson.url;
              if (!url) {
                setError("Upload succeeded but no URL returned");
                return;
              }

              onUploaded(url);
              setFile(null);
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Uploading..." : "Upload"}
        </button>
      </div>
      {error ? <div className="error">{error}</div> : null}
    </div>
  );
}
