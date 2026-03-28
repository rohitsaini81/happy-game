"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function NumberGuessGamePage() {
  const casinoGames = [
    { name: "Mines", href: "/playible-online-games/stake" },
    { name: "Number Guess", href: "/playible-online-games/number-guess", active: true },
    { name: "Color Guess", href: "/playible-online-games/color-guess" },
    { name: "Dice" },
    { name: "Keno" },
    { name: "Limbo" },
    { name: "Plinko" },
    { name: "Dragon Tower" },
    { name: "Crash" },
    { name: "Wheel" },
  ];

  const [balance, setBalance] = useState(1000);
  const [betInput, setBetInput] = useState("50");
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [status, setStatus] = useState("Pick a number from 1 to 10 and place your bet.");
  const [resultNumber, setResultNumber] = useState(null);
  const [resultHistory, setResultHistory] = useState([]);
  const [isRolling, setIsRolling] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const countdownIntervalRef = useRef(null);
  const revealTimeoutRef = useRef(null);

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

    if (!Number.isFinite(bet) || bet <= 0) {
      setStatus("Enter a valid bet amount.");
      return;
    }
    if (!selectedNumber) {
      setStatus("Select a number from the keyboard.");
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
          const response = await fetch("/api/games/number-guess/resolve", {
            method: "POST",
          });
          const payload = await response.json().catch(() => ({}));
          const roll = Number(payload?.resultNumber);

          if (!response.ok || !Number.isInteger(roll) || roll < 1 || roll > 10) {
            setStatus("Failed to resolve round. Please try again.");
            return;
          }

          setResultNumber(roll);
          setResultHistory((prev) => [roll, ...prev].slice(0, 20));

          if (roll === selectedNumber) {
            const payout = bet * 9;
            const profit = payout - bet;
            setBalance((prev) => prev + profit);
            setStatus(`Exact hit ${roll}! You won ${profit.toFixed(2)}.`);
            return;
          }

          setBalance((prev) => prev - bet);
          setStatus(`Result number ${roll}. You lost ${bet.toFixed(2)}.`);
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
              Wallet: {balance.toFixed(2)}
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
              <h1 className="text-2xl font-bold text-white">Number Guess</h1>
              <span className="rounded-md bg-[#1a2c38] px-2 py-1 text-xs text-slate-300">
                {isRolling ? "Round Active" : "Idle"}
              </span>
            </div>

            <section className="rounded-xl border border-[#2f4553] bg-[#1a2c38] p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Number Keyboard</h2>
                <span className="rounded-md bg-[#0f212e] px-2 py-1 text-xs text-slate-300">Stake Originals</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSelectedNumber(num)}
                    disabled={isRolling}
                    className={`rounded-md px-3 py-3 text-sm font-semibold ${
                      selectedNumber === num
                        ? "bg-amber-400 text-slate-900"
                        : "bg-[#213743] text-slate-200 hover:bg-[#29414e]"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-[#2f4553] bg-[#1a2c38] p-4">
              <h2 className="text-lg font-semibold text-white">Bet Panel</h2>
              <div className="mt-3 space-y-3 text-sm">
                <p className="rounded-md bg-[#0f212e] px-3 py-2">
                  Balance: <span className="font-semibold">{balance.toFixed(2)}</span>
                </p>
                <label className="block">
                  <span className="mb-1 block text-slate-200">Bet Amount</span>
                  <input
                    type="number"
                    min="1"
                    value={betInput}
                    onChange={(e) => setBetInput(e.target.value)}
                    disabled={isRolling}
                    className="w-full rounded-md border border-[#2f4553] bg-[#0f212e] px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={playRound}
                disabled={isRolling}
                className="mt-4 w-full rounded-md bg-[#f9a825] px-4 py-2 font-semibold text-[#071824] hover:bg-[#fbbf24] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRolling ? `Waiting... ${countdown}s` : "Place Bet"}
              </button>

              <div className="mt-4 rounded-md border border-[#2f4553] bg-[#0f212e] p-3 text-sm text-slate-200">
                <p>Selected Number: {selectedNumber ?? "-"}</p>
                <p>Result Number: {resultNumber ?? "-"}</p>
                <div className="mt-2">
                  <p className="mb-2 text-slate-300">Result History</p>
                  <div className="flex flex-wrap gap-2">
                    {resultHistory.length > 0 ? (
                      resultHistory.map((item, idx) => (
                        <span
                          key={`${item}-${idx}`}
                          className="rounded-md bg-[#213743] px-2 py-1 text-xs font-semibold text-amber-300"
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500">No results yet</span>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-amber-300">{status}</p>
                <p className="mt-2 text-slate-400">Payout: 9x total on exact match.</p>
              </div>
            </section>
          </div>
        </section>

        <aside className="hidden rounded-xl border border-[#2f4553] bg-[#1a2c38] p-3 md:block md:w-[240px] md:flex-shrink-0">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">Other Games</h2>
          <div className="grid gap-2 text-sm">
            <Link href="/playible-online-games/stake" className="rounded-md bg-[#213743] px-3 py-2 text-left hover:bg-[#29414e]">Mines</Link>
            <Link href="/playible-online-games/color-guess" className="rounded-md bg-[#213743] px-3 py-2 text-left hover:bg-[#29414e]">Color Guess</Link>
            <button type="button" className="rounded-md bg-[#213743] px-3 py-2 text-left hover:bg-[#29414e]">Blackjack</button>
            <button type="button" className="rounded-md bg-[#213743] px-3 py-2 text-left hover:bg-[#29414e]">Roulette</button>
            <button type="button" className="rounded-md bg-[#213743] px-3 py-2 text-left hover:bg-[#29414e]">Slots</button>
          </div>
        </aside>
      </div>
    </main>
  );
}
