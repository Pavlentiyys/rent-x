"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Tag,
  AlignLeft,
  MapPin,
  Coins,
  ShieldCheck,
  Calendar,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  ImagePlus,
  X,
  Upload,
  AlertCircle,
} from "lucide-react";
import { Header } from "@/components/sections/Header";
import { useWalletContext } from "@/components/ui/WalletContext";
import {
  fetchPostById,
  updatePost,
  getUploadUrl,
  uploadFileToStorage,
  type Post,
} from "@/lib/api-client";

const SOL_MINT = "So11111111111111111111111111111111111111112";

const CATEGORIES = [
  "Электроника", "Техника", "Транспорт", "Спорт",
  "Инструменты", "Одежда", "Туризм", "Музыка", "Другое",
];

// An image that already exists on the server
interface ExistingImage {
  kind: "existing";
  id: number;
  objectKey: string;
  url: string;
  sortOrder: number;
}

// A local file chosen by the user, not yet uploaded
interface PendingImage {
  kind: "pending";
  localId: string;
  file: File;
  preview: string;
  uploading: boolean;
  error: string | null;
}

type AnyImage = ExistingImage | PendingImage;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export default function EditListingPage() {
  const { address, connected, authToken } = useWalletContext();
  const router = useRouter();
  const params = useParams();
  const postId = Number(params.id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<Post | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState({
    title: "", description: "", category: "",
    pricePerDay: "", depositAmount: "", location: "",
    availableFrom: "", availableTo: "",
  });

  const [images, setImages] = useState<AnyImage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!connected) router.replace("/");
  }, [connected, router]);

  // Load existing post
  useEffect(() => {
    if (!postId || isNaN(postId)) { setNotFound(true); setLoading(false); return; }

    fetchPostById(postId)
      .then((p) => {
        // Check ownership
        if (p.owner && address && p.owner.walletAddress !== address) {
          router.replace("/dashboard");
          return;
        }
        setPost(p);
        setForm({
          title: p.title,
          description: p.description,
          category: p.category,
          pricePerDay: p.pricePerDay,
          depositAmount: p.depositAmount,
          location: p.location ?? "",
          availableFrom: p.availableFrom ? p.availableFrom.slice(0, 10) : "",
          availableTo: p.availableTo ? p.availableTo.slice(0, 10) : "",
        });
        setImages(
          p.images.map((img) => ({
            kind: "existing" as const,
            id: img.id,
            objectKey: img.objectKey,
            url: img.url,
            sortOrder: img.sortOrder,
          })),
        );
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [postId, address, router]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";

    const valid = files.filter((f) => {
      if (f.size > MAX_FILE_SIZE) {
        setError(`Файл "${f.name}" превышает 10 МБ`);
        return false;
      }
      if (!f.type.startsWith("image/")) {
        setError(`Файл "${f.name}" не является изображением`);
        return false;
      }
      return true;
    });

    const pending: PendingImage[] = valid.map((file) => ({
      kind: "pending",
      localId: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      error: null,
    }));

    setImages((prev) => [...prev, ...pending]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const img = prev[index];
      if (img.kind === "pending") URL.revokeObjectURL(img.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Upload all pending images, return combined images array for the API
  const uploadPendingImages = async (): Promise<{ objectKey: string; url: string; sortOrder: number }[]> => {
    if (!authToken) throw new Error("Нет токена");

    const result: { objectKey: string; url: string; sortOrder: number }[] = [];
    let sortOrder = 0;

    for (const img of images) {
      if (img.kind === "existing") {
        result.push({ objectKey: img.objectKey, url: img.url, sortOrder: sortOrder++ });
        continue;
      }

      // Upload pending file
      setImages((prev) =>
        prev.map((i) =>
          i.kind === "pending" && i.localId === img.localId
            ? { ...i, uploading: true, error: null }
            : i,
        ),
      );

      try {
        const { objectKey, uploadUrl, fileUrl } = await getUploadUrl(
          authToken,
          img.file.name,
          img.file.type,
          img.file.size,
        );
        await uploadFileToStorage(uploadUrl, img.file);
        result.push({ objectKey, url: fileUrl, sortOrder: sortOrder++ });

        setImages((prev) =>
          prev.map((i) =>
            i.kind === "pending" && i.localId === img.localId
              ? { ...i, uploading: false }
              : i,
          ),
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Ошибка загрузки";
        setImages((prev) =>
          prev.map((i) =>
            i.kind === "pending" && i.localId === img.localId
              ? { ...i, uploading: false, error: msg }
              : i,
          ),
        );
        throw new Error(`Не удалось загрузить "${img.file.name}": ${msg}`);
      }
    }

    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken || !post) return;
    if (!form.category) { setError("Выберите категорию"); return; }

    const priceRaw = parseFloat(form.pricePerDay);
    const depositRaw = parseFloat(form.depositAmount);
    if (isNaN(priceRaw) || priceRaw <= 0) { setError("Укажите корректную цену"); return; }
    if (isNaN(depositRaw) || depositRaw <= 0) { setError("Укажите корректный залог"); return; }

    setSubmitting(true);
    setError(null);

    try {
      const uploadedImages = await uploadPendingImages();

      await updatePost(authToken, post.id, {
        title: form.title,
        description: form.description,
        category: form.category,
        pricePerDay: priceRaw.toFixed(6),
        depositAmount: depositRaw.toFixed(6),
        currencyMint: SOL_MINT,
        status: "active",
        location: form.location || undefined,
        availableFrom: form.availableFrom ? new Date(form.availableFrom).toISOString() : undefined,
        availableTo: form.availableTo ? new Date(form.availableTo).toISOString() : undefined,
        images: uploadedImages,
      });

      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSubmitting(false);
    }
  };

  // ── States ───────────────────────────────────────────────────────────────────

  if (!connected) return null;

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--page-bg)" }}>
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 size={28} className="animate-spin" style={{ color: "var(--text-3)" }} />
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--page-bg)" }}>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <AlertCircle size={40} style={{ color: "#DC2626" }} />
          <p className="text-base font-semibold" style={{ color: "var(--text-1)" }}>Листинг не найден</p>
          <button onClick={() => router.push("/dashboard")} style={{ color: "#1B2BB8" }} className="text-sm underline">
            В личный кабинет
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--page-bg)" }}>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
            <CheckCircle2 size={64} style={{ color: "#14F195" }} />
          </motion.div>
          <h2 className="text-xl font-bold" style={{ color: "var(--text-1)" }}>Изменения сохранены!</h2>
          <p className="text-sm" style={{ color: "var(--text-3)" }}>Перенаправление в личный кабинет…</p>
        </div>
      </div>
    );
  }

  const hasPendingUpload = images.some((i) => i.kind === "pending" && i.uploading);

  return (
    <div style={{ minHeight: "100vh", background: "var(--page-bg)" }}>
      <Header />

      <main className="relative z-10 rounded-t-[2.5rem]" style={{ background: "var(--main-bg)" }}>
        <div className="max-w-2xl mx-auto px-4 pt-10 pb-20">
          {/* Back */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm mb-8 hover:opacity-70 transition-opacity cursor-pointer"
            style={{ color: "var(--text-3)" }}
          >
            <ArrowLeft size={15} /> Назад
          </button>

          <div className="mb-8">
            <h1 className="text-3xl font-black mb-2" style={{ color: "var(--text-1)", letterSpacing: "-0.03em" }}>
              Редактировать листинг
            </h1>
            <p className="text-sm font-mono truncate" style={{ color: "var(--text-3)" }}>
              {post?.title}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Images ──────────────────────────────────────────────────── */}
            <div>
              <label className="block text-xs font-semibold mb-3" style={{ color: "var(--text-2)" }}>
                Фотографии <span style={{ color: "var(--text-4)" }} className="font-normal">— до 20 изображений, до 10 МБ каждое</span>
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <motion.div
                    key={img.kind === "existing" ? `e-${img.id}` : img.localId}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    className="relative rounded-[14px] overflow-hidden aspect-square"
                    style={{ border: "1px solid var(--border)", background: "var(--surface-2)" }}
                  >
                    <Image
                      src={img.kind === "existing" ? img.url : img.preview}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />

                    {/* Uploading overlay */}
                    {img.kind === "pending" && img.uploading && (
                      <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
                        <Loader2 size={20} className="animate-spin text-white" />
                      </div>
                    )}

                    {/* Error overlay */}
                    {img.kind === "pending" && img.error && (
                      <div className="absolute inset-0 flex items-center justify-center p-1" style={{ background: "rgba(220,38,38,0.75)" }}>
                        <p className="text-[9px] text-white text-center leading-tight">{img.error}</p>
                      </div>
                    )}

                    {/* Remove button */}
                    {(img.kind !== "pending" || !img.uploading) && (
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
                        style={{ background: "rgba(0,0,0,0.6)" }}
                      >
                        <X size={11} className="text-white" />
                      </button>
                    )}

                    {/* First image badge */}
                    {idx === 0 && (
                      <div
                        className="absolute bottom-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}
                      >
                        Главное
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Add image button */}
                {images.length < 20 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-[14px] flex flex-col items-center justify-center gap-2 transition-all hover:opacity-80 cursor-pointer"
                    style={{
                      border: "2px dashed var(--border)",
                      background: "var(--surface)",
                      color: "var(--text-4)",
                    }}
                  >
                    <ImagePlus size={20} />
                    <span className="text-[10px] font-semibold">Добавить</span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {/* ── Category ──────────────────────────────────────────────── */}
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-2)" }}>
                Категория <span style={{ color: "#DC2626" }}>*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleChange("category", cat)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
                    style={
                      form.category === cat
                        ? { background: "linear-gradient(135deg, #2B44D0 0%, #1B2BB8 100%)", color: "#fff" }
                        : { background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-2)" }
                    }
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Text fields ───────────────────────────────────────────── */}
            {(
              [
                { key: "title",         label: "Название",           icon: Package,     required: true,  hint: "3–160 символов" },
                { key: "pricePerDay",   label: "Цена за день (SOL)", icon: Coins,       required: true,  type: "number", hint: "Например: 0.5" },
                { key: "depositAmount", label: "Залог (SOL)",        icon: ShieldCheck, required: true,  type: "number", hint: "Возвращается после" },
                { key: "location",      label: "Местоположение",     icon: MapPin,      required: false },
                { key: "availableFrom", label: "Доступно с",         icon: Calendar,    required: false, type: "date" },
                { key: "availableTo",   label: "Доступно до",        icon: Calendar,    required: false, type: "date" },
              ] as { key: string; label: string; icon: React.ElementType; required: boolean; type?: string; hint?: string }[]
            ).map(({ key, label, icon: Icon, type, required, hint }) => (
              <div key={key}>
                <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-2)" }}>
                  {label} {required && <span style={{ color: "#DC2626" }}>*</span>}
                  {hint && <span className="font-normal ml-1" style={{ color: "var(--text-4)" }}>— {hint}</span>}
                </label>
                <div className="relative">
                  <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-4)" }} />
                  <input
                    type={type ?? "text"}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    required={required}
                    step={type === "number" ? "0.000001" : undefined}
                    min={type === "number" ? "0" : undefined}
                    className="w-full rounded-[12px] pl-9 pr-4 py-3 text-sm outline-none"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-1)" }}
                  />
                </div>
              </div>
            ))}

            {/* ── Description ───────────────────────────────────────────── */}
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-2)" }}>
                Описание <span style={{ color: "#DC2626" }}>*</span>
              </label>
              <div className="relative">
                <AlignLeft size={15} className="absolute left-3.5 top-3.5" style={{ color: "var(--text-4)" }} />
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  required
                  rows={4}
                  className="w-full rounded-[12px] pl-9 pr-4 py-3 text-sm outline-none resize-none"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-1)" }}
                />
              </div>
            </div>

            {/* ── Currency info ─────────────────────────────────────────── */}
            <div
              className="flex items-center gap-3 rounded-[12px] px-4 py-3"
              style={{ background: "rgba(20,241,149,0.06)", border: "1px solid rgba(20,241,149,0.15)" }}
            >
              <Tag size={14} style={{ color: "#14F195" }} className="shrink-0" />
              <p className="text-xs" style={{ color: "var(--text-3)" }}>
                Расчёты в <span className="font-bold" style={{ color: "#14F195" }}>SOL (Wrapped)</span> — залог блокируется в escrow
              </p>
            </div>

            {/* ── Error ─────────────────────────────────────────────────── */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-start gap-3 rounded-[12px] px-4 py-3"
                  style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)" }}
                >
                  <AlertCircle size={15} className="shrink-0 mt-0.5" style={{ color: "#DC2626" }} />
                  <p className="text-sm" style={{ color: "#DC2626" }}>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Submit ────────────────────────────────────────────────── */}
            <button
              type="submit"
              disabled={submitting || hasPendingUpload}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-[14px] text-sm font-bold text-white transition-all disabled:opacity-50 cursor-pointer"
              style={{ background: "linear-gradient(135deg, #2B44D0 0%, #1B2BB8 100%)", boxShadow: "0 4px 18px rgba(27,43,184,0.35)" }}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {hasPendingUpload ? "Загрузка фото…" : "Сохранение…"}
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Сохранить изменения
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
