import { LetterInputData, Color } from "../types/LetterInputData";
import LetterInput from "./LetterInput";

const InputRow = ({
  row, rowIdx, color, onRowChange
}: {
  row: LetterInputData[],
  rowIdx: number,
  color: Color,
  onRowChange: (rowIdx: number, newRow: LetterInputData[]) => void
}) => {

  const handleInputChange = (index: number, newValue: string) => {
    const updatedRow = [...row];
    const newLetter = newValue.slice(-1).toLowerCase();
    if (/^[^a-z]$/.test(newLetter)) return;

    updatedRow[index] = {
      letter: newLetter,
      color: color,
    };
    onRowChange(rowIdx, updatedRow);
  }

  return (
    <div className="flex items-center gap-3 mt-3">
      {row.map((value, index) => (
        <LetterInput
          key={index}
          index={index}
          value={value}
          onLetterChange={handleInputChange}
        />
      ))}
    </div>
  );

};

export default InputRow;
