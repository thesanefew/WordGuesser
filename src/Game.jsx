import React, { useState, useEffect } from "react";
import Box from "./Box";
import { getWord } from "./wordgen";

const MAX_LENGTH = 5;          // letters in a word
const MAX_DISPLAY = 5;         // ⬅️ show at most 5 previous guesses



export default function Game() {
  /* ─── state ─────────────────────────────────────────────── */
  const [input,    setInput]    = useState("");
  const [guesses,  setGuesses]  = useState([]);     // array of strings
  const [feedback, setFeedback] = useState([]);     // array of {green,yellow}
  const [shake,    setShake]    = useState(false);
  const [won,      setWon]      = useState(false);
  const [correctWord, setCorrectWord] = useState(null);

  /* ─── keyboard handler ──────────────────────────────────── */
  const handleKeyDown = (e) => {
    if (won) return; // ignore keys after win

    if (e.key === "Enter") {
      if (input.length !== MAX_LENGTH) {
        triggerShake();
        return;
      }
      submitGuess();
    } else if (/^[a-zA-Z]$/.test(e.key)) {
      if (input.length < MAX_LENGTH) setInput(p => p + e.key.toUpperCase());
      else triggerShake();
    } else if (e.key === "Backspace") {
      setInput(p => p.slice(0, -1));
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  /* ─── submit & score a guess ────────────────────────────── */
  const submitGuess = () => {
    const guess    = input;
    const score    = getFeedback(guess, correctWord);
    const nextG    = [guess, ...guesses].slice(0, MAX_DISPLAY);
    const nextF    = [score, ...feedback].slice(0, MAX_DISPLAY);

    setGuesses(nextG);
    setFeedback(nextF);
    setInput("");

    if (guess === correctWord) setWon(true);
  };

  /* plain Wordle-style feedback */
  const getFeedback = (guess, answer) => {
    let green = 0, yellow = 0;
    const gArr = guess.split("");
    const aArr = answer.split("");
    const used = Array(5).fill(false);

    gArr.forEach((c, i) => {            // greens first pass
      if (c === aArr[i]) { green++; used[i] = true; gArr[i] = null; }
    });
    gArr.forEach(c => {                 // yellows second pass
      if (!c) return;
      const j = aArr.findIndex((a,k) => a===c && !used[k]);
      if (j !== -1) { yellow++; used[j] = true; }
    });
    return {green, yellow};
  };

  /* ─── attach / detach key listener ──────────────────────── */
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });
  //this is the word selection done
  useEffect(() => {
    async function loadWord() {
      const word = await getWord();      //  fetch a random word
      setCorrectWord(word);
    }
    loadWord();                          // call it once on mount
  }, []);
  

  /* ─── render ────────────────────────────────────────────── */
  if (!correctWord) return <div className="loading">Loading word...</div>;


  return (
    <div className="game-container">
      {/* ───── PAST GUESSES (top) ───── */}
      <div className="guess-stack">
        {guesses.map((g, idx) => (
          <div className="guess-row" key={idx}>
            {Array.from(g).map((ch,i) => (
              <Box key={i} value={ch} type="guess" />
            ))}
            <div className="feedback">
              <div className="green-box">{feedback[idx]?.green}</div>
              <div className="yellow-box">{feedback[idx]?.yellow}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ───── INPUT ROW (always centred) ───── */}
      <div className={`input-row ${shake ? "shake" : ""}`}>
        {Array.from({length: MAX_LENGTH}).map((_,i) => (
          <Box key={i} value={input[i] || ""} type="input" />
        ))}
      </div>

      {/* ───── WIN MESSAGE ───── */}
      {won && (
          <>
            <div className="win-message">🎉 You guessed it! 🎉</div>
            <button
              className="new-game-button"
              onClick={async () => {
                const newWord = await getWord();  // grab another random word
                setCorrectWord(newWord);          //  update it
                setGuesses([]);
                setFeedback([]);
                setInput("");
                setWon(false);
              }}
            >
              🔁 New Game
            </button>
          </>
        )}

    </div>
  );
}
