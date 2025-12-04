import React from "react";

const HackerTheme = ({ children, theme = "hacker" }) => {
  const themes = {
    hacker: {
      bg: "bg-black",
      text: "text-green-400",
      border: "border-green-500",
      glow: "glow-green",
      terminal: "bg-black text-green-400 border-green-600",
    },
    matrix: {
      bg: "bg-black",
      text: "text-green-300",
      border: "border-green-400",
      glow: "glow-matrix",
      terminal: "bg-black text-green-300 border-green-500",
    },
    cyberpunk: {
      bg: "bg-gray-900",
      text: "text-purple-400",
      border: "border-purple-500",
      glow: "glow-purple",
      terminal: "bg-gray-900 text-purple-400 border-purple-600",
    },
  };

  const currentTheme = themes[theme];

  return (
    <div
      className={`${currentTheme.bg} ${currentTheme.text} min-h-screen font-mono`}
    >
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap");

        .font-mono {
          font-family: "Share Tech Mono", monospace;
        }

        .glow-green {
          text-shadow: 0 0 5px #00ff00, 0 0 10px #00ff00, 0 0 15px #00ff00;
        }

        .glow-matrix {
          text-shadow: 0 0 5px #00ff00, 0 0 10px #00ff00;
        }

        .glow-purple {
          text-shadow: 0 0 5px #9d00ff, 0 0 10px #9d00ff;
        }

        .scan-line {
          position: relative;
          overflow: hidden;
        }

        .scan-line::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(
            to right,
            transparent,
            #00ff00,
            transparent
          );
          animation: scan 3s linear infinite;
        }

        @keyframes scan {
          0% {
            top: 0;
          }
          100% {
            top: 100%;
          }
        }

        .blink {
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .typewriter {
          overflow: hidden;
          border-right: 0.15em solid #00ff00;
          white-space: nowrap;
          animation: typing 3.5s steps(40, end),
            blink-caret 0.75s step-end infinite;
        }

        @keyframes typing {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }

        @keyframes blink-caret {
          from,
          to {
            border-color: transparent;
          }
          50% {
            border-color: #00ff00;
          }
        }
      `}</style>
      {children}
    </div>
  );
};

export default HackerTheme;
