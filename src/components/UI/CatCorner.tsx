"use client";

import React from "react";

export default function CatCorner() {
  return (
    <div className="cat-corner" aria-hidden="true">
      <svg viewBox="0 0 260 74" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M210,52
             C226,49 236,55 238,62
             C240,68 247,69 252,64"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M14,64
             C8,64 4,61 4,57
             C4,53 8,50 14,50
             L34,50
             C32,45 32,39 35,34
             L31,18 L46,26
             C52,23 59,23 65,26
             L80,18 L76,34
             C79,38 81,43 81,48
             C88,44 96,40 106,37
             C130,29 160,27 186,33
             C204,37 214,44 216,53
             C217,59 213,64 206,64
             Z"
          fill="currentColor"
        />

      </svg>
    </div>
  );
}
