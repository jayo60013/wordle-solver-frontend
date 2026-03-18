import { RefObject } from "react";
import { LetterInputData, Color } from "../types/LetterInputData";
import LetterInput from "./LetterInput";

const InputRow = ({
  row, rowIdx, rowRef, isActive, onRowChange
}: {
  row: LetterInputData[],
  rowIdx: number,
  rowRef: RefObject<HTMLInputElement | null>[],
  isActive: boolean,
  onRowChange: (rowIdx: number, newRow: LetterInputData[]) => void
}) => {

  const handleInputChange = (index: number, newValue: string) => {
    const updatedRow = [...row];
    const newLetter = newValue.slice(-1).toLowerCase();
    if (newLetter === "") {
      updatedRow[index] = {
        letter: "",
        color: updatedRow[index].color,
      };
      onRowChange(rowIdx, updatedRow);
      return;
    }
    if (!/^[a-z]$/.test(newLetter)) return;

    updatedRow[index] = {
      letter: newLetter,
      color: updatedRow[index].color,
    };
    onRowChange(rowIdx, updatedRow);

    if (index < rowRef.length - 1) {
      rowRef[index + 1]?.current?.focus();
    }
  }

  const getNextColor = (color: Color): Color => {
    switch (color) {
      case Color.GREY:
        return Color.YELLOW;
      case Color.YELLOW:
        return Color.GREEN;
      case Color.GREEN:
        return Color.GREY;
      default:
        throw new Error("Invalid color");
    }
  }

  const handleInputClick = (index: number, color: Color) => {
    const updatedRow = [...row];
    if (updatedRow[index].letter === "") {
      return;
    }

    updatedRow[index] = {
      letter: updatedRow[index].letter,
      color: getNextColor(color),
    }
    onRowChange(rowIdx, updatedRow);
  }

  const handleInputKeyDown = (index: number, key: string) => {
    if (key === "Backspace" && row[index].letter === "" && index > 0) {
      rowRef[index - 1]?.current?.focus();
      return;
    }
    if (key === "ArrowLeft" && index > 0) {
      rowRef[index - 1]?.current?.focus();
      return;
    }
    if (key === "ArrowRight" && index < rowRef.length - 1) {
      rowRef[index + 1]?.current?.focus();
    }
  }

  return (
    <div className={`mt-2 flex items-center justify-center gap-2 rounded-md p-1 ${isActive ? "bg-[#f0f0f1]" : ""}`}>
      {row.map((value, index) => (
        <LetterInput
          key={index}
          index={index}
          value={value}
          ref={rowRef[index]}
          onLetterChange={handleInputChange}
          onLetterClick={handleInputClick}
          onLetterKeyDown={handleInputKeyDown}
        />
      ))}
    </div>
  );

};

export default InputRow;
