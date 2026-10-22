import { useState } from "react"
import { getCoffeeImageUrl } from "../services/coffeeService"

export default function CoffeeInfo({ coffee, onBack, onEdit, onDelete }) {
  const [deleting, setDeleting] = useState(false)
  const imageUrl = getCoffeeImageUrl(coffee.image_path)

  async function handleDelete() {
    if (!window.confirm(`Delete “${coffee.name}”? This cannot be undone.`)) return
    setDeleting(true)
    try { await onDelete(coffee.id) } finally { setDeleting(false) }
  }

  return (
    <div>

      <div id="header-container">
        <button className="text-button" id="header-left" onClick={onBack}>← All coffees</button>
        <p id="header-tag">@madgarv</p>
      </div>

      <main className="coffee-info-page">

        <aside className="coffee-info-left">

          {coffee.tried ?
            <div className="info-rating">
              {coffee.rating !== null && coffee.rating !== "" && <strong>{coffee.rating}</strong>}
              {coffee.tried_date && <span>{coffee.tried_date}</span>}
            </div>
            : <div className="info-rating">
              <strong>/10</strong>
              <span>yet to try</span>
            </div>
          }

          {imageUrl ? <img src={imageUrl} alt={coffee.name} /> : <div className="image-placeholder">☕</div>}
        </aside>

        <article className="coffee-info-content">

          <div className="info-topline">
            <p className="info-eyebrow">COFFEE RECIPE</p>
            <div className="info-actions">
              <button className="secondary-button" onClick={onEdit}>Edit details</button>
              <button className="delete-button" onClick={handleDelete} disabled={deleting}>{deleting ? "Deleting…" : "Delete"}</button>
            </div>
          </div>

          <h1>{coffee.name}</h1>

          {coffee.tried ?
            <section className="info-section">
              <p className="preserve-lines">
                {coffee.note || "im sure it slapped"}
              </p>
            </section>
            : <p>HOW HAVE YOU NOT TRIED THIS ONE YET?</p>
          }

          <section className="info-section">
            <h2>Ingredients</h2>
            <div className="ingredients-list">
              {coffee.ingredients.length === 0 ? (
                <p>No ingredients added yet</p>
              )
                : (
                  coffee.ingredients.map((ingredientLine, index) => {
                    const dashPosition = ingredientLine.indexOf("–")

                    const amount =
                      dashPosition === -1
                        ? ""
                        : ingredientLine.slice(0, dashPosition).trim()

                    const ingredientName =
                      dashPosition === -1
                        ? ingredientLine
                        : ingredientLine.slice(dashPosition + 1).trim()

                    return (
                      <div className="ingredient-row" key={index}>
                        <span className="ingredient-amount">{amount}</span>
                        <span className="ingredient-name">{ingredientName}</span>
                      </div>
                    )
                  })
                )
              }
            </div>
          </section>

          <section className="info-section">
            <h2>Method</h2>
            <div className="method-list">
              {coffee.method.length === 0 ? (
                <p>No method added yet.</p>
              ) : (
                coffee.method.map((step, index) => (
                  <div className="method-row" key={index}>
                    <span className="step-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <p>{step}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          {coffee.tried &&
            <section className="info-section">
              <h2>Thoughts</h2>
              <p className="preserve-lines">
                {coffee.thoughts || "worth repeating"}
              </p>
            </section>
          }

        </article>
      </main>
    </div>
  )
}
