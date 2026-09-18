import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Plus, Trash2, Upload, X, Video } from "lucide-react";

import { supabase } from "../lib/supabase";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 10;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const MAX_VIDEOS = 5;

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    category: "",
    brand: "",
    description: "",
    price: "",
    original_price: "",
    stock: "0",
    condition: "Refurbished",
    is_active: true,
    is_featured: false,
  });

  const [images, setImages] = useState([]);
  const [mainImage, setMainImage] = useState("");
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [mainNewImageIndex, setMainNewImageIndex] = useState(null);
  const [removedExistingImages, setRemovedExistingImages] = useState([]);

  /* Existing product videos. */
  const [videos, setVideos] = useState([]);

  /* New video files selected during this edit. */
  const [newVideoFiles, setNewVideoFiles] = useState([]);
  const [newVideoPreviews, setNewVideoPreviews] = useState([]);

  /* Existing videos marked for deletion after a successful save. */
  const [removedExistingVideos, setRemovedExistingVideos] = useState([]);

  const [specifications, setSpecifications] = useState([
    { key: "", value: "" },
  ]);

  useEffect(() => {
    let isMounted = true;
    loadProduct(isMounted);
    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    const previews = newImageFiles.map((file) => URL.createObjectURL(file));
    setNewImagePreviews(previews);

    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newImageFiles]);

  useEffect(() => {
    const previews = newVideoFiles.map((file) => URL.createObjectURL(file));
    setNewVideoPreviews(previews);

    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newVideoFiles]);

  async function loadProduct(isMounted = true) {
    try {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        navigate("/admin/login");
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Product loading error:", error);
        if (isMounted) setErrorMessage(error.message);
        return;
      }

      if (!data) {
        if (isMounted) setErrorMessage("Product not found.");
        return;
      }

      if (!isMounted) return;

      setForm({
        name: data.name || "",
        slug: data.slug || "",
        category: data.category || "",
        brand: data.brand || "",
        description: data.description || "",
        price: data.price ?? "",
        original_price: data.original_price ?? "",
        stock: data.stock ?? "0",
        condition: data.condition || "Refurbished",
        is_active: data.is_active ?? true,
        is_featured: data.is_featured ?? false,
      });

      const existingImages = Array.isArray(data.images)
        ? data.images.filter(
            (image) => typeof image === "string" && image.trim() !== ""
          )
        : [];

      const finalExistingImages = data.image_url
        ? [
            data.image_url,
            ...existingImages.filter((image) => image !== data.image_url),
          ]
        : existingImages;

      setImages(finalExistingImages);
      setMainImage(data.image_url || finalExistingImages[0] || "");

      const existingVideos = Array.isArray(data.videos)
        ? data.videos.filter(
            (video) => typeof video === "string" && video.trim() !== ""
          )
        : [];

      setVideos(existingVideos);
      setNewImageFiles([]);
      setMainNewImageIndex(null);
      setRemovedExistingImages([]);
      setNewVideoFiles([]);
      setRemovedExistingVideos([]);

      const specificationEntries =
        data.specifications && typeof data.specifications === "object"
          ? Object.entries(data.specifications)
          : [];

      if (specificationEntries.length > 0) {
        setSpecifications(
          specificationEntries.map(([key, value]) => ({
            key: String(key),
            value: String(value ?? ""),
          }))
        );
      } else {
        setSpecifications([{ key: "", value: "" }]);
      }
    } catch (error) {
      console.error("Unexpected product loading error:", error);
      if (isMounted) {
        setErrorMessage(error?.message || "Unable to load product.");
      }
    } finally {
      if (isMounted) setLoading(false);
    }
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function createSlug(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function handleNameChange(value) {
    setForm((current) => ({
      ...current,
      name: value,
      slug: createSlug(value),
    }));
  }

  function addSpecification() {
    setSpecifications((current) => [...current, { key: "", value: "" }]);
  }

  function removeSpecification(index) {
    setSpecifications((current) =>
      current.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  function updateSpecification(index, field, value) {
    setSpecifications((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  }

  function handleNewImages(event) {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = "";

    if (selectedFiles.length === 0) return;
    setErrorMessage("");

    const currentImageCount = images.length + newImageFiles.length;
    const remainingSlots = MAX_IMAGES - currentImageCount;

    if (remainingSlots <= 0) {
      setErrorMessage(`You can have a maximum of ${MAX_IMAGES} product images.`);
      return;
    }

    const filesToCheck = selectedFiles.slice(0, remainingSlots);

    if (selectedFiles.length > remainingSlots) {
      setErrorMessage(
        `Only ${remainingSlots} more image${remainingSlots !== 1 ? "s" : ""} can be added. Maximum is ${MAX_IMAGES} images.`
      );
    }

    const validFiles = [];

    filesToCheck.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > MAX_IMAGE_SIZE) return;
      validFiles.push(file);
    });

    if (validFiles.length < filesToCheck.length) {
      setErrorMessage(
        "Some images were not added. Images must be valid image files and no larger than 5 MB each."
      );
    }

    if (validFiles.length > 0) {
      setNewImageFiles((current) => [...current, ...validFiles]);
    }
  }

  function handleNewVideos(event) {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = "";

    if (selectedFiles.length === 0) return;
    setErrorMessage("");

    const currentVideoCount = videos.length + newVideoFiles.length;
    const remainingSlots = MAX_VIDEOS - currentVideoCount;

    if (remainingSlots <= 0) {
      setErrorMessage(`You can have a maximum of ${MAX_VIDEOS} product videos.`);
      return;
    }

    const filesToCheck = selectedFiles.slice(0, remainingSlots);
    const validFiles = [];

    filesToCheck.forEach((file) => {
      if (!file.type.startsWith("video/")) return;
      if (file.size > MAX_VIDEO_SIZE) return;
      validFiles.push(file);
    });

    if (selectedFiles.length > remainingSlots) {
      setErrorMessage(
        `Only ${remainingSlots} more video${remainingSlots !== 1 ? "s" : ""} can be added. Maximum is ${MAX_VIDEOS} videos.`
      );
    }

    if (validFiles.length < filesToCheck.length) {
      setErrorMessage(
        "Some videos were not added. Videos must be valid video files and no larger than 50 MB each."
      );
    }

    if (validFiles.length > 0) {
      setNewVideoFiles((current) => [...current, ...validFiles]);
    }
  }

  function removeExistingImage(imageUrl) {
    const wasMainImage = mainImage === imageUrl;

    setImages((current) => current.filter((image) => image !== imageUrl));
    setRemovedExistingImages((current) =>
      current.includes(imageUrl) ? current : [...current, imageUrl]
    );

    if (wasMainImage) {
      const remainingImages = images.filter((image) => image !== imageUrl);
      setMainImage(remainingImages[0] || "");
      setMainNewImageIndex(null);
    }
  }

  function removeNewImage(index) {
    setNewImageFiles((current) =>
      current.filter((_, fileIndex) => fileIndex !== index)
    );

    if (mainNewImageIndex === index) setMainNewImageIndex(null);

    if (mainNewImageIndex !== null && index < mainNewImageIndex) {
      setMainNewImageIndex(mainNewImageIndex - 1);
    }
  }

  function removeExistingVideo(videoUrl) {
    setVideos((current) => current.filter((video) => video !== videoUrl));
    setRemovedExistingVideos((current) =>
      current.includes(videoUrl) ? current : [...current, videoUrl]
    );
  }

  function removeNewVideo(index) {
    setNewVideoFiles((current) =>
      current.filter((_, fileIndex) => fileIndex !== index)
    );
  }

  function makeExistingImageMain(imageUrl) {
    setMainImage(imageUrl);
    setMainNewImageIndex(null);
  }

  function makeNewImageMain(index) {
    if (!newImageFiles[index]) return;
    setMainImage("");
    setMainNewImageIndex(index);
  }

  function getStoragePathFromPublicUrl(fileUrl) {
    if (!fileUrl) return null;

    try {
      const url = new URL(fileUrl);
      const marker = "/storage/v1/object/public/product-images/";
      const markerIndex = url.pathname.indexOf(marker);

      if (markerIndex === -1) return null;

      const storagePath = url.pathname.substring(markerIndex + marker.length);
      if (!storagePath) return null;

      return decodeURIComponent(storagePath);
    } catch (error) {
      console.error("Unable to extract Storage path:", error);
      return null;
    }
  }

  async function deleteRemovedMediaFromStorage() {
    const imagePaths = removedExistingImages
      .map(getStoragePathFromPublicUrl)
      .filter(Boolean);

    const videoPaths = removedExistingVideos
      .map(getStoragePathFromPublicUrl)
      .filter(Boolean);

    const storagePaths = [...imagePaths, ...videoPaths];

    if (storagePaths.length === 0) return;

    try {
      const { error } = await supabase.storage
        .from("product-images")
        .remove(storagePaths);

      if (error) {
        console.error("Storage cleanup error:", error);
        setErrorMessage(
          "Product updated, but one or more removed media files could not be deleted from Storage."
        );
      }
    } catch (error) {
      console.error("Unexpected Storage cleanup error:", error);
      setErrorMessage(
        "Product updated, but one or more removed media files could not be deleted from Storage."
      );
    }
  }

  async function uploadNewImages() {
    const uploadedUrls = [];

    try {
      for (const file of newImageFiles) {
        const extension =
          file.name.split(".").pop()?.toLowerCase() || "jpg";
        const fileName = `${crypto.randomUUID()}.${extension}`;
        const filePath = `products/${fileName}`;

        const { error } = await supabase.storage
          .from("product-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) throw error;

        const { data } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        if (!data?.publicUrl) {
          throw new Error("Unable to create public URL for uploaded image.");
        }

        uploadedUrls.push(data.publicUrl);
      }

      return uploadedUrls;
    } catch (error) {
      if (uploadedUrls.length > 0) await cleanupUploadedMedia(uploadedUrls);
      throw error;
    }
  }

  async function uploadNewVideos() {
    const uploadedUrls = [];

    try {
      for (const file of newVideoFiles) {
        const extension =
          file.name.split(".").pop()?.toLowerCase() || "mp4";
        const fileName = `${crypto.randomUUID()}.${extension}`;
        const filePath = `products/videos/${fileName}`;

        const { error } = await supabase.storage
          .from("product-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) throw error;

        const { data } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        if (!data?.publicUrl) {
          throw new Error("Unable to create public URL for uploaded video.");
        }

        uploadedUrls.push(data.publicUrl);
      }

      return uploadedUrls;
    } catch (error) {
      if (uploadedUrls.length > 0) await cleanupUploadedMedia(uploadedUrls);
      throw error;
    }
  }

  async function cleanupUploadedMedia(uploadedUrls) {
    if (!uploadedUrls || uploadedUrls.length === 0) return;

    const storagePaths = uploadedUrls
      .map(getStoragePathFromPublicUrl)
      .filter(Boolean);

    if (storagePaths.length === 0) return;

    try {
      const { error } = await supabase.storage
        .from("product-images")
        .remove(storagePaths);

      if (error) console.error("Unable to clean up uploaded media:", error);
    } catch (error) {
      console.error("Unexpected media cleanup error:", error);
    }
  }

  function validateForm() {
    const trimmedName = form.name.trim();
    const trimmedCategory = form.category.trim();

    if (!trimmedName) return "Please enter the product name.";
    if (!trimmedCategory) return "Please enter the category.";

    if (form.price === "" || form.price === null || form.price === undefined) {
      return "Please enter the selling price.";
    }

    const price = Number(form.price);
    if (!Number.isFinite(price)) return "Selling price must be a valid number.";
    if (price < 0) return "Selling price cannot be negative.";

    if (
      form.original_price !== "" &&
      form.original_price !== null &&
      form.original_price !== undefined
    ) {
      const originalPrice = Number(form.original_price);
      if (!Number.isFinite(originalPrice)) {
        return "Original price must be a valid number.";
      }
      if (originalPrice < 0) return "Original price cannot be negative.";
      if (originalPrice < price) {
        return "Original price should be equal to or higher than the selling price.";
      }
    }

    const stock = Number(form.stock || 0);
    if (!Number.isFinite(stock)) return "Stock must be a valid number.";
    if (!Number.isInteger(stock)) return "Stock must be a whole number.";
    if (stock < 0) return "Stock cannot be negative.";

    if (images.length + newImageFiles.length > MAX_IMAGES) {
      return `A maximum of ${MAX_IMAGES} product images are allowed.`;
    }

    if (videos.length + newVideoFiles.length > MAX_VIDEOS) {
      return `A maximum of ${MAX_VIDEOS} product videos are allowed.`;
    }

    const specificationKeys = new Set();

    for (const item of specifications) {
      const key = item.key.trim();
      if (!key) continue;

      const normalizedKey = key.toLowerCase();
      if (specificationKeys.has(normalizedKey)) {
        return `Duplicate specification: "${key}".`;
      }

      specificationKeys.add(normalizedKey);
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    let uploadedUrls = [];
    let uploadedVideoUrls = [];

    try {
      setSaving(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        navigate("/admin/login");
        return;
      }

      uploadedUrls = await uploadNewImages();
      uploadedVideoUrls = await uploadNewVideos();

      const allImages = [...images, ...uploadedUrls];
      const uniqueImages = Array.from(new Set(allImages));

      let finalMainImage = mainImage;

      if (
        mainNewImageIndex !== null &&
        uploadedUrls[mainNewImageIndex]
      ) {
        finalMainImage = uploadedUrls[mainNewImageIndex];
      }

      if (finalMainImage && !uniqueImages.includes(finalMainImage)) {
        finalMainImage = "";
      }

      if (!finalMainImage && uniqueImages.length > 0) {
        finalMainImage = uniqueImages[0];
      }

      const finalImages = finalMainImage
        ? [
            finalMainImage,
            ...uniqueImages.filter((image) => image !== finalMainImage),
          ]
        : uniqueImages;

      const finalVideos = Array.from(
        new Set([...videos, ...uploadedVideoUrls])
      );

      const specificationObject = {};
      specifications.forEach((item) => {
        const key = item.key.trim();
        const value = item.value.trim();
        if (key && value) specificationObject[key] = value;
      });

      const updateData = {
        name: form.name.trim(),
        slug: form.slug.trim() || createSlug(form.name),
        category: form.category.trim(),
        brand: form.brand.trim() || null,
        description: form.description.trim() || null,
        price: Number(form.price),
        original_price:
          form.original_price !== "" ? Number(form.original_price) : null,
        stock: Number(form.stock || 0),
        condition: form.condition.trim() || "Refurbished",
        image_url: finalMainImage || null,
        images: finalImages,
        videos: finalVideos,
        specifications: specificationObject,
        is_active: Boolean(form.is_active),
        is_featured: Boolean(form.is_featured),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      await deleteRemovedMediaFromStorage();

      alert("Product updated successfully.");
      navigate("/admin");
    } catch (error) {
      console.error("Edit product error:", error);

      const cleanupUrls = [...uploadedUrls, ...uploadedVideoUrls];
      if (cleanupUrls.length > 0) await cleanupUploadedMedia(cleanupUrls);

      setErrorMessage(error?.message || "Unable to update product.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-[#DDE3EA] border-t-[#0F2B5B]" />
          <p className="mt-4 text-sm text-[#718096]">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F6]">
      <header className="border-b border-[#E3E9F1] bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-5">
          <button
            type="button"
            onClick={() => navigate("/admin")}
            disabled={saving}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#DDE3EA] text-[#0F2B5B] hover:bg-[#F7F9FC] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-[#0F2B5B]">Edit Product</h1>
            <p className="mt-1 text-sm text-[#718096]">Update product information</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-2xl border border-[#E3E9F1] bg-white p-6">
            <h2 className="text-lg font-bold text-[#0F2B5B]">Basic Information</h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-[#334155]">Product Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  required
                  disabled={saving}
                  className="mt-2 w-full rounded-xl border border-[#DDE3EA] px-4 py-3 outline-none focus:border-[#0F2B5B] focus:ring-2 focus:ring-[#0F2B5B]/10 disabled:bg-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#334155]">Category *</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(event) => updateField("category", event.target.value)}
                  required
                  disabled={saving}
                  className="mt-2 w-full rounded-xl border border-[#DDE3EA] px-4 py-3 outline-none focus:border-[#0F2B5B] focus:ring-2 focus:ring-[#0F2B5B]/10 disabled:bg-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#334155]">Brand</label>
                <input
                  type="text"
                  value={form.brand}
                  onChange={(event) => updateField("brand", event.target.value)}
                  disabled={saving}
                  className="mt-2 w-full rounded-xl border border-[#DDE3EA] px-4 py-3 outline-none focus:border-[#0F2B5B] focus:ring-2 focus:ring-[#0F2B5B]/10 disabled:bg-[#F8FAFC]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-[#334155]">Product Description</label>
                <textarea
                  rows={5}
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  disabled={saving}
                  className="mt-2 w-full resize-none rounded-xl border border-[#DDE3EA] px-4 py-3 outline-none focus:border-[#0F2B5B] focus:ring-2 focus:ring-[#0F2B5B]/10 disabled:bg-[#F8FAFC]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-[#334155]">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(event) => updateField("slug", event.target.value)}
                  disabled={saving}
                  className="mt-2 w-full rounded-xl border border-[#DDE3EA] bg-[#F8FAFC] px-4 py-3 text-sm outline-none focus:border-[#0F2B5B] disabled:cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-[#94A3B8]">Used internally for the product URL.</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#E3E9F1] bg-white p-6">
            <h2 className="text-lg font-bold text-[#0F2B5B]">Price & Stock</h2>

            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <div>
                <label className="text-sm font-semibold text-[#334155]">Selling Price *</label>
                <div className="relative mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#718096]">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(event) => updateField("price", event.target.value)}
                    required
                    disabled={saving}
                    className="w-full rounded-xl border border-[#DDE3EA] py-3 pl-9 pr-4 outline-none focus:border-[#0F2B5B] focus:ring-2 focus:ring-[#0F2B5B]/10 disabled:bg-[#F8FAFC]"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-[#334155]">Original Price</label>
                <div className="relative mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#718096]">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.original_price}
                    onChange={(event) => updateField("original_price", event.target.value)}
                    disabled={saving}
                    className="w-full rounded-xl border border-[#DDE3EA] py-3 pl-9 pr-4 outline-none focus:border-[#0F2B5B] focus:ring-2 focus:ring-[#0F2B5B]/10 disabled:bg-[#F8FAFC]"
                  />
                </div>
                <p className="mt-1 text-xs text-[#94A3B8]">Should be equal to or higher than the selling price.</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-[#334155]">Stock</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={(event) => updateField("stock", event.target.value)}
                  disabled={saving}
                  className="mt-2 w-full rounded-xl border border-[#DDE3EA] px-4 py-3 outline-none focus:border-[#0F2B5B] focus:ring-2 focus:ring-[#0F2B5B]/10 disabled:bg-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#334155]">Condition</label>
                <select
                  value={form.condition}
                  onChange={(event) => updateField("condition", event.target.value)}
                  disabled={saving}
                  className="mt-2 w-full rounded-xl border border-[#DDE3EA] bg-white px-4 py-3 outline-none focus:border-[#0F2B5B] focus:ring-2 focus:ring-[#0F2B5B]/10 disabled:bg-[#F8FAFC]"
                >
                  <option value="Refurbished">Refurbished</option>
                  <option value="New">New</option>
                  <option value="Used">Used</option>
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#E3E9F1] bg-white p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#0F2B5B]">Specifications</h2>
                <p className="mt-1 text-sm text-[#718096]">Add or edit processor, RAM, storage, display and other details.</p>
              </div>

              <button
                type="button"
                onClick={addSpecification}
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#DDE3EA] px-4 py-2.5 text-sm font-semibold text-[#0F2B5B] hover:bg-[#F7F9FC] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={17} /> Add Specification
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {specifications.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Specification"
                    value={item.key}
                    onChange={(event) => updateSpecification(index, "key", event.target.value)}
                    disabled={saving}
                    className="flex-1 rounded-xl border border-[#DDE3EA] px-4 py-3 text-sm outline-none focus:border-[#0F2B5B] disabled:bg-[#F8FAFC]"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={item.value}
                    onChange={(event) => updateSpecification(index, "value", event.target.value)}
                    disabled={saving}
                    className="flex-1 rounded-xl border border-[#DDE3EA] px-4 py-3 text-sm outline-none focus:border-[#0F2B5B] disabled:bg-[#F8FAFC]"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecification(index)}
                    disabled={saving}
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Remove specification"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#E3E9F1] bg-white p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#0F2B5B]">Product Images</h2>
                <p className="mt-1 text-sm text-[#718096]">Add multiple images and choose any image as the main product image.</p>
                <p className="mt-1 text-xs text-[#94A3B8]">Maximum {MAX_IMAGES} images • Maximum 5 MB per image</p>
              </div>

              <label
                className={`flex items-center justify-center gap-2 rounded-xl bg-[#0F2B5B] px-4 py-2.5 text-sm font-semibold text-white ${
                  saving || images.length + newImageFiles.length >= MAX_IMAGES
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:bg-[#17396F]"
                }`}
              >
                <Upload size={17} /> Add Images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleNewImages}
                  disabled={saving || images.length + newImageFiles.length >= MAX_IMAGES}
                  className="hidden"
                />
              </label>
            </div>

            {(images.length > 0 || newImageFiles.length > 0) && (
              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {images.map((imageUrl) => (
                  <div
                    key={imageUrl}
                    className={`relative overflow-hidden rounded-xl border ${
                      mainImage === imageUrl ? "border-2 border-[#0F2B5B]" : "border-[#DDE3EA]"
                    }`}
                  >
                    <img src={imageUrl} alt="Product" className="h-36 w-full object-cover" />
                    {mainImage === imageUrl && (
                      <span className="absolute left-2 top-2 rounded-lg bg-[#0F2B5B] px-2 py-1 text-xs font-semibold text-white">Main</span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeExistingImage(imageUrl)}
                      disabled={saving}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-red-600 shadow disabled:cursor-not-allowed disabled:opacity-50"
                      title="Remove image"
                    >
                      <X size={16} />
                    </button>
                    {mainImage !== imageUrl && (
                      <button
                        type="button"
                        onClick={() => makeExistingImageMain(imageUrl)}
                        disabled={saving}
                        className="absolute bottom-2 left-2 rounded-lg bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-[#0F2B5B] shadow disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Make Main
                      </button>
                    )}
                  </div>
                ))}

                {newImageFiles.map((file, index) => {
                  const isMain = mainNewImageIndex === index;
                  return (
                    <div
                      key={`${file.name}-${index}`}
                      className={`relative overflow-hidden rounded-xl border ${
                        isMain ? "border-2 border-[#0F2B5B]" : "border-dashed border-[#94A3B8]"
                      }`}
                    >
                      <img src={newImagePreviews[index]} alt={file.name} className="h-36 w-full object-cover" />
                      {isMain ? (
                        <span className="absolute left-2 top-2 rounded-lg bg-[#0F2B5B] px-2 py-1 text-xs font-semibold text-white">Main</span>
                      ) : (
                        <span className="absolute left-2 top-2 rounded-lg bg-white/95 px-2 py-1 text-xs font-semibold text-[#0F2B5B] shadow">New</span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        disabled={saving}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-red-600 shadow disabled:cursor-not-allowed disabled:opacity-50"
                        title="Remove image"
                      >
                        <X size={16} />
                      </button>
                      {!isMain && (
                        <button
                          type="button"
                          onClick={() => makeNewImageMain(index)}
                          disabled={saving}
                          className="absolute bottom-2 left-2 rounded-lg bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-[#0F2B5B] shadow disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Make Main
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {images.length === 0 && newImageFiles.length === 0 && (
              <div className="mt-5 rounded-xl border border-dashed border-[#CBD5E1] px-6 py-10 text-center">
                <Upload size={30} className="mx-auto text-[#94A3B8]" />
                <p className="mt-3 text-sm font-medium text-[#475569]">No images added</p>
                <p className="mt-1 text-xs text-[#94A3B8]">Add one or more product images.</p>
              </div>
            )}

            {removedExistingImages.length > 0 && (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm font-semibold text-amber-800">
                  {removedExistingImages.length} existing image{removedExistingImages.length !== 1 ? "s" : ""} marked for removal
                </p>
                <p className="mt-1 text-xs leading-5 text-amber-700">The image files will be permanently removed from Storage when you save these changes.</p>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-[#E3E9F1] bg-white p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#0F2B5B]">Product Videos</h2>
                <p className="mt-1 text-sm text-[#718096]">Add videos showing the product working or its condition.</p>
                <p className="mt-1 text-xs text-[#94A3B8]">Maximum {MAX_VIDEOS} videos • Maximum 50 MB per video</p>
              </div>

              <label
                className={`flex items-center justify-center gap-2 rounded-xl bg-[#0F2B5B] px-4 py-2.5 text-sm font-semibold text-white ${
                  saving || videos.length + newVideoFiles.length >= MAX_VIDEOS
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:bg-[#17396F]"
                }`}
              >
                <Video size={17} /> Add Videos
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleNewVideos}
                  disabled={saving || videos.length + newVideoFiles.length >= MAX_VIDEOS}
                  className="hidden"
                />
              </label>
            </div>

            {(videos.length > 0 || newVideoFiles.length > 0) && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {videos.map((videoUrl) => (
                  <div key={videoUrl} className="relative overflow-hidden rounded-xl border border-[#DDE3EA] bg-[#F8FAFC]">
                    <video src={videoUrl} controls preload="metadata" className="h-56 w-full bg-black object-contain" />
                    <button
                      type="button"
                      onClick={() => removeExistingVideo(videoUrl)}
                      disabled={saving}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-red-600 shadow disabled:cursor-not-allowed disabled:opacity-50"
                      title="Remove video"
                    >
                      <X size={16} />
                    </button>
                    <span className="absolute left-2 top-2 rounded-lg bg-[#0F2B5B] px-2 py-1 text-xs font-semibold text-white">Existing</span>
                  </div>
                ))}

                {newVideoFiles.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="relative overflow-hidden rounded-xl border border-dashed border-[#94A3B8] bg-[#F8FAFC]">
                    <video src={newVideoPreviews[index]} controls preload="metadata" className="h-56 w-full bg-black object-contain" />
                    <button
                      type="button"
                      onClick={() => removeNewVideo(index)}
                      disabled={saving}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-red-600 shadow disabled:cursor-not-allowed disabled:opacity-50"
                      title="Remove video"
                    >
                      <X size={16} />
                    </button>
                    <span className="absolute left-2 top-2 rounded-lg bg-white/95 px-2 py-1 text-xs font-semibold text-[#0F2B5B] shadow">New</span>
                    <p className="px-3 py-2 text-xs text-[#718096] truncate">{file.name}</p>
                  </div>
                ))}
              </div>
            )}

            {videos.length === 0 && newVideoFiles.length === 0 && (
              <div className="mt-5 rounded-xl border border-dashed border-[#CBD5E1] px-6 py-10 text-center">
                <Video size={30} className="mx-auto text-[#94A3B8]" />
                <p className="mt-3 text-sm font-medium text-[#475569]">No videos added</p>
                <p className="mt-1 text-xs text-[#94A3B8]">Videos are optional.</p>
              </div>
            )}

            {removedExistingVideos.length > 0 && (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm font-semibold text-amber-800">
                  {removedExistingVideos.length} existing video{removedExistingVideos.length !== 1 ? "s" : ""} marked for removal
                </p>
                <p className="mt-1 text-xs leading-5 text-amber-700">The video files will be permanently removed from Storage when you save these changes.</p>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-[#E3E9F1] bg-white p-6">
            <h2 className="text-lg font-bold text-[#0F2B5B]">Website Settings</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[#E3E9F1] p-4">
                <div>
                  <p className="font-semibold text-[#0F2B5B]">Active Product</p>
                  <p className="mt-1 text-xs text-[#718096]">Show or hide this product from the website.</p>
                </div>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(event) => updateField("is_active", event.target.checked)}
                  disabled={saving}
                  className="h-5 w-5"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[#E3E9F1] p-4">
                <div>
                  <p className="font-semibold text-[#0F2B5B]">Featured Product</p>
                  <p className="mt-1 text-xs text-[#718096]">Highlight this product in featured products.</p>
                </div>
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(event) => updateField("is_featured", event.target.checked)}
                  disabled={saving}
                  className="h-5 w-5"
                />
              </label>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/admin")}
              disabled={saving}
              className="rounded-xl border border-[#DDE3EA] bg-white px-6 py-3.5 text-sm font-semibold text-[#0F2B5B] hover:bg-[#F7F9FC] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#0F2B5B] px-7 py-3.5 text-sm font-semibold text-white hover:bg-[#17396F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Saving Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
