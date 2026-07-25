const API_URL = "http://localhost:8000/vehicles"

export const getVehicles = async (filters) => {
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_URL}?${query}`);
    const data = await response.json();
    return data;
}

