"use client";

import { useEffect, useRef } from "react";

export default function ArticlePageClient({ article, lang }) {
  const starsCanvasRef = useRef(null);

  useEffect(() => {
     const starsCanvas = starsCanvasRef.current;
  if (!starsCanvas) return; // ✅ prevent null errors

  const starsCtx = starsCanvas.getContext("2d");
  if (!starsCtx) return; 

    function resizeCanvas() {
      starsCanvas.width = window.innerWidth;
      starsCanvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // --- STARFIELD SETUP ---
    const stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * starsCanvas.width,
      y: Math.random() * starsCanvas.height,
      r: Math.random() * 1.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random(),
      fade: Math.random() * 0.02 + 0.005,
    }));

    function drawStars() {
      starsCtx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);

      stars.forEach((s) => {
        starsCtx.beginPath();
        starsCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        starsCtx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
        starsCtx.fill();

        s.x += s.dx;
        s.y += s.dy;

        if (s.x < 0 || s.x > starsCanvas.width) s.dx *= -1;
        if (s.y < 0 || s.y > starsCanvas.height) s.dy *= -1;

        s.opacity += s.fade;
        if (s.opacity <= 0 || s.opacity >= 1) s.fade *= -1;
      });
    }

    function animate() {
      drawStars();
      requestAnimationFrame(animate);
    }
    animate();

    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  if (!article) return null;

  return (
    <div
      className="position-relative py-5"
      style={{ backgroundColor: "#0a1f44", minHeight: "100vh", overflow: "hidden" }}
    >
      {/* Star Canvas */}
      <canvas
        ref={starsCanvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      />

      {/* Article Content */}
      <div
        className="container position-relative mt-5"
        style={{ zIndex: 1, animation: "fadeIn 1.5s ease-in-out" }}
      >
        <div className="row justify-content-center align-items-center g-5">
          {/* Image First on Small, Second on Large */}
          <div className="col-md-6 order-1 order-md-2">
            <div
              className="rounded-4 overflow-hidden shadow-lg"
              style={{ transition: "transform 0.5s ease, box-shadow 0.5s ease" }}
            >
              <img
                src={article.image}
                alt={article.title}
                className="img-fluid w-100"
                style={{
               
                  width: "100%",
                  height: "100%",
                  minHeight: "280px", // keeps it visible on small screens
                  maxHeight: "500px", // prevents huge stretch on large screens
                  borderRadius: "16px",
                  transition: "transform 0.6s ease",
                }}
                loading="lazy"
                onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
              />
            </div>
          </div>

          {/* Text Second on Small, First on Large */}
          <div className="col-md-6 order-2 order-md-1">
            <div
              className="p-4 rounded-4 shadow-lg text-white"
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(15px)",
                border: "1px solid rgba(255,255,255,0.2)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
            >
              <h1 className="fw-bold mb-3">{article.title}</h1>
              <p className="text-light mb-3" style={{ opacity: 0.85 }}>
                {article.timestamp
                  ? new Date(article.timestamp).toLocaleDateString(
                      lang === "ar" ? "ar-EG" : "en-US",
                      { month: "long", day: "numeric", year: "numeric" }
                    )
                  : ""}
              </p>
              <div
                dangerouslySetInnerHTML={{ __html: article.description }}
                className="text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
