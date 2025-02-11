import { Color } from "../types/LetterInputData";

const ColorSelector = ({
  color, handleColorChange
}: {
  color: Color,
  handleColorChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => {

  return (
    <div className="mt-4">
      <div>
        <input
          type="radio"
          id="grey"
          name="color_selector"
          value={Color.GREY}
          checked={color === Color.GREY}
          onChange={handleColorChange}
        />
        <label
          htmlFor="grey"
          className="ml-4">
          Grey
        </label>
      </div>
      <div>
        <input
          type="radio"
          id="yellow"
          name="color_selector"
          value={Color.YELLOW}
          checked={color === Color.YELLOW}
          onChange={handleColorChange}
        />
        <label
          htmlFor="yellow"
          className="ml-4">
          Yellow
        </label>
      </div>
      <div>
        <input
          type="radio"
          id="greenRadioButton"
          name="color_selector"
          value={Color.GREEN}
          checked={color === Color.GREEN}
          onChange={handleColorChange}
        />
        <label
          htmlFor="greenRadioButton"
          className="ml-4">
          Green
        </label>
      </div>
    </div>
  )
};

export default ColorSelector;
