import { createRef, useEffect, useRef, useState } from 'react'
import './App.css'
import InputRow from './components/InputRow'
import { LetterInputData, Color } from './types/LetterInputData';
import axios from 'axios';
import { WordResponseData } from './types/WordResponseData';
import PossibleWord from './components/PossibleWord';
import { Guess } from './types/Guess';

function App() {
  const [rows, setRows] = useState<LetterInputData[][]>(() =>
    Array(6)
      .fill(null)
      .map(() =>
        Array(5).fill(null).map(() => ({
          letter: "",
          color: Color.GREY,
        }))
      )
  );
  const inputRefs = useRef(
    rows.map(() => Array(5).fill(null).map(() => createRef<HTMLInputElement>()))
  );

  const [cursorIdx, setCursorIdx] = useState<number>(0);
  const [lastRowIdx, setLastRowIdx] = useState<number>(1);
  const [possibleWords, setPossibleWords] = useState<WordResponseData[]>([]);
  const [possibleWordCount, setPossibleWordCount] = useState<number>(-1);
  const [totalWordCount, setTotalWordCount] = useState<number>(-1);

  const handleRowChange = (rowIdx: number, newRow: LetterInputData[]) => {
    const updatedRows = [...rows];
    updatedRows[rowIdx] = newRow;

    const greens = newRow
      .reduce<number[]>((acc, letterInputData, i) => {
        if (letterInputData.color === Color.GREEN) {
          acc.push(i)
        }
        return acc;
      }, []);
    for (let i = rowIdx + 1; i < 6; i++) {
      greens.forEach((position) => {
        updatedRows[i][position].color = Color.GREEN;
        updatedRows[i][position].letter = newRow[position].letter;
      })
    }

    setRows(updatedRows);

    inputRefs.current[rowIdx][cursorIdx + 1]?.current?.focus();
    setCursorIdx((prev) => prev + 1);
  }

  const handleWordClick = (word: string) => {
    if (rows.length >= 6) { return; }

    const lastRow = rows[rows.length - 1];
    const newRow = word.split("").map((ch, index) => {
      if (lastRow && lastRow[index].color === Color.GREEN) {
        return {
          letter: lastRow[index].letter,
          color: Color.GREEN,
        };
      }
      return {
        letter: ch,
        color: Color.GREY,
      };
    });
    setRows([...rows, newRow]);
  }

  const addRow = () => {
    if (lastRowIdx > 6) { return; }
    setLastRowIdx((prev) => prev + 1);
    setCursorIdx(0);
  };

  const clearRow = () => {
    const newRows = rows.map((row, index) =>
      index === lastRowIdx - 1
        ? Array(5).fill(null).map(() => ({
          letter: "",
          color: Color.GREY,
        }))
        : row
    );
    setRows(newRows);
    setCursorIdx(0);
  }

  const removeRow = () => {
    if (lastRowIdx > 1) {
      setLastRowIdx((prev) => prev - 1);
      setCursorIdx(0);
    }
  }

  const handleSolve = () => {
    const payload: Guess[] = rows.flatMap((row, i): Guess[] =>
      row
        .map((cell, j): Guess => ({
          turn: i,
          letter: cell.letter,
          position: j,
          color: cell.color.charAt(0).toUpperCase() + cell.color.slice(1),
        }))
        .filter(guess => guess.letter !== "")
        .filter(guess => guess.turn < lastRowIdx)
    );
    console.log(payload);
    axios.post("https://wordlesolverapi.umbra.cyou/possible-words", payload)
      .then(function(response) {
        console.log(response.data);
        setPossibleWords(response.data.word_list);
        setPossibleWordCount(response.data.number_of_words);
        setTotalWordCount(response.data.total_number_of_words);
      }).catch(function(error) {
        console.log(error);
      });
  }

  useEffect(() => {
    inputRefs.current[lastRowIdx - 1][0]?.current?.focus();
  }, [lastRowIdx]);

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-5xl">Wordle Solver</h1>
      {rows.map((row, index) => (
        index < lastRowIdx ? (<InputRow
          key={index}
          row={row}
          rowIdx={index}
          rowRef={inputRefs.current[index]}
          onRowChange={handleRowChange}
        />) : null
      ))}
      <div className="mt-4 ">
        <button
          className="focus:outline-none text-white bg-red-700 hover:bg-red-800 font-bold rounded-lg text-lg px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
          onClick={removeRow}>
          Remove row
        </button>
        <button
          className="text-white bg-yellow-700 hover:bg-yellow-800 font-bold text-lg rounded-lg px-5 py-2.5 me-2 mb-2 dark:bg-yellow-600 dark:hover:bg-yellow-700 focus:outline-none dark:focus:ring-yellow-800"
          onClick={clearRow}>
          Reset row
        </button>
        <button
          className="text-white bg-blue-700 hover:bg-blue-800 font-bold text-lg rounded-lg px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          onClick={addRow}>
          Add new row
        </button>
      </div>

      <button
        className="mt-4 focus:outline-none text-white bg-green-700 hover:bg-green-800 font-bold text-xl rounded-lg px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
        onClick={handleSolve}>
        Solve
      </button>

      {possibleWordCount !== -1 && <p>Total possible words: {possibleWordCount} ({Math.ceil(possibleWordCount / totalWordCount * 100)}%)</p>}
      <div>
        {possibleWords.map((value, i) => (
          <PossibleWord key={i} wordResponse={value} handleWordClick={handleWordClick} />
        ))}
      </div>
    </div>
  )
}

export default App
