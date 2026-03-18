import { createRef, useEffect, useRef, useState } from 'react'
import './App.css'
import InputRow from './components/InputRow'
import { LetterInputData, Color } from './types/LetterInputData';
import axios from 'axios';
import { WordResponseData } from './types/WordResponseData';
import PossibleWord from './components/PossibleWord';
import { Guess } from './types/Guess';

const ROW_COUNT = 6;
const WORD_LENGTH = 5;

const createEmptyRow = (): LetterInputData[] =>
    Array.from({ length: WORD_LENGTH }, () => ({
        letter: "",
        color: Color.GREY,
    }));

function App() {
    const [rows, setRows] = useState<LetterInputData[][]>(() =>
        Array.from({ length: ROW_COUNT }, () => createEmptyRow())
    );
    const inputRefs = useRef(
        Array.from({ length: ROW_COUNT }, () =>
            Array.from({ length: WORD_LENGTH }, () => createRef<HTMLInputElement>())
        )
    );

    const [lastRowIdx, setLastRowIdx] = useState<number>(1);
    const [possibleWords, setPossibleWords] = useState<WordResponseData[]>([]);
    const [possibleWordCount, setPossibleWordCount] = useState<number>(-1);
    const [totalWordCount, setTotalWordCount] = useState<number>(-1);
    const [isSolving, setIsSolving] = useState<boolean>(false);
    const [apiError, setApiError] = useState<string>("");
    const [showOnlyAnswers, setShowOnlyAnswers] = useState<boolean>(false);

    const focusCell = (rowIdx: number, colIdx: number) => {
        inputRefs.current[rowIdx]?.[colIdx]?.current?.focus();
    }

    const handleRowChange = (rowIdx: number, newRow: LetterInputData[]) => {
        const updatedRows = rows.map((row) => row.map((cell) => ({ ...cell })));
        updatedRows[rowIdx] = newRow.map((cell) => ({ ...cell }));

        const greens = newRow
            .reduce<number[]>((acc, letterInputData, i) => {
                if (letterInputData.color === Color.GREEN) {
                    acc.push(i)
                }
                return acc;
            }, []);
        for (let i = rowIdx + 1; i < ROW_COUNT; i++) {
            greens.forEach((position) => {
                updatedRows[i][position].color = Color.GREEN;
                updatedRows[i][position].letter = newRow[position].letter;
            })
        }

        setRows(updatedRows);
    }

    const handleWordClick = (word: string) => {
        if (lastRowIdx >= ROW_COUNT) {
            setApiError("No empty rows left. Remove or reset a row to add another guess.");
            return;
        }

        const sourceRowIdx = lastRowIdx - 1;
        const targetRowIdx = lastRowIdx;
        if (sourceRowIdx < 0 || targetRowIdx >= ROW_COUNT) { return; }

        setApiError("");

        const previousRow = rows[sourceRowIdx];
        const seededRow = word.slice(0, WORD_LENGTH).split("").map((ch, index) => {
            if (previousRow?.[index].color === Color.GREEN) {
                return {
                    letter: previousRow[index].letter,
                    color: Color.GREEN,
                };
            }
            return {
                letter: ch.toLowerCase(),
                color: Color.GREY,
            };
        });

        while (seededRow.length < WORD_LENGTH) {
            seededRow.push({ letter: "", color: Color.GREY });
        }

        const updatedRows = rows.map((row) => row.map((cell) => ({ ...cell })));
        updatedRows[targetRowIdx] = seededRow;
        setRows(updatedRows);
        setLastRowIdx((prev) => Math.min(prev + 1, ROW_COUNT));

        const firstEmptyIdx = seededRow.findIndex((cell) => cell.letter === "");
        const focusIdx = firstEmptyIdx === -1 ? WORD_LENGTH - 1 : firstEmptyIdx;
        requestAnimationFrame(() => focusCell(targetRowIdx, focusIdx));
    }

    const addRow = () => {
        if (lastRowIdx >= ROW_COUNT) { return; }
        setLastRowIdx((prev) => prev + 1);
    };

    const clearRow = () => {
        const newRows = rows.map((row, index) =>
            index === lastRowIdx - 1
                ? createEmptyRow()
                : row
        );
        setRows(newRows);
        focusCell(lastRowIdx - 1, 0);
    }

    const removeRow = () => {
        if (lastRowIdx > 1) {
            setLastRowIdx((prev) => prev - 1);
        }
    }

    const handleSolve = async () => {
        const payload: Guess[] = rows.slice(0, lastRowIdx).flatMap((row, i): Guess[] =>
            row
                .map((cell, j): Guess => ({
                    turn: i,
                    letter: cell.letter,
                    position: j,
                    color: cell.color.charAt(0).toUpperCase() + cell.color.slice(1),
                }))
                .filter(guess => guess.letter !== "")
        );

        if (payload.length === 0) {
            setApiError("Add at least one letter before solving.");
            return;
        }

        setApiError("");
        setIsSolving(true);

        try {
            const response = await axios.post("http://localhost:5307/possible-words", payload);
            setPossibleWords(response.data.word_list);
            setPossibleWordCount(response.data.number_of_words);
            setTotalWordCount(response.data.total_number_of_words);
        } catch (error: unknown) {
            const apiMessage = axios.isAxiosError(error)
                ? (typeof error.response?.data?.error === "string" ? error.response.data.error : "")
                : "";

            setApiError(apiMessage || "Could not reach the solver API at http://localhost:5307.");
        } finally {
            setIsSolving(false);
        }
    }

    useEffect(() => {
        focusCell(lastRowIdx - 1, 0);
    }, [lastRowIdx]);

    const canAddRow = lastRowIdx < ROW_COUNT;
    const canRemoveRow = lastRowIdx > 1;
    const visibleRows = rows.slice(0, lastRowIdx);
    const hasAnyInput = visibleRows.some((row) => row.some((cell) => cell.letter !== ""));
    const hasIncompleteWord = visibleRows.some((row) => {
        const lettersInRow = row.filter((cell) => cell.letter !== "").length;
        return lettersInRow > 0 && lettersInRow < WORD_LENGTH;
    });
    const filteredPossibleWords = showOnlyAnswers
        ? possibleWords.filter((word) => word.is_answer)
        : possibleWords;
    const hasSuggestions = filteredPossibleWords.length > 0;

    return (
        <div className="min-h-screen bg-[#f6f7f8] px-4 py-8 text-[#1a1a1b]">
            <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4">
                <div className="w-full border-b border-[#d7dadc] pb-4 text-center">
                    <h1 className="text-4xl font-extrabold uppercase tracking-[0.25em]">Wordle Solver</h1>
                    <p className="mt-2 text-sm text-[#787c7e]">Type guesses, click tiles to set colors, then solve.</p>
                </div>

                <div className="w-full rounded-xl border border-[#d7dadc] bg-white p-4 shadow-sm">
                    {rows.map((row, index) => (
                        index < lastRowIdx ? (
                            <InputRow
                                key={index}
                                row={row}
                                rowIdx={index}
                                rowRef={inputRefs.current[index]}
                                isActive={index === lastRowIdx - 1}
                                onRowChange={handleRowChange}
                            />
                        ) : null
                    ))}
                </div>

                <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
                    <button
                        className="rounded-md border border-[#d7dadc] bg-white px-4 py-2 text-sm font-semibold text-[#3a3a3c] transition hover:bg-[#f0f0f1] disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={removeRow}
                        disabled={!canRemoveRow || isSolving}>
                        Remove row
                    </button>
                    <button
                        className="rounded-md border border-[#d7dadc] bg-white px-4 py-2 text-sm font-semibold text-[#3a3a3c] transition hover:bg-[#f0f0f1] disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={clearRow}
                        disabled={isSolving}>
                        Reset row
                    </button>
                    <button
                        className="rounded-md border border-[#d7dadc] bg-white px-4 py-2 text-sm font-semibold text-[#3a3a3c] transition hover:bg-[#f0f0f1] disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={addRow}
                        disabled={!canAddRow || isSolving}>
                        Add row
                    </button>
                    <button
                        className="rounded-md bg-[#6aaa64] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5c9557] disabled:cursor-not-allowed disabled:bg-[#9db59a]"
                        onClick={handleSolve}
                        disabled={!hasAnyInput || hasIncompleteWord || isSolving}>
                        {isSolving ? "Solving..." : "Solve"}
                    </button>
                </div>

                {hasIncompleteWord && !isSolving && (
                    <p className="w-full text-sm text-[#787c7e]">Finish each started row (5 letters) before solving.</p>
                )}

                {apiError !== "" && (
                    <p className="w-full rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{apiError}</p>
                )}

                <div className="w-full rounded-xl border border-[#d7dadc] bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold">Suggestions</h2>
                            <label className="mt-1 inline-flex cursor-pointer items-center gap-2 text-xs text-[#787c7e]">
                                <span>Only answers</span>
                                <span className="relative inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        className="peer sr-only"
                                        checked={showOnlyAnswers}
                                        onChange={() => setShowOnlyAnswers((prev) => !prev)}
                                    />
                                    <span className="h-5 w-9 rounded-full bg-[#d7dadc] transition-colors peer-checked:bg-[#6aaa64]" />
                                    <span className="pointer-events-none absolute left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
                                </span>
                            </label>
                        </div>
                        {isSolving ? (
                            <div className="inline-flex items-center gap-2 text-sm text-[#787c7e]">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#d7dadc] border-t-[#6aaa64]" aria-hidden="true" />
                                Updating...
                            </div>
                        ) : possibleWordCount !== -1 && (
                            <p className="text-sm text-[#787c7e]">
                                {possibleWordCount} / {totalWordCount} ({Math.ceil((possibleWordCount / totalWordCount) * 100)}%)
                            </p>
                        )}
                    </div>
                    <div className="relative">
                        <div className={`max-h-64 overflow-y-auto transition-opacity ${isSolving ? "pointer-events-none opacity-50" : ""}`}>
                            {!hasSuggestions ? (
                                <p className="text-sm text-[#787c7e]">
                                    {isSolving
                                        ? "Loading suggestions..."
                                        : (showOnlyAnswers
                                            ? "No answer-only suggestions in this result set."
                                            : "No suggestions yet. Press Solve to fetch candidates.")}
                                </p>
                            ) : (
                                filteredPossibleWords.map((value) => (
                                    <PossibleWord key={value.word} wordResponse={value} handleWordClick={handleWordClick} />
                                ))
                            )}
                        </div>
                        {isSolving && hasSuggestions && (
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                <div className="inline-flex items-center gap-2 rounded-full border border-[#d7dadc] bg-white/95 px-3 py-1 text-sm text-[#3a3a3c] shadow-sm">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#d7dadc] border-t-[#6aaa64]" aria-hidden="true" />
                                    Fetching new results...
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App
