// Check if user is logged in
fetch('/check-auth')
    .then(response => response.json())
    .then(data => {
        if (!data.authenticated) {
            window.location.href = '/login.html';
        } else {
            // User is authenticated, start the game
            initGame();
        }
    })
    .catch(error => {
        console.error('Authentication check failed:', error);
        window.location.href = '/login.html';
    });

function initGame() {
    let startTime = Date.now();
    let timeInterval;
    let flippedCount = 0;
    let movieName = "winter soldier";
    let totalFrames = 5;

    let frameImages = [
        "https://tse1.mm.bing.net/th/id/OIP.Dcl938tRjmtHLy342FsYmwHaJQ?pid=Api",
        "https://tse4.mm.bing.net/th/id/OIP.jHU1zN3RklQdEuMmhreZeAHaEo?pid=Api&P=0&h=180",
        "https://tse1.mm.bing.net/th/id/OIP.oIcdif5cBj5UXAMD4ysmfQHaDG?pid=Api&P=0&h=180",
        "https://www.slashfilm.com/img/gallery/this-was-the-biggest-challenge-in-filming-captain-america-the-winter-soldiers-famous-elevator-fight-exclusive/l-intro-1666714369.jpg",
        "https://tse1.mm.bing.net/th/id/OIP.8DX95-xwOUudCwc8DSnOWQHaDG?pid=Api&P=0&h=180"
    ];

    function updateTimer() {
        let elapsed = Math.floor((Date.now() - startTime) / 1000);
        document.getElementById("time").textContent = elapsed;
    }

    timeInterval = setInterval(updateTimer, 1000);

    const frameContainer = document.getElementById("frameContainer");
    for (let i = 0; i < totalFrames; i++) {
        let frame = document.createElement("div");
        frame.className = "frame";
        frame.innerHTML = `
            <div class="frame-inner">
                <div class="frame-front">?</div>
                <div class="frame-back" style="background-image: url('${frameImages[i]}');"></div>
            </div>
        `;
        frame.addEventListener("click", () => {
            if (!frame.classList.contains("flipped")) {
                frame.classList.add("flipped");
                flippedCount++;
            }
        });
        frameContainer.appendChild(frame);
    }

    document.getElementById("guessBtn").addEventListener("click", () => {
        let guess = document.getElementById("guessInput").value.trim();
        
        if (guess.toLowerCase() === movieName.toLowerCase()) {
            clearInterval(timeInterval);
            let timeTaken = document.getElementById("time").textContent;
            
            // Get user info from server
            fetch('/profile')
                .then(response => response.json())
                .then(user => {
                    document.getElementById("result").textContent =
                        `🎉 You nailed it, ${user.name}! You found it in ${timeTaken} seconds`;

                    // Save result to backend
                    fetch('/save-result', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ timeTaken: timeTaken })
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Result saved:', data);
                    })
                    .catch(error => {
                        console.error('Error saving result:', error);
                    });

                    // Start countdown for next movie
                    let countdownTime = 2 * 60;
                    let countdownEl = document.getElementById("countdown");

                    let cdInterval = setInterval(() => {
                        let min = String(Math.floor(countdownTime / 60)).padStart(2, "0");
                        let sec = String(countdownTime % 60).padStart(2, "0");
                        countdownTime--;
                        if (countdownTime < 0) {
                            clearInterval(cdInterval);
                            countdownEl.textContent = "Next movie is ready!";
                        } else {
                            countdownEl.textContent = `${min}:${sec}`;
                        }
                    }, 1000);
                })
                .catch(error => {
                    console.error('Error fetching user profile:', error);
                    document.getElementById("result").textContent =
                        `🎉 You nailed it! You found it in ${timeTaken} seconds`;
                });

        } else {
            document.getElementById("result").textContent = "❌ Try again!";
        }
    });
}