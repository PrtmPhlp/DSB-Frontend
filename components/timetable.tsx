// Function to fetch JSON data from a URL in a client-side TypeScript application
async function fetchData(url: string): Promise<any> {
    try {
        const response = await fetch(url, {
            method: 'GET', // HTTP method, can also use 'POST', 'PUT', etc.
            headers: {
                'Content-Type': 'application/json', // Expecting JSON response
            },
        });

        // Check if the response is OK (status code 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse and return the JSON data
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch data:", error);
        throw error;
    }
}

// Example usage: Client-side function call
const url = "https://api.example.com/data";
fetchData(url)
    .then((data) => {
        console.log("JSON data received:", data); // Handle the data here
    })
    .catch((error) => {
        console.error("Error:", error); // Handle any errors here
    });