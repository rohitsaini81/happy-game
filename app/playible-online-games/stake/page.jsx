"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";

const GRID_SIDE = 5;
const TOTAL_TILES = GRID_SIDE * GRID_SIDE;
const HOUSE_EDGE = 0.97;
const REVEAL_STEP_MS = 180;

function createEmptyBoard() {
  return Array.from({ length: TOTAL_TILES }, (_, index) => ({
    index,
    isMine: false,
    revealed: false,
  }));
}

function calculateMultiplier(minesCount, safeReveals) {
  if (safeReveals <= 0) return 1;

  let multiplier = 1;
  for (let i = 0; i < safeReveals; i += 1) {
    multiplier *= (TOTAL_TILES - i) / (TOTAL_TILES - minesCount - i);
  }

  return multiplier * HOUSE_EDGE;
}

export default function StakeGamePage() {
  const casinoGames = [
    { name: "Mines", href: "/playible-online-games/stake", active: true },
    { name: "Number Guess", href: "/playible-online-games/number-guess" },
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
  const [minesInput, setMinesInput] = useState("3");
  const [board, setBoard] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const [gameActive, setGameActive] = useState(false);
  const [safeReveals, setSafeReveals] = useState(0);
  const [statusText, setStatusText] = useState("Set bet and mines, then start.");
  const [currentBet, setCurrentBet] = useState(0);
  const [lastProfit, setLastProfit] = useState(0);
  const [revealingTileIndex, setRevealingTileIndex] = useState(null);
  const [revealStage, setRevealStage] = useState(0);

  const clickAudioRef = useRef(null);
  const bombAudioRef = useRef(null);
  const winAudioRef = useRef(null);
  const finalWinAudioRef = useRef(null);

  const playAudio = (audioRef) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  };

  const minesCount = Number(minesInput);
  const multiplier = useMemo(
    () => calculateMultiplier(minesCount, safeReveals),
    [minesCount, safeReveals]
  );
  const cashoutValue = currentBet > 0 ? currentBet * multiplier : 0;

  const startRound = () => {
    const start = async () => {
    playAudio(clickAudioRef);
    const bet = Number(betInput);

    if (!Number.isFinite(bet) || bet <= 0) {
      setStatusText("Enter a valid bet amount.");
      return;
    }
    if (!Number.isInteger(minesCount) || minesCount < 1 || minesCount > 24) {
      setStatusText("Mines must be between 1 and 24.");
      return;
    }
    if (bet > balance) {
      setStatusText("Insufficient balance for this bet.");
      return;
    }

      try {
        const response = await fetch("/api/games/stake/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ minesCount }),
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok || !payload?.sessionId) {
          setStatusText(payload?.error || "Unable to start round.");
          return;
        }

        setBalance((prev) => prev - bet);
        setCurrentBet(bet);
        setBoard(createEmptyBoard());
        setSessionId(payload.sessionId);
        setSafeReveals(0);
        setLastProfit(0);
        setRevealingTileIndex(null);
        setRevealStage(0);
        setGameActive(true);
        setStatusText("Round started. Pick a tile or cash out anytime.");
      } catch {
        setStatusText("Unable to start round.");
      }
    };

    start();
  };

  const cashOut = () => {
    const cashout = async () => {
      if (!gameActive || safeReveals <= 0 || revealingTileIndex !== null || !sessionId) return;
      playAudio(clickAudioRef);

      try {
        const response = await fetch("/api/games/stake/cashout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok || typeof payload?.multiplier !== "number") {
          setStatusText(payload?.error || "Unable to cash out.");
          return;
        }

        const payout = Number((currentBet * payload.multiplier).toFixed(2));
        const profit = Number((payout - currentBet).toFixed(2));
        setBalance((prev) => prev + payout);
        setLastProfit(profit);
        setGameActive(false);
        setSessionId("");
        setStatusText(`Cashed out ${payout.toFixed(2)} (${profit >= 0 ? "+" : ""}${profit.toFixed(2)}).`);
        playAudio(finalWinAudioRef);
      } catch {
        setStatusText("Unable to cash out.");
      }
    };

    cashout();
  };

  const onTileClick = async (tileIndex) => {
    if (!gameActive || revealingTileIndex !== null || !sessionId) return;

    const clickedTile = board[tileIndex];
    if (!clickedTile || clickedTile.revealed) return;

    playAudio(clickAudioRef);
    setRevealingTileIndex(tileIndex);
    setRevealStage(1);
    await new Promise((resolve) => setTimeout(resolve, REVEAL_STEP_MS));
    setRevealStage(2);
    await new Promise((resolve) => setTimeout(resolve, REVEAL_STEP_MS));
    setRevealStage(0);
    setRevealingTileIndex(null);

    try {
      const response = await fetch("/api/games/stake/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, tileIndex }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatusText(payload?.error || "Unable to reveal tile.");
        return;
      }

      if (payload?.isMine) {
        const mineIndexes = new Set(Array.isArray(payload?.mineIndexes) ? payload.mineIndexes : []);
        const explodedBoard = board.map((tile) => ({
          ...tile,
          revealed: tile.index === tileIndex || mineIndexes.has(tile.index),
          isMine: mineIndexes.has(tile.index),
        }));
        setBoard(explodedBoard);
        setGameActive(false);
        setSessionId("");
        setLastProfit(-currentBet);
        setStatusText("Boom. You hit a mine and lost this bet.");
        playAudio(bombAudioRef);
        return;
      }

      const nextSafeCount = Number(payload?.safeReveals || safeReveals + 1);
      const nextMultiplier = Number(payload?.multiplier || calculateMultiplier(minesCount, nextSafeCount));
      const updatedBoard = board.map((tile) =>
        tile.index === tileIndex ? { ...tile, revealed: true, isMine: false } : tile
      );

      setBoard(updatedBoard);
      setSafeReveals(nextSafeCount);
      setStatusText(`Safe pick ${nextSafeCount}. Multiplier ${nextMultiplier.toFixed(2)}x`);
      playAudio(winAudioRef);
    } catch {
      setStatusText("Unable to reveal tile.");
    }
  };

  return (
    <main className="min-h-screen bg-[#0f212e] text-white">
      <audio ref={clickAudioRef} src="/mine/button-click.mp3" preload="auto" />
      <audio ref={bombAudioRef} src="/mine/bomb_5.mp3" preload="auto" />
      <audio ref={winAudioRef} src="/mine/win-display-4.mp3" preload="auto" />
      <audio ref={finalWinAudioRef} src="/mine/final-win-4.mp3" preload="auto" />

      <header className="sticky top-0 z-20 border-b border-[#2f4553] bg-[#1a2c38]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="text-xl font-extrabold tracking-tight text-[#00e701]">
              Stake
            </span>
            <nav className="hidden gap-3 text-sm md:flex">
              <button type="button" className="rounded-md bg-[#2f4553] px-3 py-1.5">
                Casino
              </button>
              <button type="button" className="rounded-md px-3 py-1.5 text-slate-300 hover:bg-[#2f4553]">
                Sports
              </button>
              <button type="button" className="rounded-md px-3 py-1.5 text-slate-300 hover:bg-[#2f4553]">
                Live
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#0f212e] px-3 py-1.5 text-xs font-semibold text-slate-300">
              Wallet: {balance.toFixed(2)}
            </span>
            <Link
              href="/playible-online-games"
              className="rounded-md bg-[#2f4553] px-3 py-1.5 text-sm font-semibold hover:bg-[#3e5664]"
            >
              Games
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:flex-row md:items-start">
        <aside className="hidden rounded-xl border border-[#2f4553] bg-[#1a2c38] p-3 md:block md:w-[220px] md:flex-shrink-0">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
            Casino Games
          </h2>
          <div className="space-y-2">
            {casinoGames.map((game) => (
              <Link
                key={game.name}
                href={game.href || "#"}
                className={`block w-full rounded-md px-3 py-2 text-left text-sm font-semibold ${
                  game.active
                    ? "bg-[#00e701] text-[#071824]"
                    : "bg-[#213743] text-slate-200 hover:bg-[#29414e]"
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
              <h1 className="text-2xl font-bold text-white">Stake Mines</h1>
              <span className="rounded-md bg-[#1a2c38] px-2 py-1 text-xs text-slate-300">
                {gameActive ? "Round Active" : "Idle"}
              </span>
            </div>

            <section className="rounded-xl border border-[#2f4553] bg-[#1a2c38] p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Mines</h2>
                <span className="rounded-md bg-[#0f212e] px-2 py-1 text-xs text-slate-300">
                  Stake Originals
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: TOTAL_TILES }, (_, tileIndex) => {
                  const tile = board[tileIndex];
                  const revealed = Boolean(tile?.revealed);
                  const isMine = Boolean(tile?.isMine);
                  const isAnimatingTile = revealingTileIndex === tileIndex;
                  const showSparkleOne = isAnimatingTile && revealStage === 1;
                  const showSparkleTwo = isAnimatingTile && revealStage === 2;

                  return (
                    <button
                      key={tileIndex}
                      type="button"
                      onClick={() => onTileClick(tileIndex)}
                      disabled={!gameActive || revealed || revealingTileIndex !== null}
                      className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-md border transition ${
                        revealed && isMine
                          ? "border-rose-400 bg-rose-950/80"
                          : revealed
                          ? "border-emerald-300 bg-emerald-950/60"
                          : "border-[#2f4553] bg-[#213743] hover:border-[#557086] hover:bg-[#29414e] disabled:cursor-not-allowed"
                      }`}
                    >
                      {showSparkleOne ? (
                        <Image
                          src="/mine/sparkle_1.webp"
                          alt="sparkle"
                          width={72}
                          height={72}
                          className="h-12 w-12 opacity-90"
                        />
                      ) : showSparkleTwo ? (
                        <Image
                          src="/mine/sparkle_2.webp"
                          alt="sparkle"
                          width={72}
                          height={72}
                          className="h-12 w-12 opacity-90"
                        />
                      ) : !revealed ? null : isMine ? (
                        <Image
                          src="/mine/bomb.png"
                          alt="bomb"
                          width={72}
                          height={72}
                          className="h-14 w-14 scale-125"
                        />
                      ) : (
                        <Image
                          src="/mine/diamond-final-2.45db6fa7.png"
                          alt="diamond"
                          width={72}
                          height={72}
                          className="h-8 w-8"
                        />
                      )}
                    </button>
                  );
                })}
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
                    step="1"
                    value={betInput}
                    onChange={(e) => setBetInput(e.target.value)}
                    disabled={gameActive}
                    className="w-full rounded-md border border-[#2f4553] bg-[#0f212e] px-3 py-2 outline-none ring-emerald-400 focus:ring-2 disabled:opacity-60"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-slate-200">Mines (1-24)</span>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    step="1"
                    value={minesInput}
                    onChange={(e) => setMinesInput(e.target.value)}
                    disabled={gameActive}
                    className="w-full rounded-md border border-[#2f4553] bg-[#0f212e] px-3 py-2 outline-none ring-emerald-400 focus:ring-2 disabled:opacity-60"
                  />
                </label>
              </div>

              <div className="mt-4 grid gap-2">
                <button
                  type="button"
                  onClick={startRound}
                  disabled={gameActive || revealingTileIndex !== null}
                  className="rounded-md bg-[#00e701] px-4 py-2 font-semibold text-[#071824] hover:bg-[#4bff4f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Start Round
                </button>
                <button
                  type="button"
                  onClick={cashOut}
                  disabled={!gameActive || safeReveals === 0 || revealingTileIndex !== null}
                  className="rounded-md bg-[#f9a825] px-4 py-2 font-semibold text-[#071824] hover:bg-[#fbbf24] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cash Out {cashoutValue > 0 ? `(${cashoutValue.toFixed(2)})` : ""}
                </button>
              </div>

              <div className="mt-4 rounded-md border border-[#2f4553] bg-[#0f212e] p-3 text-sm text-slate-200">
                <p>Current Bet: {currentBet.toFixed(2)}</p>
                <p>Safe Picks: {safeReveals}</p>
                <p>Multiplier: {multiplier.toFixed(2)}x</p>
                <p>Profit: {lastProfit >= 0 ? "+" : ""}{lastProfit.toFixed(2)}</p>
                <p className="mt-2 text-emerald-300">{statusText}</p>
              </div>
            </section>
          </div>
        </section>

        <aside className="hidden rounded-xl border border-[#2f4553] bg-[#1a2c38] p-3 md:block md:w-[240px] md:flex-shrink-0">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
            Other Games
          </h2>
          <div className="grid gap-2 text-sm">
            <Link href="/playible-online-games/number-guess" className="rounded-md bg-[#213743] px-3 py-2 text-left hover:bg-[#29414e]">Number Guess</Link>
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
