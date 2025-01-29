resultElement.style.fontFamily = "'Poppins', sans-serif";

function runTool(tool) {
    const url = document.getElementById('url').value.trim();
    const loadingElement = document.getElementById('loading');
    const resultElement = document.getElementById('result');

    // Input Validation
    if (!url) {
        alert("Please enter a URL.");
        return;
    }

    if (tool === 'sslscan') {
        // Show spinner
        loadingElement.style.display = 'flex';
        resultElement.innerHTML = '';  // Clear previous result

        // Fetch data from the server
        fetch(`/${tool}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({ url: url })
        })
            .then(response => response.json())
            .then(data => {
                // Hide spinner
                loadingElement.style.display = 'none';

                if (data.error) {
                    resultElement.innerHTML = `<p style="color: red;">Error: ${data.error}</p>`;
                    smoothExpand(resultElement); // Trigger smooth expansion
                } else {
                    const formattedResult = data.result.replace(/<br>/g, '\n');
                    resultElement.style.display = 'block';
                    resultElement.style.fontFamily = "Poppins";
                    resultElement.innerHTML = `<pre>${formattedResult}</pre>`;
                    smoothExpand(resultElement); // Trigger smooth expansion
                }
            })
            .catch(error => {
                // Hide spinner
                loadingElement.style.display = 'none';
                resultElement.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
                smoothExpand(resultElement); // Trigger smooth expansion
            });
    }
}

// Function to smoothly expand the result div based on its content
function smoothExpand(resultElement) {
    // Calculate the new width based on the content
    const newWidth = Math.max(100, resultElement.scrollWidth); // Ensure minimum width
    resultElement.style.width = `${newWidth}px`;  // Apply new width to trigger transition
}


function runMhuntScan() {
    const url = document.getElementById('url').value.trim();
    const loadingElement = document.getElementById('loading');
    const resultElement = document.getElementById('result');
    const stopButton = document.getElementById('stopScan');

    // Input Validation
    if (!url) {
        alert("Please enter a URL.");
        return;
    }

    // Show spinner and stop button
    loadingElement.style.display = 'flex';
    stopButton.style.display = 'inline-block';
    resultElement.innerHTML = '';

    // Initialize EventSource
    const eventSource = new EventSource(`/mhunt?url=${encodeURIComponent(url)}`);

    eventSource.onmessage = function (event) {
        if (event.data.startsWith("Error:") || event.data.startsWith("Exception occurred:")) {
            resultElement.innerHTML += `<p style="color: red;">${event.data}</p>`;
            loadingElement.style.display = 'none';
            stopButton.style.display = 'none';
            eventSource.close();
        } else {
            resultElement.innerHTML += `<pre>${event.data}</pre>`;
        }
    };

    eventSource.onerror = function () {
        resultElement.innerHTML += `<p style="color: red;">An error occurred while processing the scan.</p>`;
        loadingElement.style.display = 'none';
        stopButton.style.display = 'none';
        eventSource.close();
    };

    eventSource.onopen = function () {
        console.log("Connection to server opened.");
    };
}

function stopScan() {
    fetch('/stop_scan')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                document.getElementById('loading').style.display = 'none';
                document.getElementById('stopScan').style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error stopping scan:', error);
        });
}


console.log("Hello");