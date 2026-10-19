import "./VariantsEditor.css";

import { FaPlus, FaTimes } from "react-icons/fa";

function VariantsEditor({ colors, sizes, onColorsChange, onSizesChange }) {
const updateColor = (index, patch) =>
onColorsChange(
colors.map((color, position) =>
position === index ? { ...color, ...patch } : color
      )
    );

const removeColor = (index) =>
onColorsChange(colors.filter((_, position) => position !== index));

const addColor = () =>
onColorsChange([...colors, { name: "", hex: "#243b8f" }]);

return (
<div className="variants-editor">
<div className="variants-block">
<div className="variants-head">
<span>Colors</span>
<button type="button" onClick={addColor}>
<FaPlus />
Add color
</button>
</div>

        {colors.length === 0&& (
<p className="variants-empty">
No colors. The product is sold as a single option.
</p>
        )}

        {colors.map((color, index) => (
<div className="variants-row" key={index}>
<input
type="color"
value={color.hex}
aria-label="Pick a color"
onChange={(event) => updateColor(index, { hex: event.target.value })}
            />
<input
type="text"
value={color.name}
placeholder="Color name, e.g. Midnight blue"
onChange={(event) => updateColor(index, { name: event.target.value })}
            />
<button
type="button"
className="variants-remove"
aria-label="Remove color"
onClick={() => removeColor(index)}
>
<FaTimes />
</button>
</div>
        ))}
</div>

<label className="variants-block">
Sizes or storage
<input
type="text"
value={sizes}
placeholder="128GB, 256GB, 512GB"
onChange={(event) => onSizesChange(event.target.value)}
        />
<small>Separate the options with commas.</small>
</label>
</div>
  );
}

export default VariantsEditor;

