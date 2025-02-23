"use client";

import { useState } from "react";
import Tesseract from "tesseract.js";

export default function AadhaarOCR() {
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);

  const extractGender = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // **Check if the file is a JPEG
    if (!file.type.includes("jpeg") && !file.type.includes("jpg")) {
      alert("Only JPEG files are allowed. Please upload a valid JPEG image.");
      return;
    }

    setLoading(true);
    setGender("");

    try {
      // Perform OCR with English, Hindi, and Kannada
      const { data: { text } } = await Tesseract.recognize(file, "eng+hin+kan", {
        logger: (m) => console.log(m),
        tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 पुरुष महिला ಪುರುಷ ಸ್ತೀ ಸ್ತ್ರೀ ",
        oem: 1,
        psm: 6
      });

      console.log("Extracted Text:", text);

      // Check if the extracted text is too short (blurry image)
      if (text.length < 20) {
        alert("The Aadhaar image is not clear. Please upload a higher-quality image.");
        setGender("❌ Image not clear, try again.");
        setLoading(false);
        return;
      }

      // **Improved Gender Detection**
      if (/\bM\s*A\s*L\s*E\b|\bmale\b|पुरुष|ಪುರುಷ/i.test(text)) {
        setGender("Gender: Male ✅");
      } else if (/\bF\s*E\s*M\s*A\s*L\s*E\b|\bfemale\b|महिला|ಸ್ತೀ|ಸ್ತ್ರೀ/i.test(text)) {
        setGender("Gender: Female ✅");
      } else {
        setGender("Gender not detected ❌");
      }
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Error processing image. Please try again.");
      setGender("❌ Error detecting gender.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Aadhaar OCR Gender Detection</h1>
      <input type="file" accept=".jpeg, .jpg" onChange={extractGender} className="mt-2 p-2 border rounded" />
      
      {loading && <p>Processing... ⏳</p>}

      {gender && (
        <div className={`mt-4 p-2 border rounded ${gender.includes("✅") ? "bg-green-100" : "bg-red-100"}`}>
          <h2 className="text-lg font-semibold">{gender}</h2>
        </div>
      )}
    </div>
  );
}
