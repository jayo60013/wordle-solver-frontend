import { WordResponseData } from "../types/WordResponseData";

const PossibleWord = ({
  wordResponse,
  handleWordClick,
}: {
  wordResponse: WordResponseData
  handleWordClick: (word: string) => void,
}) => {
  const styles = "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset border p-1 m-1 transform hover:scale-125 ";
  const getStyle = (entropy: number): string => {
    if (entropy < 0.2) {
      return styles.concat("bg-green-50 text-green-600 ring-green-500/10")
    } else if (entropy < 0.3) {
      return styles.concat("bg-yellow-50 text-yellow-600 ring-yellow-500/10")
    }
    return styles.concat("bg-red-50 text-red-600 ring-red-500/10")
  }

  return (
    <span
      className={`${getStyle(wordResponse.entropy)}`}
      onClick={() => handleWordClick(wordResponse.word)}>
      {wordResponse.word}
    </span>
  );
}

export default PossibleWord;
