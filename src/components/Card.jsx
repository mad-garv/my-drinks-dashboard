const Card = ({ coffee, imageUrl, onClick }) =>
    <button className="coffee-card" onClick={onClick} aria-label={`View ${coffee.name}`}>
        <img
            className="coffee-image"
            src={imageUrl}
            alt={coffee.name}
        />
        <div className="card-footer">
            <p className="coffee-title">{coffee.name}</p>
            <span className="card-rating">{coffee.tried && coffee.rating !== null ? `${coffee.rating}` : "/10"}</span>
        </div>
    </button>

export default Card
