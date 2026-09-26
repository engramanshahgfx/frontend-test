"use client";
import React, { useContext, useEffect, use } from "react";
import { Context } from "@/providers/ContextProvider";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/configuration/firebase-config";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Pagination from "@mui/material/Pagination";
import usePagination from "@/hooks/UsePagination";
import Link from "next/link";
import { FaEye, FaTrash, FaPencilAlt } from "react-icons/fa";

export default function Products({ params }) {
  const { lang } = use(params);
  const { products } = useContext(Context);
  const router = useRouter();

  const {
    totalPages,
    startPageIndex,
    endPageIndex,
    currentPageIndex,
    setcurrentPageIndex,
    displayPage,
  } = usePagination(20, products.length);

  const currentProducts = products.slice(startPageIndex, endPageIndex);

  const translations = {
    en: {
      products: "Products",
      add: "Add",
      noProducts: "No products",
      view: "View",
      edit: "Edit",
      delete: "Delete",
      confirmDelete: "Are you sure you want to delete this product?",
    },
    ar: {
      products: "المنتجات",
      add: "إضافة",
      noProducts: "لا توجد منتجات",
      view: "عرض",
      edit: "تعديل",
      delete: "حذف",
      confirmDelete: "هل أنت متأكد أنك تريد حذف هذا المنتج؟",
    },
  };

  const t = translations[lang] || translations.en;

  const handleDelete = async (product) => {
    if (!window.confirm(t.confirmDelete)) return;

    try {
      await fetch("/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: `products/${product.storageId}` }),
      });

      await deleteDoc(doc(db, "products", product.id));

      toast.success(
        lang === "ar" ? "تم حذف المنتج بنجاح" : "Product deleted successfully."
      );
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error(
        lang === "ar" ? "فشل حذف المنتج" : "Failed to delete product"
      );
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
      <div className="d-flex justify-content-between align-items-start mb-5">
        <h4>{t.products}</h4>
        <div
          className="primaryButton"
          style={{ borderRadius: "12px" }}
          onClick={() => router.push(`/${lang}/admin/add-product`)}
        >
          {t.add}
        </div>
      </div>
      {products.length === 0 ? (
        <h5 className="text-center my-5">{t.noProducts}</h5>
      ) : (
        <>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-3 row-cols-xxl-4 g-4 mb-5">
            {currentProducts.map((product) => {
              return (
                <div className="col" key={product.id}>
                  <div className="card h-100 shadow-sm rounded-3 overflow-hidden">
                    {product.image && (
                      <img
                        src={product.image}
                        className="card-img-top"
                        alt={product.title[lang]}
                      />
                    )}
                    <div className="card-body d-flex flex-column">
                      <div
                        className="mb-2 fw-semibold"
                        style={{ fontWeight: "600" }}
                      >
                        {product.title[lang]}
                      </div>
                      <p className="text-secondary mb-3 flex-grow-1 clamp-3">
                        {product.shortDesc[lang]}
                      </p>
                      <div className="d-flex">
                        <div
                          className={`btn btn-primary ${
                            lang === "en" ? "me-2" : "ms-2"
                          }`}
                          onClick={() =>
                            router.push(
                              `/${lang}/product-details/${product.title[
                                "en"
                              ].replace(/\s+/g, "_")}`
                            )
                          }
                          title={t.view}
                        >
                          <FaEye />
                        </div>
                        <div
                          className={`btn btn-warning text-white ${
                            lang === "en" ? "me-2" : "ms-2"
                          }`}
                          onClick={() =>
                            router.push(
                              `/${lang}/admin/edit-product/${product.id}`
                            )
                          }
                          title={t.edit}
                        >
                          <FaPencilAlt />
                        </div>
                        <div
                          className="btn btn-danger"
                          style={{ backgroundColor: "red" }}
                          onClick={() => handleDelete(product)}
                          title={t.delete}
                        >
                          <FaTrash />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {products.length > 20 && (
            <div className="d-flex justify-content-center">
              <Pagination
                count={totalPages}
                page={currentPageIndex}
                onChange={(event, page) => displayPage(page)}
                className="custom-pagination"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
