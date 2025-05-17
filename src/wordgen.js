import axios from "axios";

export async function getWord() {
  try {
    const response = await axios.get(
      "https://random-word-api.herokuapp.com/word?length=5"
    );
    return response.data[0].toUpperCase(); // always uppercase for consistency
  } catch (error) {
    console.error("Failed to fetch word:", error);
    return "CRANE"; // fallback word
  }
}
