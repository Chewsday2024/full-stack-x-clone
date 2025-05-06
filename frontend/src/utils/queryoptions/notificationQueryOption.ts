async function notificationQueryOption() {
  try {
    const res = await fetch('/api/notifications')

    const data = await res.json()

    if (!res.ok) throw new Error(data.error || 'Something went wrong')

    return data
  } catch (error) {
    if (error && error === 'string') {
      throw new Error(error)
    } else {
      throw error
    }
  }
}
export default notificationQueryOption