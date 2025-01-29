resultElement.style.fontFamily = "'Poppins', sans-serif";

function sendMessage(event) {
    event.preventDefault();
    const url = document.getElementById('url').value.trim();
    const chatContainer = document.getElementById('chatContainer');

    // Input Validation
    if (!url) {
        alert("Please enter a URL.");
        return;
    }

    // Append your message (query) to the left
    const yourMessage = document.createElement('div');
    yourMessage.classList.add('chat-message', 'left');
    yourMessage.textContent = `Query: ${url}`;
    chatContainer.appendChild(yourMessage);

    // Scroll to bottom to show latest messages
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function runTool(tool) {
    const url = document.getElementById('url').value.trim();
    const loadingElement = document.getElementById('loading');
    const chatContainer = document.getElementById('chatContainer');

    // Append message for the scan request
    const scanRequestMessage = document.createElement('div');
    scanRequestMessage.classList.add('chat-message', 'left');
    scanRequestMessage.textContent = `Running scan for: ${url}`;
    chatContainer.appendChild(scanRequestMessage);

    // Show the spinner
    loadingElement.style.display = 'flex';

    fetch(`/${tool}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ url: url })
    })
    .then(response => response.json())
    .then(data => {
        loadingElement.style.display = 'none';

        // Append scan result message (right side)
        const resultMessage = document.createElement('div');
        resultMessage.classList.add('chat-message', 'right');
        if (data.error) {
            resultMessage.textContent = `Error: ${data.error}`;
        } else {
            resultMessage.textContent = `Result: ${data.result}`;
        }
        chatContainer.appendChild(resultMessage);
        
        // Scroll to bottom to show latest messages
        chatContainer.scrollTop = chatContainer.scrollHeight;
    })
    .catch(error => {
        loadingElement.style.display = 'none';
        const errorMessage = document.createElement('div');
        errorMessage.classList.add('chat-message', 'right');
        errorMessage.textContent = `Error: ${error.message}`;
        chatContainer.appendChild(errorMessage);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    });
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