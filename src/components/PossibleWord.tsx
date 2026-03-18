import { WordResponseData } from "../types/WordResponseData";

const PossibleWord = ({
  wordResponse,
  handleWordClick,
}: {
  wordResponse: WordResponseData
  handleWordClick: (word: string) => void,
}) => {
  const styles = "m-1 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-sm";
  const getStyle = (entropy: number): string => {
    if (entropy > 5) {
      return styles.concat(" border-[#d6ead5] bg-[#edf7ec] text-[#2f6b2c]")
    } else if (entropy > 3) {
      return styles.concat(" border-[#efe2be] bg-[#fff7e0] text-[#8a6d1f]")
    }
    return styles.concat(" border-[#f0d0d0] bg-[#fff0f0] text-[#8f3a3a]")
  }

  return (
    <button
      type="button"
      className={`${getStyle(wordResponse.entropy)}`}
      onClick={() => handleWordClick(wordResponse.word)}>
      <span>{wordResponse.is_answer ? "⭐" : ""} {wordResponse.word.toUpperCase()}</span>
      <span className="text-xs opacity-75">H {wordResponse.entropy.toFixed(2)}</span>
    </button>
  );
}

export default PossibleWord;
