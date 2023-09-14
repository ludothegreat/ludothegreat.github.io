// script.js

// Fetch the key_counts.json file
fetch('https://raw.githubusercontent.com/ludothegreat/KeyCount/ttztjohnsonm/key_counts.json')
.then(response => response.json())
.then(data => {
    // Initialize an empty object to hold the summarized counts
    const summarizedCounts = {
        SingleKeys: {},
        CombinationKeys: {}
    };

    // Loop through the main categories (SingleKeys and CombinationKeys)
    for (const category in data) {
        if (data.hasOwnProperty(category)) {
            // Loop through the keys within each category and summarize the counts
            for (const key in data[category]) {
                if (data[category].hasOwnProperty(key)) {
                    const count = data[category][key];
                    summarizedCounts[category][key] = (summarizedCounts[category][key] || 0) + count;
                }
            }
        }
    }

    // Display the summarized counts in the summary-container
    const summaryContainer = document.getElementById('summary-container');
    for (const category in summarizedCounts) {
        if (summarizedCounts.hasOwnProperty(category)) {
            const categoryDiv = document.createElement('div');
            categoryDiv.textContent = `${category}:`;
            summaryContainer.appendChild(categoryDiv);

            for (const key in summarizedCounts[category]) {
                if (summarizedCounts[category].hasOwnProperty(key)) {
                    const element = document.createElement('div');
                    element.textContent = `  - ${key}: ${summarizedCounts[category][key]}`;
                    summaryContainer.appendChild(element);
                }
            }
        }
    }
})
.catch(error => {
    console.error('An error occurred:', error);
});