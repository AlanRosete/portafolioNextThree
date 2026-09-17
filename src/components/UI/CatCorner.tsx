"use client";

import React from "react";

export default function CatCorner() {
  return (
    <div className="cat-corner" aria-hidden="true">
      <svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
        {}
        <path
          className="cat-corner__tail"
          d="M20,46 C7,44 1,33 8,25 C13,19 21,21 23,28"
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
        />

        {}
        <path
          d="M18,64
             C12,57 12,46 18,40
             C24,33 34,30 46,30
             C60,30 72,33 84,33
             C94,33 100,30 104,26
             C106,24 108,22 110,21
             L113,6 L123,16
             C127,19 132,19 136,17
             L141,3 L148,18
             C152,25 154,33 153,42
             C152,47 149,51 145,54
             C147,57 156,59 164,64
             C174,69 181,78 180,89
             C179,101 176,112 173,121
             C171,127 163,130 158,126
             C154,123 155,115 156,107
             C157,95 157,80 153,71
             L150,64
             Z"
          fill="currentColor"
        />

        {}
        <path
          className="cat-corner__eye"
          d="M133,37 Q138,32 143,37"
          fill="none"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
