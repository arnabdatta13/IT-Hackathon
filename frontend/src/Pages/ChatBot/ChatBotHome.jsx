"use client";

import { useState } from "react";
import { FaAtom, FaFlask, FaDna, FaCalculator } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function ChatBotHome() {
  const navigate = useNavigate();
  const [hoveredIcon, setHoveredIcon] = useState(null);

  const subjectIcons = [
    { icon: FaAtom, title: "পদার্থবিজ্ঞান", color: "#3498db" },
    { icon: FaFlask, title: "রসায়ন", color: "#e74c3c" },
    { icon: FaDna, title: "জীববিজ্ঞান", color: "#2ecc71" },
    { icon: FaCalculator, title: "গণিত", color: "#f39c12" },
  ];

  return (
    <div
      className="home-container"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "2rem",
        paddingTop: "5rem", // Added padding-top to fix navbar overlap
        background: "linear-gradient(135deg, #141e30, #243b55)",
        fontFamily: "'Hind Siliguri', 'Segoe UI', sans-serif",
      }}
    >
      <div
        className="content-card"
        style={{
          width: "95%",
          maxWidth: "1000px",
          padding: "3.5rem",
          borderRadius: "20px",
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(30px)",
          WebkitBackdropFilter: "blur(30px)",
          boxShadow:
            "0 10px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          color: "white",
          textAlign: "center",
          transition: "all 0.4s ease",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            top: "-50px",
            right: "-50px",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0, 184, 148, 0.2) 0%, rgba(0, 206, 201, 0) 70%)",
            zIndex: "0",
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            bottom: "-30px",
            left: "-30px",
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0, 206, 201, 0.15) 0%, rgba(0, 184, 148, 0) 70%)",
            zIndex: "0",
          }}
        ></div>

        <div style={{ position: "relative", zIndex: "1" }}>
          <h1
            style={{
              fontSize: "2.8rem",
              marginBottom: "1.5rem",
              fontWeight: "700",
              background: "linear-gradient(135deg, #ffffff, #e0e0e0)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
            }}
          >
            জ্ঞান অর্জনের নতুন পথ
          </h1>

          <div
            style={{
              width: "80px",
              height: "4px",
              background: "linear-gradient(90deg, #00b894, #00cec9)",
              margin: "0 auto 2rem",
              borderRadius: "2px",
            }}
          ></div>

          <div
            style={{
              fontSize: "1.3rem",
              marginBottom: "2.5rem",
              lineHeight: "1.8",
              color: "rgba(255, 255, 255, 0.9)",
              maxWidth: "90%",
              margin: "0 auto 2.5rem",
            }}
          >
            <p style={{ marginBottom: "1.2rem" }}>
              পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান আর গণিতের যেকোনো প্রশ্ন? <br />
              <span style={{ color: "#4ecca3", fontWeight: "600" }}>
                উত্তর পেতে দেরি নয়
              </span>{" "}
              — <span style={{ fontWeight: "600" }}>এক ক্লিকে শুরু করুন</span>,{" "}
              <em>জেনে নিন সবকিছু!</em>
            </p>

            <p style={{ marginBottom: "1.2rem" }}>
              <span style={{ color: "#4ecca3", fontWeight: "600" }}>
                ভার্চুয়াল ল্যাবের
              </span>{" "}
              মাধ্যমে সিমুলেশন চালিয়ে শেখা এখন আরও সহজ —{" "}
              <em>নিজে চেষ্টা করো, নিজেই বুঝে ফেলো!</em>
            </p>

            <p style={{ marginBottom: "1.2rem" }}>
              ইংরেজিতে কথা বলার অনুশীলনে আছে{" "}
              <span style={{ color: "#4ecca3", fontWeight: "600" }}>
                AI স্পিকিং অ্যাসিস্ট্যান্ট
              </span>{" "}
              — <em>সরাসরি কারও সঙ্গে কথা না বলেও</em> উচ্চারণ, ব্যাকরণ ও
              শব্দভান্ডারে মিলবে তাত্ক্ষণিক সহায়তা।
            </p>

            <p>
              <span style={{ color: "#4ecca3", fontWeight: "600" }}>
                শেখা হোক মজার, সহজ আর বাস্তবসম্মত
              </span>{" "}
              — শহর হোক কিংবা গ্রাম, যেখানেই থাকো,{" "}
              <em>তোমার জায়গা থেকে, নিজের সময়ে শেখার সুযোগ এখন সবার জন্য!</em>
            </p>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "2.5rem",
              marginBottom: "2.5rem",
            }}
          >
            {subjectIcons.map((subject, index) => {
              const Icon = subject.icon;
              const isHovered = hoveredIcon === index;

              return (
                <div
                  key={index}
                  onMouseEnter={() => setHoveredIcon(index)}
                  onMouseLeave={() => setHoveredIcon(null)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    transform: isHovered ? "translateY(-8px)" : "translateY(0)",
                  }}
                >
                  <div
                    style={{
                      width: "70px",
                      height: "70px",
                      borderRadius: "18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isHovered
                        ? `linear-gradient(135deg, ${subject.color}, ${subject.color}99)`
                        : "rgba(255, 255, 255, 0.1)",
                      boxShadow: isHovered
                        ? `0 10px 20px rgba(0, 0, 0, 0.2), 0 0 0 1px ${subject.color}33`
                        : "0 4px 12px rgba(0, 0, 0, 0.1)",
                      transition: "all 0.3s ease",
                      marginBottom: "10px",
                    }}
                  >
                    <Icon
                      size={32}
                      color={isHovered ? "white" : subject.color}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      color: isHovered
                        ? subject.color
                        : "rgba(255, 255, 255, 0.8)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {subject.title}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => navigate("/chatbot")}
            style={{
              padding: "1.2rem 3rem",
              fontSize: "1.3rem",
              fontWeight: "600",
              borderRadius: "12px",
              border: "none",
              background: "linear-gradient(135deg, #00b894, #00cec9)",
              color: "white",
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(0, 184, 148, 0.3)",
              transition: "all 0.3s ease",
              position: "relative",
              overflow: "hidden",
              zIndex: "1",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow =
                "0 12px 25px rgba(0, 184, 148, 0.4)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 8px 20px rgba(0, 184, 148, 0.3)";
            }}
          >
            <span style={{ position: "relative", zIndex: "2" }}>শুরু করুন</span>
            <div
              style={{
                position: "absolute",
                top: "0",
                left: "-100%",
                width: "200%",
                height: "100%",
                background:
                  "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
                transition: "all 0.5s ease",
                zIndex: "1",
              }}
              className="button-shine"
            ></div>
          </button>
        </div>
      </div>
    </div>
  );
}


export default ChatBotHome;
