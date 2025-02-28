import { Ref } from "react";
import { LetterInputData, Color } from "../types/LetterInputData";
import LetterInput from "./LetterInput";

const InputRow = ({
  row, rowIdx, rowRef, onRowChange
}: {
  row: LetterInputData[],
  rowIdx: number,
  rowRef: Ref<HTMLInputElement>[],
  onRowChange: (rowIdx: number, newRow: LetterInputData[]) => void
}) => {

  const handleInputChange = (index: number, newValue: string) => {
    const updatedRow = [...row];
    const newLetter = newValue.slice(-1).toLowerCase();
    if (/^[^a-z]$/.test(newLetter)) return;

    updatedRow[index] = {
      letter: newLetter,
      color: updatedRow[index].color,
    };
    onRowChange(rowIdx, updatedRow);
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
    console.log(updatedRow[index].letter === "")
    if (updatedRow[index].letter === "") {
      return;
    }

    updatedRow[index] = {
      letter: updatedRow[index].letter,
      color: getNextColor(color),
    }
    onRowChange(rowIdx, updatedRow);
  }

  return (
    <div className="flex items-center gap-3 mt-3">
      {row.map((value, index) => (
        <LetterInput
          key={index}
          index={index}
          value={value}
          ref={rowRef[index]}
          onLetterChange={handleInputChange}
          onLetterClick={handleInputClick}
        />
      ))}
    </div>
  );

};

export default InputRow;
