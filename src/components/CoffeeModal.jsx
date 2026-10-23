import { useState } from "react"
import { getCoffeeImageUrl } from "../services/coffeeService"

const emptyForm = {
  name: "", ingredients: "", method: "", tried: false, tried_date: "",
  rating: "", note: "", thoughts: "",
}

export default function CoffeeModal({ coffee, onClose, onSaved }) {
  const [form, setForm] = useState(() => coffee ? {
    ...emptyForm,
    name: coffee.name || "",

    ingredients: Array.isArray(coffee.ingredients)
      ? coffee.ingredients.join("\n")
      : coffee.ingredients || "",

    method: Array.isArray(coffee.method)
      ? coffee.method.join("\n")
      : coffee.method || "",
      
    tried: Boolean(coffee.tried),
    tried_date: coffee.tried_date || "",
    rating: coffee.rating ?? "",
    note: coffee.note || "",
    thoughts: coffee.thoughts || "",
  } : emptyForm)
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  function update(field, value) {
    setForm(current => ({ ...current, [field]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError("")
    try {
      await onSaved({
        ...form,

        ingredients: form.ingredients
          .split("\n")
          .map(line => line.trim())
          .filter(Boolean),

        method: form.method
          .split("\n")
          .map(line => line.trim())
          .filter(Boolean),

        tried_date: form.tried ? form.tried_date || null : null,
        rating: form.tried && form.rating !== "" ? Number(form.rating) : null,
        note: form.tried ? form.note : "",
        thoughts: form.tried ? form.thoughts : "",
        imageFile,
      })
    } catch (err) {
      setError(err.message || "Unable to save this coffee.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div id="coffee-modal" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <form id="modal-content" onSubmit={submit}>
        <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>×</button>
        <h2>{coffee ? "Edit coffee" : "Save a new cup"}</h2>
        <p className="modal-description">Give it a name, photo, and recipe to remember.</p>

        <label htmlFor="coffee-name">Title</label>
        <input id="coffee-name" type="text" maxLength="60" required value={form.name} onChange={e => update("name", e.target.value)} />

        <label>Photo <span>(optional)</span></label>
        <div className="photo-controls">
          <label className="photo-button" htmlFor="image-upload">Upload photo</label>
          <input id="image-upload" type="file" accept="image/*" onChange={e => { const file = e.target.files?.[0] || null; setImageFile(file); setPreview(file ? URL.createObjectURL(file) : null) }} />
          <label className="photo-button" htmlFor="camera-upload">Take photo</label>
          <input id="camera-upload" type="file" accept="image/*" capture="environment" onChange={e => { const file = e.target.files?.[0] || null; setImageFile(file); setPreview(file ? URL.createObjectURL(file) : null) }} />
        </div>
        {(preview || (coffee && getCoffeeImageUrl(coffee.image_path))) && <img className="image-preview" src={preview || getCoffeeImageUrl(coffee.image_path)} alt="Coffee preview" />}

        <label htmlFor="ingredients-input">Ingredients</label>
        <textarea id="ingredients-input" rows="4" placeholder="18 g — Espresso&#10;100 ml — Whole milk" value={form.ingredients} onChange={e => update("ingredients", e.target.value)} />
        <label htmlFor="method-input">Method</label>
        <textarea id="method-input" rows="5" placeholder="Pull the espresso.&#10;Steam the milk.&#10;Pour and serve." value={form.method} onChange={e => update("method", e.target.value)} />

        <label className="tried-check"><input type="checkbox" checked={form.tried} onChange={e => update("tried", e.target.checked)} /> I've tried this recipe</label>
        {form.tried && <div id="try-details">
          <label htmlFor="tried-date">Date tried</label>
          <input id="tried-date" type="date" value={form.tried_date} onChange={e => update("tried_date", e.target.value)} />
          <label htmlFor="coffee-rating">Rating <span>(0–10)</span></label>
          <input id="coffee-rating" type="number" min="0" max="10" step="0.1" placeholder="e.g. 9.1" value={form.rating} onChange={e => update("rating", e.target.value)} />
          <label htmlFor="coffee-note">Small note <span>(optional)</span></label>
          <input id="coffee-note" type="text" value={form.note} onChange={e => update("note", e.target.value)} placeholder="e.g. Bright, sweet, and worth repeating" />
          <label htmlFor="coffee-thoughts">Additional thoughts <span>(optional)</span></label>
          <textarea id="coffee-thoughts" rows="3" value={form.thoughts} onChange={e => update("thoughts", e.target.value)} placeholder="e.g. How would you change it?" />
        </div>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <button id="save-coffee" type="submit" disabled={saving}>{saving ? "Saving…" : coffee ? "Save changes" : "Save coffee"}</button>
      </form>
    </div>
  )
}
