async function authUserQueryOption() {
  try {
    const res = await fetch('/api/auth/me')

    const data = await res.json()

    if (data.error) return null

    if (!res.ok) {
      throw new Error(data.error || 'Something went wrong')
    }

    return data
  } catch (error) {
    if (error && error === 'string') {
      throw new Error(error)
    } else {
      throw error
    }
  }
}

export default authUserQueryOption