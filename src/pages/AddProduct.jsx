import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

import { supabase } from "../lib/supabase";

export default function AddProduct() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [specifications, setSpecifications] = useState([
    { key: "", value: "" },
  ]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /*
   * ============================================================
   * NORMALIZE BRAND
   * ============================================================
   *
   * Examples:
   *
   * dell              -> Dell
   * DELL              -> Dell
   * hp                -> HP
   * asus              -> ASUS
   * benq              -> BenQ
   * western digital   -> Western Digital
   * WD                -> Western Digital
   *
   */

  function normalizeBrand(value) {
    const trimmed = value.trim();

    if (!trimmed) {
      return "";
    }

    const knownBrands = {
      dell: "Dell",
      hp: "HP",
      lenovo: "Lenovo",
      apple: "Apple",
      acer: "Acer",
      asus: "ASUS",
      epson: "Epson",
      benq: "BenQ",
      canon: "Canon",
      brother: "Brother",
      samsung: "Samsung",
      lg: "LG",
      microsoft: "Microsoft",
      intel: "Intel",
      amd: "AMD",
      kingston: "Kingston",
      crucial: "Crucial",
      logitech: "Logitech",

      "tp-link": "TP-Link",
      tplink: "TP-Link",

      "western digital": "Western Digital",
      wd: "Western Digital",
    };

    const key = trimmed.toLowerCase();

    if (knownBrands[key]) {
      return knownBrands[key];
    }

    /*
     * Unknown brand:
     *
     * "my brand" -> "My Brand"
     * "example"  -> "Example"
     */

    return trimmed
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  /*
   * ============================================================
   * HANDLE FORM CHANGE
   * ============================================================
   */

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  /*
   * ============================================================
   * CREATE SLUG
   * ============================================================
   */

  function createSlug(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /*
   * ============================================================
   * PRODUCT NAME CHANGE
   * ============================================================
   */

  function handleNameChange(event) {
    const value = event.target.value;

    setFormData((current) => ({
      ...current,
      name: value,
      slug: createSlug(value),
    }));
  }

  /*
   * ============================================================
   * IMAGE CHANGE
   * ============================================================
   */

  function handleImageChange(event) {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        return false;
      }

      if (file.size > 5 * 1024 * 1024) {
        return false;
      }

      return true;
    });

    if (validFiles.length !== files.length) {
      setErrorMessage(
        "Only image files up to 5 MB each can be uploaded."
      );
    } else {
      setErrorMessage("");
    }

    const newPreviews = validFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setImageFiles((current) => [
      ...current,
      ...validFiles,
    ]);

    setImagePreviews((current) => [
      ...current,
      ...newPreviews,
    ]);

    event.target.value = "";
  }

  /*
   * ============================================================
   * REMOVE IMAGE
   * ============================================================
   */

  function removeImage(index) {
    setImageFiles((current) =>
      current.filter(
        (_, imageIndex) => imageIndex !== index
      )
    );

    setImagePreviews((current) =>
      current.filter(
        (_, imageIndex) => imageIndex !== index
      )
    );
  }

  /*
   * ============================================================
   * ADD SPECIFICATION
   * ============================================================
   */

  function addSpecification() {
    setSpecifications((current) => [
      ...current,
      {
        key: "",
        value: "",
      },
    ]);
  }

  /*
   * ============================================================
   * REMOVE SPECIFICATION
   * ============================================================
   */

  function removeSpecification(index) {
    setSpecifications((current) =>
      current.filter(
        (_, specIndex) => specIndex !== index
      )
    );
  }

  /*
   * ============================================================
   * UPDATE SPECIFICATION
   * ============================================================
   */

  function updateSpecification(
    index,
    field,
    value
  ) {
    setSpecifications((current) =>
      current.map(
        (specification, specIndex) =>
          specIndex === index
            ? {
                ...specification,
                [field]: value,
              }
            : specification
      )
    );
  }

  /*
   * ============================================================
   * UPLOAD IMAGES
   * ============================================================
   */

  async function uploadImages() {
    const uploadedUrls = [];

    for (
      let index = 0;
      index < imageFiles.length;
      index += 1
    ) {
      const file = imageFiles[index];

      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      const fileName = `${Date.now()}-${index}-${Math.random()
        .toString(36)
        .substring(2, 10)}.${extension}`;

      const filePath = `products/${fileName}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from("product-images")
        .upload(
          filePath,
          file,
          {
            cacheControl: "3600",
            upsert: false,
          }
        );

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        throw new Error(
          "Unable to create public URL for uploaded image."
        );
      }

      uploadedUrls.push(
        publicUrlData.publicUrl
      );
    }

    return uploadedUrls;
  }

  /*
   * ============================================================
   * SUBMIT PRODUCT
   * ============================================================
   */

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");

    /*
     * BASIC VALIDATION
     */

    if (!formData.name.trim()) {
      setErrorMessage(
        "Please enter the product name."
      );
      return;
    }

    if (!formData.category.trim()) {
      setErrorMessage(
        "Please enter the product category."
      );
      return;
    }

    if (!formData.price) {
      setErrorMessage(
        "Please enter the selling price."
      );
      return;
    }

    if (Number(formData.price) < 0) {
      setErrorMessage(
        "Selling price cannot be negative."
      );
      return;
    }

    if (Number(formData.original_price) < 0) {
      setErrorMessage(
        "Original price cannot be negative."
      );
      return;
    }

    if (
      formData.original_price &&
      Number(formData.original_price) <
        Number(formData.price)
    ) {
      setErrorMessage(
        "Original price should be equal to or higher than the selling price."
      );
      return;
    }

    if (Number(formData.stock) < 0) {
      setErrorMessage(
        "Stock cannot be negative."
      );
      return;
    }

    if (imageFiles.length === 0) {
      setErrorMessage(
        "Please select at least one product image."
      );
      return;
    }

    try {
      setLoading(true);

      /*
       * ========================================================
       * CHECK AUTHENTICATION
       * ========================================================
       */

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        navigate("/admin/login");
        return;
      }

      /*
       * ========================================================
       * NORMALIZE BRAND
       * ========================================================
       */

      const normalizedBrand =
        normalizeBrand(formData.brand);

      /*
       * ========================================================
       * UPLOAD IMAGES
       * ========================================================
       */

      const uploadedImageUrls =
        await uploadImages();

      const mainImageUrl =
        uploadedImageUrls[0];

      /*
       * ========================================================
       * BUILD SPECIFICATIONS OBJECT
       * ========================================================
       */

      const specificationsObject = {};

      specifications.forEach(
        (specification) => {
          const key =
            specification.key.trim();

          const value =
            specification.value.trim();

          if (key && value) {
            specificationsObject[key] =
              value;
          }
        }
      );

      /*
       * ========================================================
       * CREATE PRODUCT DATA
       * ========================================================
       */

      const productData = {
        name: formData.name.trim(),

        slug:
          formData.slug.trim() ||
          createSlug(formData.name),

        category:
          formData.category.trim(),

        /*
         * IMPORTANT:
         * Brand is normalized before saving.
         */

        brand:
          normalizedBrand || null,

        description:
          formData.description.trim() ||
          null,

        price:
          Number(formData.price),

        original_price:
          formData.original_price
            ? Number(
                formData.original_price
              )
            : null,

        stock:
          Number(formData.stock),

        condition:
          formData.condition.trim() ||
          null,

        image_url:
          mainImageUrl,

        images:
          uploadedImageUrls,

        specifications:
          specificationsObject,

        is_active:
          formData.is_active,

        is_featured:
          formData.is_featured,
      };

      /*
       * ========================================================
       * INSERT PRODUCT
       * ========================================================
       */

      const {
        error: insertError,
      } = await supabase
        .from("products")
        .insert(productData);

      if (insertError) {
        console.error(
          "Product insert error:",
          insertError
        );

        throw insertError;
      }

      /*
       * ========================================================
       * SUCCESS
       * ========================================================
       */

      alert(
        "Product added successfully."
      );

      navigate("/admin");
    } catch (error) {
      console.error(
        "Add product error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to add product. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <div className="min-h-screen bg-[#FBF9F6]">

      {/* HEADER */}

      <header className="border-b border-[#E3E9F1] bg-white">

        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-5">

          <button
            type="button"
            onClick={() =>
              navigate("/admin")
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#DDE3EA] text-[#0F2B5B] hover:bg-[#F7F9FC]"
          >
            <ArrowLeft size={19} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-[#0F2B5B]">
              Add Product
            </h1>

            <p className="mt-1 text-sm text-[#718096]">
              Add a new product to Param Computers
            </p>
          </div>

        </div>

      </header>

      {/* MAIN */}

      <main className="mx-auto max-w-5xl px-6 py-8">

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* BASIC INFORMATION */}

          <section className="rounded-2xl border border-[#E3E9F1] bg-white p-6">

            <h2 className="text-lg font-bold text-[#0F2B5B]">
              Basic Information
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">

              {/* PRODUCT NAME */}

              <div className="md:col-span-2">

                <label className="text-sm font-semibold text-[#334155]">
                  Product Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={
                    handleNameChange
                  }
                  placeholder="Dell Latitude 5490"
                  required
                  className="mt-2 w-full rounded-xl border border-[#DDE3EA] px-4 py-3 outline-none focus:border-[#0F2B5B] focus:ring-2 focus:ring-[#0F2B5B]/10"
                />

              </div>

              {/* SLUG */}

              <div>

                <label className="text-sm font-semibold text-[#334155]">
                  Slug
                </label>

                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={
                    handleChange
                  }
                  placeholder="dell-latitude-5490"
                  className="mt-2 w-full rounded-xl border border-[#DDE3EA] px-4 py-3 outline-none focus:border-[#0F2B5B] focus:ring-2 focus:ring-[#0F2B5B]/10"
                />

                <p className="mt-1 text-xs text-[#94A3B8]">
                  Automatically created from the product name.
                </p>

              </div>

              {/* CATEGORY */}

              <div>

                <label className="text-sm font-semibold text-[#334155]">
                  Category *
                </label>

                <input
                  type="text"
                  name="category"
                  value={
                    formData.category
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Refurbished Laptops"
                  required
                  className="mt-2 w-full rounded-xl border border-[#DDE3EA] px-4 py-3 outline-none focus:border-[#0F2B5B] focus:ring-2 focus:ring-[#0F2B5B]/10"
                />

              </div>

              {/* BRAND */}

              <div>

                <label className="text-sm font-semibold text-[#334155]">
                  Brand
                </label>

                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={
                    handleChange
                  }
                  placeholder="Dell"
                  className="mt-2 w-full rounded-xl border border-[#DDE3EA] px-4 py-3 outline-none focus:border-[#0F2B5B] focus:ring-2 focus:ring-[#0F2B5B]/10"
                />

                <p className="mt-1 text-xs text-[#94A3B8]">
                  Brand names are automatically normalized when saved.
                </p>

              </div>

              {/* CONDITION */}

              <div>

                <label className="text-sm font-semibold text-[#334155]">
                  Condition
                </label>

                <select
                  name="condition"
                  value={
                    formData.condition
                  }
                  onChange={
                    handleChange
                  }
                  className="mt-2 w-full rounded-xl border border-[#DDE3EA] bg-white px-4 py-3 outline-none focus:border-[#0F2B5B] focus:ring-2 focus:ring-[#0F2B5B]/10"
                >

                  <option value="Refurbished">
                    Refurbished
                  </option>

                  <option value="New">
                    New
                  </option>

                  <option value="Used">
                    Used
                  </option>

                </select>

              </div>

              {/* DESCRIPTION */}

              <div className="md:col-span-2">

                <label className="text-sm font-semibold text-[#334155]">
                  Product Description
                </label>

                <textarea
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={
                    handleChange
                  }
                  rows={5}
                  placeholder="Enter complete product description..."
                  className="mt-2 w-full resize-y rounded-xl border border-[#DDE3EA] px-4 py-3 outline-none focus:border-[#0F2B5B] focus:ring-2 focus:ring-[#0F2B5B]/10"
                />

              </div>

            </div>

          </section>

          {/* PRICING & STOCK */}

          <section className="rounded-2xl border border-[#E3E9F1] bg-white p-6">

            <h2 className="text-lg font-bold text-[#0F2B5B]">
              Pricing & Stock
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-3">

              {/* SELLING PRICE */}

              <div>

                <label className="text-sm font-semibold text-[#334155]">
                  Selling Price *
                </label>

                <div className="relative mt-2">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#718096]">
                    ₹
                  </span>

                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={
                      handleChange
                    }
                    min="0"
                    step="0.01"
                    placeholder="7000"
                    required
                    className="w-full rounded-xl border border-[#DDE3EA] py-3 pl-9 pr-4 outline-none focus:border-[#0F2B5B] focus:ring-2 focus:ring-[#0F2B5B]/10"
                  />

                </div>

              </div>

              {/* ORIGINAL PRICE */}

              <div>

                <label className="text-sm font-semibold text-[#334155]">
                  Original Price
                </label>

                <div className="relative mt-2">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#718096]">
                    ₹
                  </span>

                  <input
                    type="number"
                    name="original_price"
                    value={
                      formData.original_price
                    }
                    onChange={
                      handleChange
                    }
                    min="0"
                    step="0.01"
                    placeholder="11000"
                    className="w-full rounded-xl border border-[#DDE3EA] py-3 pl-9 pr-4 outline-none focus:border-[#0F2B5B] focus:ring-2 focus:ring-[#0F2B5B]/10"
                  />

                </div>

                <p className="mt-1 text-xs text-[#94A3B8]">
                  Original price should be equal to or higher than the selling price.
                </p>

              </div>

              {/* STOCK */}

              <div>

                <label className="text-sm font-semibold text-[#334155]">
                  Stock *
                </label>

                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={
                    handleChange
                  }
                  min="0"
                  step="1"
                  required
                  className="mt-2 w-full rounded-xl border border-[#DDE3EA] px-4 py-3 outline-none focus:border-[#0F2B5B] focus:ring-2 focus:ring-[#0F2B5B]/10"
                />

                <p className="mt-1 text-xs text-[#94A3B8]">
                  Enter 0 to show Out of Stock.
                </p>

              </div>

            </div>

          </section>

          {/* PRODUCT IMAGES */}

          <section className="rounded-2xl border border-[#E3E9F1] bg-white p-6">

            <h2 className="text-lg font-bold text-[#0F2B5B]">
              Product Images
            </h2>

            <p className="mt-1 text-sm text-[#718096]">
              Select one or more images. The first image will be the main product image.
            </p>

            <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-6 py-10 text-center transition hover:border-[#0F2B5B] hover:bg-[#F7F9FC]">

              <ImagePlus
                size={36}
                className="text-[#0F2B5B]"
              />

              <span className="mt-3 font-semibold text-[#0F2B5B]">
                Select Product Images
              </span>

              <span className="mt-1 text-xs text-[#718096]">
                Multiple images allowed • Maximum 5 MB each
              </span>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={
                  handleImageChange
                }
                className="hidden"
              />

            </label>

            {imagePreviews.length >
              0 && (

              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">

                {imagePreviews.map(
                  (
                    preview,
                    index
                  ) => (

                    <div
                      key={`${preview}-${index}`}
                      className="group relative overflow-hidden rounded-xl border border-[#E3E9F1]"
                    >

                      <img
                        src={preview}
                        alt={`Product preview ${
                          index + 1
                        }`}
                        className="aspect-square w-full object-cover"
                      />

                      {index === 0 && (
                        <span className="absolute left-2 top-2 rounded-full bg-[#0F2B5B] px-2.5 py-1 text-xs font-semibold text-white">
                          Main
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          removeImage(
                            index
                          )
                        }
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-red-600 shadow-md hover:bg-red-50"
                        title="Remove image"
                      >
                        <Trash2
                          size={16}
                        />
                      </button>

                    </div>

                  )
                )}

              </div>

            )}

          </section>

          {/* SPECIFICATIONS */}

          <section className="rounded-2xl border border-[#E3E9F1] bg-white p-6">

            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

              <div>

                <h2 className="text-lg font-bold text-[#0F2B5B]">
                  Specifications
                </h2>

                <p className="mt-1 text-sm text-[#718096]">
                  Add any specifications that apply to this product.
                </p>

              </div>

              <button
                type="button"
                onClick={
                  addSpecification
                }
                className="flex items-center justify-center gap-2 rounded-xl border border-[#DDE3EA] px-4 py-2.5 text-sm font-semibold text-[#0F2B5B] hover:bg-[#F7F9FC]"
              >

                <Plus size={17} />

                Add Specification

              </button>

            </div>

            <div className="mt-5 space-y-3">

              {specifications.map(
                (
                  specification,
                  index
                ) => (

                  <div
                    key={index}
                    className="flex flex-col gap-3 sm:flex-row"
                  >

                    <input
                      type="text"
                      value={
                        specification.key
                      }
                      onChange={(
                        event
                      ) =>
                        updateSpecification(
                          index,
                          "key",
                          event.target.value
                        )
                      }
                      placeholder="Example: RAM"
                      className="flex-1 rounded-xl border border-[#DDE3EA] px-4 py-3 outline-none focus:border-[#0F2B5B] focus:ring-2 focus:ring-[#0F2B5B]/10"
                    />

                    <input
                      type="text"
                      value={
                        specification.value
                      }
                      onChange={(
                        event
                      ) =>
                        updateSpecification(
                          index,
                          "value",
                          event.target.value
                        )
                      }
                      placeholder="Example: 16 GB"
                      className="flex-1 rounded-xl border border-[#DDE3EA] px-4 py-3 outline-none focus:border-[#0F2B5B] focus:ring-2 focus:ring-[#0F2B5B]/10"
                    />

                    {specifications.length >
                      1 && (

                      <button
                        type="button"
                        onClick={() =>
                          removeSpecification(
                            index
                          )
                        }
                        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                        title="Remove specification"
                      >
                        <Trash2
                          size={17}
                        />
                      </button>

                    )}

                  </div>

                )
              )}

            </div>

          </section>

          {/* WEBSITE SETTINGS */}

          <section className="rounded-2xl border border-[#E3E9F1] bg-white p-6">

            <h2 className="text-lg font-bold text-[#0F2B5B]">
              Website Settings
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">

              {/* ACTIVE */}

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[#DDE3EA] p-4">

                <div>

                  <p className="font-semibold text-[#0F2B5B]">
                    Active Product
                  </p>

                  <p className="mt-1 text-xs text-[#718096]">
                    Show this product on the website.
                  </p>

                </div>

                <input
                  type="checkbox"
                  name="is_active"
                  checked={
                    formData.is_active
                  }
                  onChange={
                    handleChange
                  }
                  className="h-5 w-5"
                />

              </label>

              {/* FEATURED */}

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[#DDE3EA] p-4">

                <div>

                  <p className="font-semibold text-[#0F2B5B]">
                    Featured Product
                  </p>

                  <p className="mt-1 text-xs text-[#718096]">
                    Show this product in featured products.
                  </p>

                </div>

                <input
                  type="checkbox"
                  name="is_featured"
                  checked={
                    formData.is_featured
                  }
                  onChange={
                    handleChange
                  }
                  className="h-5 w-5"
                />

              </label>

            </div>

          </section>

          {/* BUTTONS */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={() =>
                navigate("/admin")
              }
              disabled={loading}
              className="rounded-xl border border-[#DDE3EA] bg-white px-6 py-3.5 text-sm font-semibold text-[#0F2B5B] hover:bg-[#F7F9FC] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#0F2B5B] px-7 py-3.5 text-sm font-semibold text-white hover:bg-[#17396F] disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Saving Product...
                </>
              ) : (
                "Save Product"
              )}

            </button>

          </div>

        </form>

      </main>

    </div>
  );
}