const BASE_URL = "http://localhost:8080";

export async function getComplaints() {
    try {
        const response = await fetch(`${BASE_URL}/api/complaints`);

        const result = await response.json();

        return result.data;
    } catch (error) {
        console.error("Error fetching complaints:", error);
        return [];
    }    
}