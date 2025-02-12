import { LetterInputData, Color } from "../types/LetterInputData";

const LetterInput = ({
  index, value, onLetterChange
}: {
  index: number,
  value: LetterInputData,
  onLetterChange: (index: number, newValue: string) => void
}) => {

  const styles = "w-15 h-15 text-4xl text-white font-bold text-renter capitalize focus:outline-none focus:ring-0 focus:border-transparent text-center"
  const styleVariants = {
    [Color.GREY]: styles.concat(" bg-neutral-500"),
    [Color.YELLOW]: styles.concat(" bg-yellow-500"),
    [Color.GREEN]: styles.concat(" bg-lime-600"),
  }

  return (
    <>
      <input
        className={`${styleVariants[value.color]}`}
        key={index}
        type="text"
        value={value.letter}
        onChange={(e) => onLetterChange(index, e.target.value)}
      />
    </>
  )
}

export default LetterInput;
