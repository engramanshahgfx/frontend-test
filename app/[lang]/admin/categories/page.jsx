"use client";
import React, { useState, useEffect, useContext, use } from "react";
import { Context } from "@/providers/ContextProvider";
import { db } from "@/configuration/firebase-config";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";

export default function Categories({ params }) {
  const { lang } = use(params);
  const { categories } = useContext(Context);
  const [newCategory, setNewCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("en");
  const [updatedCategories, setUpdatedCategories] = useState({
    en: [],
    ar: [],
  });
  const [originalCategories, setOriginalCategories] = useState({
    en: [],
    ar: [],
  });

  const content = {
    en: {
      title: "Product Categories",
      placeholder: "Enter category",
      add: "Add",
      remove: "Remove",
      noCategories: "No categories yet",
      saveChanges: "Save Changes",
      saving: "Saving",
      categoryExists: "Category already exists",
      savedSuccess: "Categories updated successfully",
      saveError: "Failed to save categories",
      english: "English",
      arabic: "Arabic",
    },
    ar: {
      title: "فئات المنتجات",
      placeholder: "أدخل الفئة",
      add: "إضافة",
      remove: "إزالة",
      noCategories: "لا توجد فئات بعد",
      saveChanges: "حفظ التغييرات",
      saving: "جارٍ الحفظ",
      categoryExists: "الفئة موجودة بالفعل",
      savedSuccess: "تم تحديث الفئات بنجاح",
      saveError: "فشل في حفظ الفئات",
      english: "الإنجليزية",
      arabic: "العربية",
    },
  };

  const t = content[lang] || content.en;

  const handleAdd = () => {
    const trimmedCategory = newCategory.trim();
    if (!trimmedCategory) return;

    if (updatedCategories[activeTab].includes(trimmedCategory)) {
      toast.error(t.categoryExists);
      return;
    }

    setUpdatedCategories((prev) => ({
      ...prev,
      [activeTab]: [...prev[activeTab], trimmedCategory],
    }));

    setNewCategory("");
  };

  const handleRemove = (index) => {
    setUpdatedCategories((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, "general", "categories");
      await updateDoc(docRef, {
        categories: updatedCategories,
      });

      toast.success(t.savedSuccess);
      setOriginalCategories({ ...updatedCategories });
    } catch (err) {
      console.error(err);
      toast.error(t.saveError);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = ["en", "ar"].some(
    (lang) =>
      originalCategories[lang].length !== updatedCategories[lang].length ||
      !originalCategories[lang].every(
        (cat, i) => cat === updatedCategories[lang][i]
      )
  );

  useEffect(() => {
    setUpdatedCategories({
      en: [...(categories.en || [])],
      ar: [...(categories?.ar || [])],
    });
    setOriginalCategories({
      en: [...(categories.en || [])],
      ar: [...(categories.ar || [])],
    });
  }, [categories]);

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "16px",
        borderRadius: "18px",
        border: "1px solid rgba(227, 227, 227, 1)",
      }}
    >
      <h4 className="mb-5">{t.title}</h4>

      <div className="d-flex mb-4">
        <button
          className="px-4 py-2 bg-transparent"
          onClick={() => setActiveTab("en")}
          style={{
            fontWeight: activeTab === "en" ? "600" : "400",
            color: activeTab === "en" ? "#0d6efd" : "#6c757d",
            border: "none",
            borderBottom:
              activeTab === "en"
                ? "3px solid #0d6efd"
                : "3px solid transparent",
          }}
        >
          {t.english}
        </button>
        <button
          className="px-4 py-2 bg-transparent"
          onClick={() => setActiveTab("ar")}
          style={{
            fontWeight: activeTab === "ar" ? "600" : "400",
            color: activeTab === "ar" ? "#0d6efd" : "#6c757d",
            border: "none",
            borderBottom:
              activeTab === "ar"
                ? "3px solid #0d6efd"
                : "3px solid transparent",
          }}
        >
          {t.arabic}
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAdd();
        }}
        className="w-md-75 mb-4 position-relative"
      >
        <input
          type="text"
          placeholder={t.placeholder}
          className="form-control"
          style={{
            height: "50px",
            borderRadius: "10px",
            paddingRight: lang === "en" ? "90px" : undefined,
            paddingLeft: lang === "ar" ? "90px" : undefined,
          }}
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          required
        />
        <button
          type="submit"
          className="primaryButton border-0"
          style={{
            borderRadius: "8px",
            position: "absolute",
            right: lang === "en" ? "5px" : "auto",
            left: lang === "ar" ? "5px" : "auto",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          {t.add}
        </button>
      </form>

      {updatedCategories[activeTab].length === 0 ? (
        <h5 className="my-3">{t.noCategories}</h5>
      ) : (
        <ul className="list-group mb-5 w-md-75">
          {updatedCategories[activeTab].map((cat, index) => (
            <li
              key={`${activeTab}-${index}`}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              {cat}
              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleRemove(index)}
              >
                {t.remove}
              </button>
            </li>
          ))}
        </ul>
      )}

      {hasChanges && (
        <button
          className="primaryButton border-0"
          style={{ borderRadius: "12px" }}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <span
                className={`spinner-border spinner-border-sm ${
                  lang === "en" ? "me-2" : "ms-2"
                }`}
                role="status"
                aria-hidden="true"
              ></span>
              {t.saving}
            </>
          ) : (
            t.saveChanges
          )}
        </button>
      )}
    </div>
  );
}
