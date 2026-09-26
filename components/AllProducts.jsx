"use client";
import React, { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import { FaFilter } from "react-icons/fa";
import { IoIosCloseCircle } from "react-icons/io";
import { toast } from "react-toastify";
import Pagination from "@mui/material/Pagination";
import usePagination from "@/hooks/UsePagination";
import Link from "next/link";

export default function AllProjects({ lang, projects }) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  
const content = {
    en: {
      viewLabel: "View Details",
      searchPlaceholder: "Search projects...",
      filterLabel: "Project Types",
      notFound: "No projects found",
      noProjects: "No Projects To Show",
      status: "Status",
      completed: "Completed",
      inProgress: "In Progress",
      upcoming: "Upcoming",
      location: "Location",
      duration: "Duration",
      client: "Client",
    },
    ar: {
      viewLabel: "عرض التفاصيل",
      searchPlaceholder: "ابحث عن مشاريع...",
      filterLabel: "أنواع المشاريع",
      notFound: "لم يتم العثور على مشاريع",
      noProjects: "لا توجد مشاريع للعرض",
      status: "الحالة",
      completed: "مكتمل",
      inProgress: "قيد التنفيذ",
      upcoming: "قادم",
      location: "الموقع",
      duration: "المدة",
      client: "العميل",
    },
    zh: {
      viewLabel: "查看详情",
      searchPlaceholder: "搜索项目...",
      filterLabel: "项目类型",
      notFound: "未找到项目",
      noProjects: "无项目可显示",
      status: "状态",
      completed: "已完成",
      inProgress: "进行中",
      upcoming: "即将开始",
      location: "位置",
      duration: "时长",
      client: "客户",
    },
  };
  const { 
    viewLabel, 
    searchPlaceholder, 
    filterLabel, 
    notFound, 
    noProjects,
    status,
    completed,
    inProgress,
    upcoming,
    location,
    duration,
    client
  } = content[lang] || content.en;

  const categories = [...new Set(projects.map((p) => p.category))];

  const projectsToDisplay =
    searchResult.length > 0 && filteredProjects.length > 0
      ? searchResult
      : filteredProjects.length > 0
      ? filteredProjects
      : searchResult.length > 0
      ? searchResult
      : projects;

  const {
    totalPages,
    startPageIndex,
    endPageIndex,
    currentPageIndex,
    setcurrentPageIndex,
    displayPage,
  } = usePagination(12, projectsToDisplay.length);

  const currentProjects = projectsToDisplay.slice(startPageIndex, endPageIndex);

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const searchProjects = (e) => {
    e.preventDefault();

    const filtered = projects.filter((p) =>
      p.title.toLowerCase().includes(search.toLowerCase())
    );

    if (filtered.length > 0) {
      setcurrentPageIndex(1);
      setSearchResult(filtered);
    } else {
      toast.error(notFound);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: "success", text: completed },
      inProgress: { color: "warning", text: inProgress },
      upcoming: { color: "info", text: upcoming }
    };
    
    const config = statusConfig[status] || statusConfig.completed;
    return (
      <span className={`badge bg-${config.color}`}>
        {config.text}
      </span>
    );
  };

  useEffect(() => {
    const filtered = projects.filter((p) => {
      const matchCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(p.category);
      return matchCategory;
    });
    setcurrentPageIndex(1);
    setFilteredProjects(filtered);
  }, [selectedCategories]);

  useEffect(() => {
    if (search.trim() === "") {
      setSearchResult([]);
    }
  }, [search]);

  return (
    <div className="container my-5">
      {projects.length > 0 ? (
        <>
          <div className="d-flex justify-content-center mb-5">
            <div
              className={`d-flex justify-content-center align-items-center d-md-none ${
                lang === "en" ? "me-2" : "ms-2"
              }`}
              style={{
                border: "1px solid lightgrey",
                borderRadius: "8px",
                width: "50px",
                cursor: "pointer",
              }}
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasResponsive"
              aria-controls="offcanvasResponsive"
            >
              <FaFilter className="primary-color" />
            </div>
            <form
              className="w-sm-75 position-relative"
              onSubmit={searchProjects}
            >
              <input
                type="search"
                className="form-control"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  height: "50px",
                  paddingRight: lang === "en" ? "80px" : undefined,
                  paddingLeft: lang === "ar" ? "80px" : undefined,
                }}
                required
              />
              <button
                type="submit"
                className="primaryButton border-0"
                style={{
                  borderRadius: "8px",
                  position: "absolute",
                  right: lang === "en" ? "10px" : "auto",
                  left: lang === "ar" ? "10px" : "auto",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                <IoSearch style={{ width: "20px", height: "20px" }} />
              </button>
            </form>
          </div>
          <div className="row">
            <div className="col-md-4 col-lg-3">
              <div
                className={`offcanvas-md offcanvas-${
                  lang === "en" ? "start" : "end"
                }`}
                tabIndex="-1"
                id="offcanvasResponsive"
                aria-labelledby="offcanvasResponsiveLabel"
              >
                <div className="offcanvas-header">
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="offcanvas"
                    data-bs-target="#offcanvasResponsive"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="offcanvas-body">
                  <div className="card p-3 shadow-sm rounded-3 w-100">
                    <div className="d-flex justify-content-between align-items-center">
                      <label className="fw-bold">{filterLabel}</label>
                      <IoIosCloseCircle
                        style={{
                          cursor: "pointer",
                          width: "25px",
                          height: "25px",
                        }}
                        onClick={() => setSelectedCategories([])}
                      />
                    </div>
                    <div className="d-flex flex-column gap-2 mt-3">
                      {categories.map((cat, idx) => (
                        <div className="form-check" key={idx}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            value={cat}
                            checked={selectedCategories.includes(cat)}
                            onChange={() => toggleCategory(cat)}
                            id={`cat-${idx}`}
                            style={{
                              cursor: "pointer",
                              transform: "scale(1.2)",
                            }}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`cat-${idx}`}
                          >
                            {cat}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-8 col-lg-9 mb-5">
              <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
                {currentProjects.map((project) => {
                  return (
                    <div className="col" key={project.id}>
                      <div className="card h-100 shadow-sm rounded-3 overflow-hidden">
                        <div
                          style={{
                            position: "relative",
                            width: "100%",
                            paddingTop: "75%",
                            backgroundColor: "#f0f0f0",
                            overflow: "hidden",
                          }}
                          className="card-img-top"
                        >
                          <Link
                            href={`/${lang}/project-details/${project.slug.replace(
                              /\s+/g,
                              "_"
                            )}`}
                          >
                            <img
                              src={project.image}
                              alt={project.title}
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                              loading="lazy"
                            />
                          </Link>
                          <div className="position-absolute top-0 end-0 m-2">
                            {getStatusBadge(project.status)}
                          </div>
                        </div>
                        <div className="card-body d-flex flex-column">
                          <Link
                            href={`/${lang}/project-details/${project.slug.replace(
                              /\s+/g,
                              "_"
                            )}`}
                          >
                            <div className="mb-2" style={{ fontWeight: "600" }}>
                              {project.title}
                            </div>
                          </Link>

                          {/* Project Details */}
                          <div className="mb-3">
                            {project.location && (
                              <div className="d-flex align-items-center mb-1">
                                <small className="text-muted me-2">{location}:</small>
                                <small>{project.location}</small>
                              </div>
                            )}
                            {project.duration && (
                              <div className="d-flex align-items-center mb-1">
                                <small className="text-muted me-2">{duration}:</small>
                                <small>{project.duration}</small>
                              </div>
                            )}
                            {project.client && (
                              <div className="d-flex align-items-center mb-2">
                                <small className="text-muted me-2">{client}:</small>
                                <small>{project.client}</small>
                              </div>
                            )}
                          </div>

                          <p className="text-secondary clamp-3 mb-3">
                            {project.shortDesc}
                          </p>
                          
                          <Link
                            href={`/${lang}/project-details/${project.slug.replace(/\s+/g, "_")}`}
                            className="primaryButton mt-auto text-center text-decoration-none"
                          >
                            {viewLabel}
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {projectsToDisplay.length > 12 && (
              <div className="d-flex justify-content-center">
                <Pagination
                  count={totalPages}
                  page={currentPageIndex}
                  onChange={(event, page) => displayPage(page)}
                  className="custom-pagination"
                />
              </div>
            )}
          </div>
        </>
      ) : (
        <h4 className="text-center my-5">{noProjects}</h4>
      )}
    </div>
  );
}