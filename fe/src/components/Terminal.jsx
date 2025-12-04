import React, { useState, useEffect, useRef } from "react";

const Terminal = ({ onClose }) => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState([]);
  const terminalRef = useRef(null);

  const commands = {
    help: () =>
      "Available commands: help, stats, clear, date, ping, scan, version, exit",
    stats: () => "Fetching system stats...",
    clear: () => {
      setOutput([]);
      return "Terminal cleared.";
    },
    date: () => new Date().toLocaleString(),
    ping: () => "PONG! API server is online.",
    scan: () => "Scanning for active threats... No threats detected.",
    version: () => "CheckScam Terminal v1.0.0 | React 18.2.0 | Node 18+",
    exit: () => {
      onClose();
      return "Closing terminal...";
    },
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim().toLowerCase();
    const newOutput = [...output, `$ ${input}`];

    if (commands[cmd]) {
      const result = commands[cmd]();
      newOutput.push(result);
    } else {
      newOutput.push(
        `Command not found: ${cmd}. Type 'help' for available commands.`
      );
    }

    setOutput(newOutput);
    setInput("");
  };

  useEffect(() => {
    // Initial terminal message
    setOutput([
      "CHECKSCAM TERMINAL v1.0.0",
      'Type "help" for available commands',
      "-----------------------------------",
    ]);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black bg-opacity-75"
        onClick={onClose}
      ></div>
      <div className="relative w-full max-w-3xl bg-black border-2 border-green-500 rounded-lg overflow-hidden shadow-2xl">
        {/* Terminal Header */}
        <div className="flex items-center justify-between bg-green-900 px-4 py-2">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span className="ml-2 font-bold">check_scam@terminal:~</span>
          </div>
          <button onClick={onClose} className="text-white hover:text-green-300">
            ✕
          </button>
        </div>

        {/* Terminal Body */}
        <div className="p-4">
          <div
            ref={terminalRef}
            className="h-96 overflow-y-auto bg-black text-green-400 font-mono text-sm p-4 rounded border border-green-800 mb-4"
          >
            {output.map((line, index) => (
              <div key={index} className="mb-1">
                {line}
              </div>
            ))}
            <div className="flex items-center">
              <span className="mr-2 text-green-500">check_scam@web:~$</span>
              <span className="terminal-cursor"></span>
            </div>
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex">
            <div className="flex-1 flex items-center bg-black border border-green-600 rounded px-3 py-2">
              <span className="text-green-500 mr-2">$</span>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-transparent outline-none text-green-400"
                placeholder="Type command here..."
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="ml-2 px-4 py-2 bg-green-700 border border-green-500 rounded hover:bg-green-600"
            >
              EXECUTE
            </button>
          </form>

          {/* Quick Commands */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {["help", "stats", "clear", "exit"].map((cmd) => (
              <button
                key={cmd}
                onClick={() => {
                  setInput(cmd);
                  setTimeout(
                    () =>
                      document
                        .querySelector("form")
                        .dispatchEvent(new Event("submit")),
                    10
                  );
                }}
                className="px-3 py-1 bg-green-900 bg-opacity-30 border border-green-700 rounded text-xs hover:bg-green-800"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
