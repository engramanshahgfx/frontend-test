"use client";
import React, { useState, useRef, use, useMemo, useContext } from "react";
import { Context } from "@/providers/ContextProvider";
import dynamic from "next/dynamic";
const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});
import { nanoid } from "nanoid";
import { db, storage } from "@/configuration/firebase-config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-toastify";

export default function AddProduct({ params }) {
  const { lang } = use(params);
  const { categories } = useContext(Context);
  const [activeLang, setActiveLang] = useState(lang || "en");
  const [product, setProduct] = useState({
    image: null,
    title: { en: "", ar: "" },
    category: { en: "", ar: "" },
    link: "",
    shortDesc: { en: "", ar: "" },
    fullDesc: { en: "", ar: "" },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const editor = useRef(null);

  const config = useMemo(
    () => ({
      height: 400,
      readonly: false,
      direction: activeLang === "ar" ? "rtl" : "ltr",
      placeholder:
        activeLang || lang === "ar" ? "ابدأ بالكتابة..." : "Start typing...",
    }),
    [activeLang]
  );

  const labels = {
    en: {
      addProduct: "Add Product",
      langSelect: "Select Content Language",
      image: "Product Image",
      title: "Title",
      category: "Category",
      link: "Link",
      shortDesc: "Short Description",
      fullDesc: "Complete Description",
      add: "Add",
      adding: "Adding",
    },
    ar: {
      addProduct: "إضافة منتج",
      langSelect: "اختر لغة المحتوى",
      image: "صورة المنتج",
      title: "العنوان",
      category: "الفئة",
      link: "الرابط",
      shortDesc: "وصف قصير",
      fullDesc: "الوصف الكامل",
      add: "إضافة",
      adding: "جارٍ الإضافة",
    },
  };

  const ui = labels[lang] || labels["en"];

  const handleChange = (field, value) => {
    if (field === "title") {
      if (value.includes("_")) {
        setError("Underscores are not allowed in the title.");
        return;
      } else {
        setError("");
      }
    }
    if (["title", "category", "shortDesc", "fullDesc"].includes(field)) {
      setProduct((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          [activeLang]: value,
        },
      }));
    } else {
      setProduct((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleImage = (e) => {
    setProduct((prev) => ({
      ...prev,
      image: e.target.files[0],
    }));

    setTimeout(() => {
      e.target.value = "";
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!product.image) {
        toast.error("Add image please.");
        return;
      }
      const storageId = nanoid();

      const formData = new FormData();
      formData.append("file", product.image);
      formData.append("path", `products/${storageId}`);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Image upload failed");

      const data = await res.json();
      const imageURL = data.url;

      const productsRef = collection(db, "products");
      await addDoc(productsRef, {
        ...product,
        storageId,
        image: imageURL,
        timestamp: serverTimestamp(),
      });
      toast.success("Product uploaded successfully.");
      setProduct({
        image: null,
        title: { en: "", ar: "" },
        category: { en: "", ar: "" },
        link: "",
        shortDesc: { en: "", ar: "" },
        fullDesc: { en: "", ar: "" },
      });
    } catch (error) {
      console.log("Failed to add product", error);
      toast.error("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "16px",
        borderRadius: "18px",
        border: "1px solid rgba(227, 227, 227, 1)",
      }}
    >
      <h4 className="mb-4">{ui.addProduct}</h4>

      <div className="mb-5" style={{ maxWidth: "200px" }}>
        <label htmlFor="langSelect" className="form-label">
          {ui.langSelect}
        </label>
        <select
          id="langSelect"
          className="form-select"
          value={activeLang}
          onChange={(e) => setActiveLang(e.target.value)}
        >
          <option value="en">English</option>
          <option value="ar">العربية</option>
        </select>
      </div>

      <form onSubmit={handleSubmit} className="w-md-75">
        <div className="mb-4">
          <label className="form-label mb-3">{ui.image}</label>
          {product.image && (
            <img
              src={URL.createObjectURL(product.image)}
              alt="img"
              style={{ width: "100%", borderRadius: "30px" }}
              className="mb-4"
            />
          )}
          <div className="d-flex mb-3">
            <div
              className="primaryButton text-center me-2"
              style={{ width: "107.27px" }}
              onClick={() => document.getElementById("ImgInput").click()}
            >
              {product.image ? "Change" : "Add"}
            </div>
          </div>
          <input
            id="ImgInput"
            type="file"
            accept="image/*"
            onChange={handleImage}
            style={{ display: "none" }}
            className="form-control"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="productTitle" className="form-label">
            {ui.title}
          </label>
          <input
            id="productTitle"
            type="text"
            className="form-control"
            value={product.title[activeLang]}
            onChange={(e) => handleChange("title", e.target.value)}
            required
          />
          {error !== "" && <div className="form-text text-danger">{error}</div>}
        </div>
        <div className="mb-4">
          <label htmlFor="productCategory" className="form-label">
            {ui.category}
          </label>
          <select
            id="productCategory"
            className="form-select"
            value={product.category[activeLang]}
            onChange={(e) => handleChange("category", e.target.value)}
            required
          >
            <option value="">
              {activeLang === "en" ? "Select category" : "اختر الفئة"}
            </option>
            {categories[activeLang]?.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="productLink" className="form-label">
            {ui.link}
          </label>
          <input
            id="productLink"
            type="text"
            className="form-control"
            value={product.link}
            onChange={(e) => handleChange("link", e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="productShortDesc" className="form-label">
            {ui.shortDesc}
          </label>
          <textarea
            id="productShortDesc"
            rows="3"
            className="form-control"
            value={product.shortDesc[activeLang]}
            onChange={(e) => handleChange("shortDesc", e.target.value)}
            required
          />
        </div>
        <div className="mb-5">
          <label className="form-label">{ui.fullDesc}</label>
          <JoditEditor
            ref={editor}
            config={config}
            value={product.fullDesc[activeLang]}
            tabIndex={1}
            onBlur={(newContent) => handleChange("fullDesc", newContent)}
            onChange={(newContent) => {}}
          />
        </div>
        <button
          type="submit"
          className="primaryButton border-0"
          style={{ borderRadius: "12px" }}
          disabled={loading}
        >
          {loading ? (
            <>
              <span
                className={`spinner-border spinner-border-sm ${
                  lang === "en" ? "me-2" : "ms-2"
                }`}
                role="status"
                aria-hidden="true"
              ></span>
              {ui.adding}
            </>
          ) : (
            ui.add
          )}
        </button>
      </form>
    </div>
  );
}
