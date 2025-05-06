async function postsQueryOption(POST_ENDPOINT: string) {
  try {
    const res = await fetch(POST_ENDPOINT)
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Something went wrong")
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
export default postsQueryOption