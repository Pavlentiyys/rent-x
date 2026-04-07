"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  AlertCircle,
} from "lucide-react";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { Header } from "@/components/sections/Header";
import { useWalletContext } from "@/components/ui/WalletContext";
import { createPost, getUploadUrl, uploadFileToStorage } from "@/lib/api-client";
import {
  initializeUser,
  createOnChainListing,
  userProfileExists,
  listingExists,
  toListingSeed,
} from "@/lib/anchor-client";

const SOL_MINT = "So11111111111111111111111111111111111111112";

const CATEGORIES = [
  "Электроника", "Техника", "Транспорт", "Спорт",
  "Инструменты", "Одежда", "Туризм", "Музыка", "Другое",
];

interface PendingImage {
  localId: string;
  file: File;
  preview: string;
  uploading: boolean;
  error: string | null;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function CreateListingPage() {
  const { connected, authToken } = useWalletContext();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "", description: "", category: "",
    pricePerDay: "", depositAmount: "",
    location: "", availableFrom: "", availableTo: "",
  });
  const [images, setImages] = useState<PendingImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!connected) router.replace("/");
  }, [connected, router]);

  if (!connected) return null;

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) { setError(`"${file.name}" превышает 10 МБ`); return; }
      if (!file.type.startsWith("image/")) { setError(`"${file.name}" не является изображением`); return; }
    }
    const pending: PendingImage[] = files.map((file) => ({
      localId: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      error: null,
    }));
    setImages((prev) => [...prev, ...pending]);
    setError(null);
  };

  const removeImage = (localId: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.localId === localId);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.localId !== localId);
    });
  };

  const uploadAllImages = async (): Promise<{ objectKey: string; url: string; sortOrder: number }[]> => {
    if (!authToken) throw new Error("Нет токена");
    const result: { objectKey: string; url: string; sortOrder: number }[] = [];

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      setImages((prev) => prev.map((x) => x.localId === img.localId ? { ...x, uploading: true, error: null } : x));
      try {
        const { objectKey, uploadUrl, fileUrl } = await getUploadUrl(authToken, img.file.name, img.file.type, img.file.size);
        await uploadFileToStorage(uploadUrl, img.file);
        result.push({ objectKey, url: fileUrl, sortOrder: i });
        setImages((prev) => prev.map((x) => x.localId === img.localId ? { ...x, uploading: false } : x));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Ошибка загрузки";
        setImages((prev) => prev.map((x) => x.localId === img.localId ? { ...x, uploading: false, error: msg } : x));
        throw new Error(`Не удалось загрузить "${img.file.name}": ${msg}`);
      }
    }
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) { setError("Необходимо подключить кошелёк"); return; }
    if (!form.category) { setError("Выберите категорию"); return; }

    const priceRaw = parseFloat(form.pricePerDay);
    const depositRaw = parseFloat(form.depositAmount);
    if (isNaN(priceRaw) || priceRaw <= 0) { setError("Укажите корректную цену"); return; }
    if (isNaN(depositRaw) || depositRaw <= 0) { setError("Укажите корректный залог"); return; }

    if (!anchorWallet) { setError("Кошелёк не найден"); return; }

    setLoading(true);
    setError(null);

    try {
      // 1. Ensure on-chain UserProfile PDA exists
      const hasProfile = await userProfileExists(connection, anchorWallet, anchorWallet.publicKey);
      if (!hasProfile) {
        await initializeUser(connection, anchorWallet);
      }

      // 2. Create on-chain RentalListing PDA (skip if already exists)
      const priceLamports = new BN(Math.round(priceRaw * LAMPORTS_PER_SOL));
      const depositLamports = new BN(Math.round(depositRaw * LAMPORTS_PER_SOL));
      // Use title as item_name — must be ≤32 bytes (Solana PDA seed limit)
      const itemName = toListingSeed(form.title);
      // On-chain description max 256 chars
      const onChainDesc = form.description.slice(0, 256);
      const onChainCategory = form.category.slice(0, 32);

      const alreadyExists = await listingExists(connection, anchorWallet, anchorWallet.publicKey, itemName);
      if (!alreadyExists) {
        await createOnChainListing(
          connection,
          anchorWallet,
          itemName,
          onChainDesc,
          priceLamports,
          depositLamports,
          onChainCategory,
        );
      }

      // 3. Upload images and save to backend API
      const uploadedImages = await uploadAllImages();

      await createPost(authToken, {
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
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
      });

      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка создания листинга");
    } finally {
      setLoading(false);
    }
  };

  const isUploading = images.some((i) => i.uploading);

  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--page-bg)" }}>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
            <CheckCircle2 size={64} style={{ color: "#14F195" }} />
          </motion.div>
          <h2 className="text-xl font-bold" style={{ color: "var(--text-1)" }}>Листинг опубликован!</h2>
          <p className="text-sm" style={{ color: "var(--text-3)" }}>Перенаправление в личный кабинет…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--page-bg)" }}>
      <Header />
      <main className="relative z-10 rounded-t-[2.5rem]" style={{ background: "var(--main-bg)" }}>
        <div className="max-w-2xl mx-auto px-4 pt-10 pb-20">

          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm mb-8 hover:opacity-70 transition-opacity cursor-pointer" style={{ color: "var(--text-3)" }}>
            <ArrowLeft size={15} /> Назад
          </button>

          <div className="mb-8">
            <h1 className="text-3xl font-black mb-2" style={{ color: "var(--text-1)", letterSpacing: "-0.03em" }}>Новый листинг</h1>
            <p className="text-sm" style={{ color: "var(--text-3)" }}>Заполните данные — ваш товар появится в каталоге сразу после публикации</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Images ──────────────────────────────────────────────────── */}
            <div>
              <label className="block text-xs font-semibold mb-3" style={{ color: "var(--text-2)" }}>
                Фотографии
                <span className="font-normal ml-1" style={{ color: "var(--text-4)" }}>— до 20 шт., до 10 МБ каждая</span>
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                <AnimatePresence>
                  {images.map((img, idx) => (
                    <motion.div
                      key={img.localId}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.18 }}
                      className="relative aspect-square rounded-[14px] overflow-hidden"
                      style={{ border: "1px solid var(--border)", background: "var(--surface-2)" }}
                    >
                      <Image src={img.preview} alt="" fill className="object-cover" unoptimized />

                      {/* Uploading overlay */}
                      {img.uploading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1" style={{ background: "rgba(0,0,0,0.55)" }}>
                          <Loader2 size={20} className="animate-spin text-white" />
                          <span className="text-[9px] text-white font-semibold">Загрузка…</span>
                        </div>
                      )}

                      {/* Error overlay */}
                      {img.error && (
                        <div className="absolute inset-0 flex items-center justify-center p-2" style={{ background: "rgba(220,38,38,0.8)" }}>
                          <p className="text-[9px] text-white text-center leading-tight">{img.error}</p>
                        </div>
                      )}

                      {/* Remove */}
                      {!img.uploading && (
                        <button
                          type="button"
                          onClick={() => removeImage(img.localId)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
                          style={{ background: "rgba(0,0,0,0.6)" }}
                        >
                          <X size={11} className="text-white" />
                        </button>
                      )}

                      {/* Main badge */}
                      {idx === 0 && (
                        <div className="absolute bottom-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}>
                          Главное
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Add button */}
                {images.length < 20 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-[14px] flex flex-col items-center justify-center gap-2 transition-all hover:opacity-70 cursor-pointer"
                    style={{ border: "2px dashed var(--border)", background: "var(--surface)", color: "var(--text-4)" }}
                  >
                    <ImagePlus size={22} />
                    <span className="text-[10px] font-semibold">Добавить</span>
                  </button>
                )}
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
            </div>

            {/* ── Category ────────────────────────────────────────────────── */}
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

            {/* ── Text fields ─────────────────────────────────────────────── */}
            {(
              [
                { key: "title",         label: "Название",           placeholder: "Sony A7 IV Camera",  icon: Package,    required: true,  hint: "3–160 символов" },
                { key: "pricePerDay",   label: "Цена за день (SOL)", placeholder: "0.5",                icon: Coins,      required: true,  type: "number", hint: "Например: 0.5" },
                { key: "depositAmount", label: "Залог (SOL)",        placeholder: "2.0",                icon: ShieldCheck, required: true, type: "number", hint: "Возвращается после" },
                { key: "location",      label: "Местоположение",     placeholder: "Алматы, Казахстан",  icon: MapPin,     required: false },
                { key: "availableFrom", label: "Доступно с",         placeholder: "",                   icon: Calendar,   required: false, type: "date" },
                { key: "availableTo",   label: "Доступно до",        placeholder: "",                   icon: Calendar,   required: false, type: "date" },
              ] as { key: string; label: string; placeholder: string; icon: React.ElementType; required: boolean; type?: string; hint?: string }[]
            ).map(({ key, label, placeholder, icon: Icon, type, required, hint }) => (
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
                    placeholder={placeholder}
                    required={required}
                    step={type === "number" ? "0.000001" : undefined}
                    min={type === "number" ? "0" : undefined}
                    className="w-full rounded-[12px] pl-9 pr-4 py-3 text-sm outline-none"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-1)" }}
                  />
                </div>
              </div>
            ))}

            {/* ── Description ─────────────────────────────────────────────── */}
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-2)" }}>
                Описание <span style={{ color: "#DC2626" }}>*</span>
              </label>
              <div className="relative">
                <AlignLeft size={15} className="absolute left-3.5 top-3.5" style={{ color: "var(--text-4)" }} />
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Расскажите о товаре: состояние, комплектация, особенности…"
                  required
                  rows={4}
                  className="w-full rounded-[12px] pl-9 pr-4 py-3 text-sm outline-none resize-none"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-1)" }}
                />
              </div>
            </div>

            {/* ── Info ────────────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 rounded-[12px] px-4 py-3" style={{ background: "rgba(20,241,149,0.06)", border: "1px solid rgba(20,241,149,0.15)" }}>
              <Tag size={14} style={{ color: "#14F195" }} className="shrink-0" />
              <p className="text-xs" style={{ color: "var(--text-3)" }}>
                Расчёты в <span className="font-bold" style={{ color: "#14F195" }}>SOL (Wrapped)</span> — залог блокируется в смарт-контракте escrow
              </p>
            </div>

            {/* ── Error ───────────────────────────────────────────────────── */}
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

            {/* ── Submit ──────────────────────────────────────────────────── */}
            <button
              type="submit"
              disabled={loading || isUploading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-[14px] text-sm font-bold text-white transition-all disabled:opacity-50 cursor-pointer"
              style={{ background: "linear-gradient(135deg, #2B44D0 0%, #1B2BB8 100%)", boxShadow: "0 4px 18px rgba(27,43,184,0.35)" }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {isUploading ? "Загрузка фото…" : "Публикация…"}
                </>
              ) : (
                <>
                  <Package size={16} />
                  Опубликовать листинг
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
