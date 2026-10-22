
import { supabase } from "../lib/supabase"

const TABLE = "coffees"

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser()

  if (error) throw error

  if (!data.user) {
    throw new Error("You must be logged in to manage coffees.")
  }

  return data.user.id
}

export async function getCoffees() {
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error

  return data
}

// Fetch one coffee by its ID
export async function getCoffeeById(id) {
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single()

  if (error) throw error

  return data
}

export function getCoffeeImageUrl(imagePath) {
  if (!imagePath) return null

  const { data } = supabase.storage
      .from("coffee-images")
      .getPublicUrl(imagePath)

  return data.publicUrl
}

export async function addCoffee(coffee, imageFile = null) {

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw userError

  if (!user) {
    throw new Error("You must be signed in to add a coffee.")
  }

  let imagePath = null

  if (imageFile) {
    const extension = imageFile.name.split(".").pop()?.toLowerCase() || "jpg"
    imagePath = `${user.id}/${crypto.randomUUID()}.${extension}`

    const { error: uploadError } = await supabase.storage
      .from("coffee-images")
      .upload(imagePath, imageFile, {
        contentType: imageFile.type,
        upsert: false,
      })

    if (uploadError) throw uploadError
  }

  const coffeeRecord = {
    name: coffee.name,
    ingredients: coffee.ingredients,
    method: coffee.method,
    tried: coffee.tried,
    tried_date: coffee.tried_date || null,
    rating: coffee.rating ?? null,
    note: coffee.note || "",
    thoughts: coffee.thoughts || "",
    image_path: imagePath,
    user_id: user.id,
  }

  const { data, error } = await supabase
    .from("coffees")
    .insert(coffeeRecord)
    .select()
    .single()

  if (error) {
    if (imagePath) {
      const { error: cleanupError } = await supabase.storage
        .from("coffee-images")
        .remove([imagePath])

      if (cleanupError) {
        console.error("Could not clean up uploaded image:", cleanupError)
      }
    }

    throw error
  }

  return data
}


// Update an existing coffee
export async function updateCoffee(id, changes) {
  const userId = await getCurrentUserId()

  // Never allow editable fields to override ownership or identity
  const safeChanges = Object.fromEntries(
    Object.entries(changes).filter(([key]) => !["id", "user_id", "created_at"].includes(key)),
  )

  let imagePath = changes.image_path
  if (changes.imageFile) {
    const extension = changes.imageFile.name.split(".").pop()?.toLowerCase() || "jpg"
    imagePath = `${userId}/${crypto.randomUUID()}.${extension}`
    const { error: uploadError } = await supabase.storage
      .from("coffee-images")
      .upload(imagePath, changes.imageFile, { contentType: changes.imageFile.type, upsert: false })
    if (uploadError) throw uploadError
  }

  const updateFields = Object.fromEntries(
    Object.entries(safeChanges).filter(([key]) => !["imageFile", "image_path"].includes(key)),
  )
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      ...updateFields,
      ...(imagePath !== undefined ? { image_path: imagePath } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single()

  if (error) {
    if (changes.imageFile && imagePath) await supabase.storage.from("coffee-images").remove([imagePath])
    throw error
  }

  if (changes.imageFile && changes.image_path) {
    await supabase.storage.from("coffee-images").remove([changes.image_path])
  }

  return data
}

// Delete a coffee
export async function deleteCoffee(id) {
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("image_path")

  if (error) throw error
  if (data?.[0]?.image_path) {
    const { error: storageError } = await supabase.storage.from("coffee-images").remove([data[0].image_path])
    if (storageError) console.error("Could not remove coffee image:", storageError)
  }
}
