import { RefObject } from "react";
import { LetterInputData, Color } from "../types/LetterInputData";

const LetterInput = ({
  index, value, ref, onLetterChange, onLetterClick, onLetterKeyDown
}: {
  index: number,
  value: LetterInputData,
  ref: RefObject<HTMLInputElement | null>,
  onLetterChange: (index: number, newValue: string) => void,
  onLetterClick: (index: number, color: Color) => void,
  onLetterKeyDown: (index: number, key: string) => void,
}) => {

  const styles = "h-14 w-14 select-none border-2 text-center text-2xl font-bold uppercase caret-transparent transition-colors focus:outline-none"
  const styleVariants = {
    [Color.GREY]: styles.concat(" border-[#787c7e] bg-[#787c7e] text-white"),
    [Color.YELLOW]: styles.concat(" border-[#c9b458] bg-[#c9b458] text-white"),
    [Color.GREEN]: styles.concat(" border-[#6aaa64] bg-[#6aaa64] text-white"),
  }

  const emptyTileStyle = styles.concat(" border-[#d3d6da] bg-white text-[#1a1a1b]")
  const tileClassName = value.letter === "" ? emptyTileStyle : styleVariants[value.color]

  return (
    <input
      className={tileClassName}
      key={index}
      type="text"
      value={value.letter}
      maxLength={1}
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      ref={ref}
      aria-label={`Letter ${index + 1}`}
      onChange={(e) => onLetterChange(index, e.target.value)}
      onMouseDown={(e) => {
        if (e.detail > 1) {
          e.preventDefault();
        }
      }}
      onDoubleClick={(e) => e.preventDefault()}
      onClick={() => onLetterClick(index, value.color)}
      onKeyDown={(e) => onLetterKeyDown(index, e.key)}
    />
  )
}

export default LetterInput;
