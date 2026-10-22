import Card from "./Card"
import { getCoffeeImageUrl } from "../services/coffeeService"

const Container = ({ coffees, onAddCoffee, onSelectCoffee }) => {
    return (
        <div className="coffee-container">
            {coffees.map(coffee => (
                <Card
                    key={coffee.id}
                    coffee={coffee}
                    imageUrl={getCoffeeImageUrl(coffee.image_path)}
                    onClick={() => onSelectCoffee(coffee)}
                />
            ))}

            <button id="add-coffee" onClick={onAddCoffee}>+</button>
        </div>
    )
}

export default Container
