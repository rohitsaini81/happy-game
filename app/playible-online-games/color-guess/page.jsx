"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const COLORS = [
  { name: "Red", className: "bg-red-500" },
  { name: "Green", className: "bg-green-500" },
  { name: "Blue", className: "bg-blue-500" },
  { name: "Yellow", className: "bg-yellow-400" },
  { name: "Orange", className: "bg-orange-500" },
  { name: "Purple", className: "bg-purple-500" },
  { name: "Pink", className: "bg-pink-500" },
  { name: "Teal", className: "bg-teal-500" },
  { name: "Indigo", className: "bg-indigo-500" },
  { name: "Lime", className: "bg-lime-500" },
];

export default function ColorGuessGamePage() {
  const casinoGames = [
    { name: "Mines", href: "/playible-online-games/stake" },
    { name: "Number Guess", href: "/playible-online-games/number-guess" },
    { name: "Color Guess", href: "/playible-online-games/color-guess", active: true },
    { name: "Dice" },
    { name: "Keno" },
    { name: "Limbo" },
    { name: "Plinko" },
    { name: "Dragon Tower" },
    { name: "Crash" },
    { name: "Wheel" },
  ];

  const [balance, setBalance] = useState(0);
  const [betInput, setBetInput] = useState("50");
  const [selectedColor, setSelectedColor] = useState(null);
  const [resultColor, setResultColor] = useState(null);
  const [status, setStatus] = useState("Choose a color and place your bet.");
  const [isRolling, setIsRolling] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const countdownIntervalRef = useRef(null);
  const revealTimeoutRef = useRef(null);

  useEffect(() => {
    const loadWallet = async () => {
      try {
        const response = await fetch("/api/games/wallet");
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !Number.isInteger(payload?.points)) {
          setStatus(payload?.error || "Unable to load wallet.");
          return;
        }
        setBalance(payload.points);
      } catch {
        setStatus("Unable to load wallet.");
      }
    };

    loadWallet();
  }, []);

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      if (revealTimeoutRef.current) {
        clearTimeout(revealTimeoutRef.current);
      }
    };
  }, []);

  const playRound = () => {
    if (isRolling) return;

    const bet = Number(betInput);
    if (!Number.isInteger(bet) || bet <= 0) {
      setStatus("Enter a valid integer bet amount.");
      return;
    }
    if (!selectedColor) {
      setStatus("Select one color from the color keyboard.");
      return;
    }
    if (bet > balance) {
      setStatus("Insufficient balance.");
      return;
    }

    setIsRolling(true);
    setCountdown(5);
    setStatus("Bet placed. Result in 5 seconds...");

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    revealTimeoutRef.current = setTimeout(() => {
      const settleRound = async () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
        try {
          const response = await fetch("/api/games/color-guess/resolve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ betAmount: bet, selectedColor }),
          });
          const payload = await response.json().catch(() => ({}));
          const rolledColor = String(payload?.resultColor || "");
          const validColor = COLORS.some((item) => item.name === rolledColor);

          if (!response.ok || !validColor) {
            setStatus(payload?.error || "Failed to resolve round. Please try again.");
            return;
          }

          setResultColor(rolledColor);
          if (Number.isInteger(payload?.points)) {
            setBalance(payload.points);
          }

          if (payload?.won) {
            const payout = bet * 9;
            const profit = payout - bet;
            setStatus(`${rolledColor} hit! You won ${profit}.`);
            return;
          }

          setStatus(`${rolledColor} came out. You lost ${bet}.`);
        } catch {
          setStatus("Failed to resolve round. Please try again.");
        } finally {
          setIsRolling(false);
          setCountdown(0);
        }
      };

      settleRound();
    }, 5000);
  };

  return (
    <main className="min-h-screen bg-[#0f212e] text-white">
      <header className="sticky top-0 z-20 border-b border-[#2f4553] bg-[#1a2c38]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="text-xl font-extrabold tracking-tight text-[#00e701]">Stake</span>
            <nav className="hidden gap-3 text-sm md:flex">
              <button type="button" className="rounded-md bg-[#2f4553] px-3 py-1.5">Casino</button>
              <button type="button" className="rounded-md px-3 py-1.5 text-slate-300 hover:bg-[#2f4553]">Sports</button>
              <button type="button" className="rounded-md px-3 py-1.5 text-slate-300 hover:bg-[#2f4553]">Live</button>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#0f212e] px-3 py-1.5 text-xs font-semibold text-slate-300">
              Wallet: {balance}
            </span>
            <Link href="/playible-online-games" className="rounded-md bg-[#2f4553] px-3 py-1.5 text-sm font-semibold hover:bg-[#3e5664]">
              Games
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:flex-row md:items-start">
        <aside className="hidden rounded-xl border border-[#2f4553] bg-[#1a2c38] p-3 md:block md:w-[220px] md:flex-shrink-0">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">Casino Games</h2>
          <div className="space-y-2">
            {casinoGames.map((game) => (
              <Link
                key={game.name}
                href={game.href || "#"}
                className={`block w-full rounded-md px-3 py-2 text-left text-sm font-semibold ${
                  game.active ? "bg-[#00e701] text-[#071824]" : "bg-[#213743] text-slate-200 hover:bg-[#29414e]"
                }`}
              >
                {game.name}
              </Link>
            ))}
          </div>
        </aside>

        <section className="flex-1">
          <div className="mx-auto w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Color Guess</h1>
              <span className="rounded-md bg-[#1a2c38] px-2 py-1 text-xs text-slate-300">
                {isRolling ? "Round Active" : "Idle"}
              </span>
            </div>

            <section className="rounded-xl border border-[#2f4553] bg-[#1a2c38] p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Color Keyboard</h2>
                <span className="rounded-md bg-[#0f212e] px-2 py-1 text-xs text-slate-300">Stake Originals</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color.name)}
                    disabled={isRolling}
                    className={`rounded-md px-3 py-2 text-sm font-semibold ${
                      selectedColor === color.name ? "ring-2 ring-white" : "ring-1 ring-slate-700"
                    } bg-[#213743] disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <span className={`mx-auto mb-1 block h-7 w-7 rounded-full ${color.className}`} />
                    <span className="text-xs">{color.name}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-[#2f4553] bg-[#1a2c38] p-4">
              <h2 className="text-lg font-semibold text-white">Bet Panel</h2>
              <div className="mt-3 space-y-3 text-sm">
                <p className="rounded-md bg-[#0f212e] px-3 py-2">
                  Balance: <span className="font-semibold">{balance}</span>
                </p>
                <label className="block">
                  <span className="mb-1 block text-slate-200">Bet Amount</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={betInput}
                    onChange={(e) => setBetInput(e.target.value)}
                    disabled={isRolling}
                    className="w-full rounded-md border border-[#2f4553] bg-[#0f212e] px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={playRound}
                disabled={isRolling}
                className="mt-4 w-full rounded-md bg-[#00e701] px-4 py-2 font-semibold text-[#071824] hover:bg-[#4bff4f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRolling ? `Waiting... ${countdown}s` : "Place Bet"}
              </button>

              <div className="mt-4 rounded-md border border-[#2f4553] bg-[#0f212e] p-3 text-sm text-slate-200">
                <p>Selected Color: {selectedColor ?? "-"}</p>
                <p>Result Color: {resultColor ?? "-"}</p>
                <p className="mt-2 text-emerald-300">{status}</p>
                <p className="mt-2 text-slate-400">Payout: 9x total on correct color.</p>
              </div>
            </section>
          </div>
        </section>

        <aside className="hidden rounded-xl border border-[#2f4553] bg-[#1a2c38] p-3 md:block md:w-[240px] md:flex-shrink-0">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">Other Games</h2>
          <div className="grid gap-2 text-sm">
            <Link href="/playible-online-games/stake" className="rounded-md bg-[#213743] px-3 py-2 text-left hover:bg-[#29414e]">Mines</Link>
            <Link href="/playible-online-games/number-guess" className="rounded-md bg-[#213743] px-3 py-2 text-left hover:bg-[#29414e]">Number Guess</Link>
            <button type="button" className="rounded-md bg-[#213743] px-3 py-2 text-left hover:bg-[#29414e]">Blackjack</button>
            <button type="button" className="rounded-md bg-[#213743] px-3 py-2 text-left hover:bg-[#29414e]">Roulette</button>
            <button type="button" className="rounded-md bg-[#213743] px-3 py-2 text-left hover:bg-[#29414e]">Slots</button>
          </div>
        </aside>
      </div>
    </main>
  );
}
