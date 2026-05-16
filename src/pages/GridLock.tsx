import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, RotateCcw, HelpCircle, Leaf, Trophy, Cloud } from "lucide-react";

// Tile levels: 1=Seed, 2=Water, 3=Sun, 4=Sapling, 5=Tree, 6=Small Forest, 7=Blooming Ecosystem
type Tile = { id: number; level: number; row: number; col: number; merged?: boolean; isNew?: boolean };
type Grid = (Tile | null)[][];

const SIZE = 4;
const STORAGE_KEY = "gridlock_highscore";

const TILE_META: Record<number, { name: string; emoji: string; bg: string; text: string; points: number }> = {
  1: { name: "Seed", emoji: "🌱", bg: "bg-lime-200", text: "text-lime-900", points: 2 },
  2: { name: "Water", emoji: "💧", bg: "bg-sky-200", text: "text-sky-900", points: 2 },
  3: { name: "Sun", emoji: "☀️", bg: "bg-amber-200", text: "text-amber-900", points: 2 },
  4: { name: "Sapling", emoji: "🌿", bg: "bg-emerald-300", text: "text-emerald-900", points: 10 },
  5: { name: "Tree", emoji: "🌳", bg: "bg-emerald-500", text: "text-white", points: 25 },
  6: { name: "Small Forest", emoji: "🌲🌳", bg: "bg-emerald-700", text: "text-white", points: 75 },
  7: { name: "Blooming Ecosystem", emoji: "🌸🦋🌳", bg: "bg-gradient-to-br from-pink-400 via-emerald-500 to-amber-400", text: "text-white", points: 250 },
};

const CO2_PER_LEVEL: Record<number, number> = { 4: 2, 5: 10, 6: 40, 7: 200 };

let idCounter = 1;
const newId = () => idCounter++;

function emptyGrid(): Grid {
  return Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => null));
}

function emptyCells(grid: Grid): [number, number][] {
  const cells: [number, number][] = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (!grid[r][c]) cells.push([r, c]);
  return cells;
}

function spawn(grid: Grid): Grid {
  const cells = emptyCells(grid);
  if (!cells.length) return grid;
  const [r, c] = cells[Math.floor(Math.random() * cells.length)];
  const level = (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3; // Seed, Water, or Sun
  const g = grid.map((row) => row.slice());
  g[r][c] = { id: newId(), level, row: r, col: c, isNew: true };
  return g;
}

// Merge rule: returns resulting level or null if not mergeable
function mergeResult(a: number, b: number): number | null {
  const pair = [a, b].sort((x, y) => x - y).join(",");
  if (pair === "1,2") return 4; // Seed + Water = Sapling
  if (pair === "3,4") return 5; // Sapling + Sun = Tree
  if (a === 5 && b === 5) return 6; // Tree + Tree = Small Forest
  if (a === 6 && b === 6) return 7; // Forest + Forest = Blooming Ecosystem
  return null;
}

type Dir = "up" | "down" | "left" | "right";

function slide(grid: Grid, dir: Dir): { grid: Grid; moved: boolean; gained: number; merges: { level: number }[] } {
  const g = grid.map((row) => row.map((t) => (t ? { ...t, merged: false, isNew: false } : null)));
  let gained = 0;
  let moved = false;
  const merges: { level: number }[] = [];

  const traverse = (cb: (r: number, c: number) => void) => {
    const rs = dir === "down" ? [3, 2, 1, 0] : [0, 1, 2, 3];
    const cs = dir === "right" ? [3, 2, 1, 0] : [0, 1, 2, 3];
    for (const r of rs) for (const c of cs) cb(r, c);
  };

  const vec = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] }[dir];

  traverse((r, c) => {
    const tile = g[r][c];
    if (!tile) return;
    let nr = r, nc = c;
    while (true) {
      const tr = nr + vec[0], tc = nc + vec[1];
      if (tr < 0 || tr >= SIZE || tc < 0 || tc >= SIZE) break;
      const target = g[tr][tc];
      if (!target) { nr = tr; nc = tc; continue; }
      if (!target.merged && !tile.merged) {
        const res = mergeResult(tile.level, target.level);
        if (res !== null) {
          g[tr][tc] = { id: newId(), level: res, row: tr, col: tc, merged: true };
          g[r][c] = null;
          gained += TILE_META[res].points;
          merges.push({ level: res });
          moved = true;
          return;
        }
      }
      break;
    }
    if (nr !== r || nc !== c) {
      g[nr][nc] = { ...tile, row: nr, col: nc };
      g[r][c] = null;
      moved = true;
    }
  });

  return { grid: g, moved, gained, merges };
}

function hasMoves(grid: Grid): boolean {
  if (emptyCells(grid).length) return true;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const t = grid[r][c];
      if (!t) continue;
      for (const [dr, dc] of [[0, 1], [1, 0]]) {
        const nr = r + dr, nc = c + dc;
        if (nr < SIZE && nc < SIZE) {
          const n = grid[nr][nc];
          if (n && mergeResult(t.level, n.level) !== null) return true;
        }
      }
    }
  }
  return false;
}

// Mock sound (no audio asset, just safe stub)
const playSound = (_kind: "merge" | "gameover" | "win") => {};

export default function GridLock() {
  const [grid, setGrid] = useState<Grid>(() => spawn(spawn(emptyGrid())));
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState<number>(() => Number(localStorage.getItem(STORAGE_KEY) || 0));
  const [co2, setCo2] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const move = useCallback((dir: Dir) => {
    if (gameOver) return;
    setGrid((g) => {
      const { grid: ng, moved, gained, merges } = slide(g, dir);
      if (!moved) return g;
      const after = spawn(ng);
      if (gained > 0) playSound("merge");
      let addCo2 = 0;
      let didWin = false;
      for (const m of merges) {
        addCo2 += CO2_PER_LEVEL[m.level] || 0;
        if (m.level === 7) didWin = true;
      }
      setScore((s) => {
        const ns = s + gained;
        setHighScore((h) => {
          if (ns > h) { localStorage.setItem(STORAGE_KEY, String(ns)); return ns; }
          return h;
        });
        return ns;
      });
      if (addCo2) setCo2((c) => c + addCo2);
      if (didWin) { setWon(true); playSound("win"); }
      if (!hasMoves(after)) { setGameOver(true); playSound("gameover"); }
      return after;
    });
  }, [gameOver]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = {
        ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
        w: "up", s: "down", a: "left", d: "right",
      };
      const dir = map[e.key];
      if (dir) { e.preventDefault(); move(dir); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    const ax = Math.abs(dx), ay = Math.abs(dy);
    if (Math.max(ax, ay) < 20) return;
    if (ax > ay) move(dx > 0 ? "right" : "left");
    else move(dy > 0 ? "down" : "up");
    touchStart.current = null;
  };

  const restart = () => {
    setGrid(spawn(spawn(emptyGrid())));
    setScore(0);
    setCo2(0);
    setGameOver(false);
    setWon(false);
  };

  const tiles: Tile[] = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (grid[r][c]) tiles.push(grid[r][c]!);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-lime-50 to-amber-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Link to="/">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
          </Link>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><HelpCircle className="w-4 h-4 mr-1" /> How to Play</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Leaf className="w-5 h-5 text-emerald-600" /> Nature's Order</DialogTitle>
                <DialogDescription>Swipe or use arrow keys to combine elements and build a thriving ecosystem.</DialogDescription>
              </DialogHeader>
              <div className="space-y-2 text-sm">
                <p className="font-semibold">The Ecosystem Chain:</p>
                <ul className="space-y-1.5 text-foreground/80">
                  <li>🌱 Seed + 💧 Water = 🌿 Sapling</li>
                  <li>🌿 Sapling + ☀️ Sun = 🌳 Tree</li>
                  <li>🌳 Tree + 🌳 Tree = 🌲 Small Forest</li>
                  <li>🌲 Forest + 🌲 Forest = 🌸 Blooming Ecosystem 🦋</li>
                </ul>
                <p className="pt-2 text-xs text-muted-foreground">Every tree you grow removes real CO₂ from our planet's story. Build the biggest ecosystem before the grid fills up!</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="text-center mb-4">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-emerald-900">GridLock</h1>
          <p className="text-sm text-emerald-700/70">Nature's Order — a puzzle for our planet</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white/70 backdrop-blur rounded-xl p-3 text-center shadow-sm">
            <div className="text-[10px] uppercase tracking-wide text-emerald-700">Score</div>
            <div className="text-xl font-bold text-emerald-900">{score}</div>
          </div>
          <div className="bg-white/70 backdrop-blur rounded-xl p-3 text-center shadow-sm">
            <div className="text-[10px] uppercase tracking-wide text-amber-700 flex items-center justify-center gap-1"><Trophy className="w-3 h-3" /> High</div>
            <div className="text-xl font-bold text-amber-900">{highScore}</div>
          </div>
          <div className="bg-white/70 backdrop-blur rounded-xl p-3 text-center shadow-sm">
            <div className="text-[10px] uppercase tracking-wide text-sky-700 flex items-center justify-center gap-1"><Cloud className="w-3 h-3" /> CO₂ Offset</div>
            <div className="text-xl font-bold text-sky-900">{co2}kg</div>
          </div>
        </div>

        {/* Board */}
        <div
          className="relative bg-emerald-900/10 rounded-2xl p-2 sm:p-3 shadow-inner touch-none select-none mx-auto"
          style={{ maxWidth: 480 }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Background cells */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {Array.from({ length: SIZE * SIZE }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-emerald-900/5" />
            ))}
          </div>

          {/* Tiles overlay */}
          <div className="absolute inset-2 sm:inset-3 pointer-events-none">
            <div className="relative w-full h-full">
              <AnimatePresence>
                {tiles.map((t) => {
                  const meta = TILE_META[t.level];
                  return (
                    <motion.div
                      key={t.id}
                      initial={{
                        scale: t.isNew ? 0 : 1,
                        opacity: t.isNew ? 0 : 1,
                        left: `calc(${t.col} * (25% + 0px))`,
                        top: `calc(${t.row} * (25% + 0px))`,
                      }}
                      animate={{
                        scale: t.merged ? [1.15, 1] : 1,
                        opacity: 1,
                        left: `calc(${t.col} * 25%)`,
                        top: `calc(${t.row} * 25%)`,
                      }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 28,
                        mass: 0.6,
                      }}
                      className="absolute"
                      style={{ width: "calc(25% - 6px)", height: "calc(25% - 6px)", margin: "3px" }}
                    >
                      <div className={`w-full h-full rounded-xl ${meta.bg} ${meta.text} shadow-md flex flex-col items-center justify-center font-bold`}>
                        <span className="text-2xl sm:text-3xl leading-none">{meta.emoji}</span>
                        <span className="text-[9px] sm:text-[10px] mt-1 opacity-80">{meta.name}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {(gameOver || won) && (
            <div className="absolute inset-0 rounded-2xl bg-white/85 backdrop-blur flex items-center justify-center">
              <div className="text-center p-4">
                <div className="text-3xl mb-2">{won ? "🌸🌳🦋" : "🍂"}</div>
                <h2 className="text-2xl font-bold text-emerald-900">{won ? "Blooming Ecosystem!" : "Grid Locked"}</h2>
                <p className="text-sm text-muted-foreground mt-1">Score: {score} · CO₂ offset: {co2}kg</p>
                <Button onClick={restart} className="mt-4"><RotateCcw className="w-4 h-4 mr-2" /> Play Again</Button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-center gap-2">
          <Button onClick={restart} variant="outline"><RotateCcw className="w-4 h-4 mr-2" /> Restart</Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4 md:hidden">Swipe to play</p>
        <p className="text-center text-xs text-muted-foreground mt-4 hidden md:block">Use arrow keys or WASD to play</p>
      </div>
    </div>
  );
}