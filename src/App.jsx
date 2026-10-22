import { useEffect, useState } from "react"
import { getSession, onAuthStateChange, signOut } from "./services/authService"
import { addCoffee, deleteCoffee, getCoffees, updateCoffee } from "./services/coffeeService"
import './App.css'
import Login from "./components/Login"
import Header from "./components/Header"
import Hero from "./components/Hero"
import Container from "./components/Container"
import CoffeeModal from "./components/CoffeeModal"
import CoffeeInfo from "./components/CoffeeInfo"

export default function App() {
  const [session, setSession] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [error, setError] = useState("")

  const [coffees, setCoffees] = useState([])
  const [loadingCoffees, setLoadingCoffees] = useState(true)
  const [coffeeError, setCoffeeError] = useState("")

  const [showAddCoffee, setShowAddCoffee] = useState(false)
  const [selectedCoffee, setSelectedCoffee] = useState(null)
  const [editingCoffee, setEditingCoffee] = useState(null)

  useEffect(() => {
    let active = true

    async function initializeAuth() {
      try {
        const currentSession = await getSession()

        if (active) {
          setSession(currentSession)
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to check your session.")
        }
      } finally {
        if (active) {
          setCheckingSession(false)
        }
      }
    }

    initializeAuth()

    const unsubscribe = onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session) {
      return
    }

    let cancelled = false

    async function loadCoffees() {
      setLoadingCoffees(true)
      setCoffeeError("")

      try {
        const data = await getCoffees()

        if (!cancelled) {
          setCoffees(data)
        }
      } catch (error) {
        if (!cancelled) {
          setCoffeeError(error.message)
        }
      } finally {
        if (!cancelled) {
          setLoadingCoffees(false)
        }
      }
    }

    loadCoffees()

    return () => {
      cancelled = true
    }
  }, [session])

  if (checkingSession) {
    return <main><p>Checking session...</p></main>
  }

  if (error) {
    return <main><p role="alert">{error}</p></main>
  }

  if (!session) {
    return <Login />
  }

  async function refreshCoffees() {
    const data = await getCoffees()
    setCoffees(data)
    return data
  }

  async function saveNewCoffee(coffee) {
    await addCoffee(coffee, coffee.imageFile)
    setShowAddCoffee(false)
    await refreshCoffees()
  }

  async function saveCoffeeChanges(coffee) {
    await updateCoffee(editingCoffee.id, { ...coffee, image_path: editingCoffee.image_path })
    setEditingCoffee(null)
    const data = await refreshCoffees()
    setSelectedCoffee(data.find(item => item.id === editingCoffee.id) || null)
  }

  async function removeCoffee(id) {
    await deleteCoffee(id)
    setSelectedCoffee(null)
    await refreshCoffees()
  }

  if (selectedCoffee) {
    return <>
      <CoffeeInfo coffee={selectedCoffee} onBack={() => setSelectedCoffee(null)} onEdit={() => setEditingCoffee(selectedCoffee)} onDelete={removeCoffee} />
      {editingCoffee && <CoffeeModal coffee={editingCoffee} onClose={() => setEditingCoffee(null)} onSaved={saveCoffeeChanges} />}
    </>
  }

  return (
    <main>
      <Header />
      <Hero />

      {loadingCoffees ? (
        <p>Loading coffees...</p>
      ) : coffeeError ? (
        <p>Error loading coffees: {coffeeError}</p>
      ) : (
        <Container
          coffees={coffees}
          onAddCoffee={() => setShowAddCoffee(true)}
          onSelectCoffee={setSelectedCoffee}
        />
      )}

      {showAddCoffee && (
        <CoffeeModal
          onClose={() => setShowAddCoffee(false)}
          onSaved={saveNewCoffee}
        />
      )}

      <footer className="app-footer"><span>Signed in as {session.user.email}</span><button className="text-button" onClick={signOut}>Sign out</button></footer>
    </main>
  )
}
