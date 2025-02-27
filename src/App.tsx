import { useState } from 'react'
import './App.css'
import InputRow from './components/InputRow'
import ColorSelector from './components/ColorSelector';
import { LetterInputData, Color } from './types/LetterInputData';
import axios from 'axios';
import { WordResponseData } from './types/WordResponseData';
import PossibleWord from './components/PossibleWord';
import { Guess } from './types/Guess';

function App() {
  //TODO: Generate all of them at once, then use an index to control how many to show
  const [rows, setRows] = useState<LetterInputData[][]>(() => [
    Array(5).fill(null).map(() => ({
      letter: "",
      color: Color.GREY,
    }))
  ]);
  const [currentColor, setColor] = useState<Color>(Color.GREY);
  const [possibleWords, setPossibleWords] = useState<WordResponseData[]>([]);
  const [possibleWordCount, setPossibleWordCount] = useState<number>(-1);
  const [totalWordCount, setTotalWordCount] = useState<number>(-1);

  const handleRowChange = (rowIdx: number, newRow: LetterInputData[]) => {
    const updatedRow = [...rows];
    updatedRow[rowIdx] = newRow;
    setRows(updatedRow);
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value as Color)
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
    if (rows.length >= 6) { return; }

    const lastRow = rows[rows.length - 1];
    const newRow = Array(5).fill(null).map((_, index) => {
      if (lastRow && lastRow[index].color === Color.GREEN) {
        return {
          letter: lastRow[index].letter,
          color: Color.GREEN,
        };
      }
      return {
        letter: "",
        color: Color.GREY,
      };
    });
    setRows([...rows, newRow]);
  };

  const clearRow = () => {
    const newRows = rows.map((row, index) =>
      index === rows.length - 1 // Check if it's the last row
        ? Array(5).fill(null).map(() => ({
          letter: "",
          color: Color.GREY,
        }))
        : row
    );
    setRows(newRows);
  }

  const removeRow = () => {
    if (rows.length > 1) {
      const newRows = rows.slice(0, -1);
      setRows(newRows);
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
    );
    console.log(payload);
    axios.post("http://localhost:5307/possible-words", payload)
      .then(function(response) {
        console.log(response.data);
        setPossibleWords(response.data.word_list);
        setPossibleWordCount(response.data.number_of_words);
        setTotalWordCount(response.data.total_number_of_words);
      }).catch(function(error) {
        console.log(error);
      });
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-5xl">Wordle Solver</h1>
      {rows.map((row, index) => (
        <InputRow key={index} row={row} color={currentColor} rowIdx={index} onRowChange={handleRowChange} />
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

      <ColorSelector color={currentColor} handleColorChange={handleColorChange} />

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
