import { LoadingAnimation } from './loading.js';

document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById("image-track");
    
    // Set initial transform immediately to prevent initial movement
    track.style.transform = 'translate(0%, -50%)';
    
    // Check if animation has already played this session
    if (sessionStorage.getItem('animationPlayed')) {
        // If animation has played, show content immediately
        track.classList.add('visible');
        
        // Initialize all images
        initializeImages();
        return;
    }
    
    // Initialize the loading animation
    const loadingAnimation = new LoadingAnimation();
    loadingAnimation.init();
    
    // Set callback for when animation completes
    loadingAnimation.setOnComplete(() => {
        // Mark animation as played in this session
        sessionStorage.setItem('animationPlayed', 'true');
        
        // Initialize all images after loading
        initializeImages();
    });
    
    // Initialize voting system
    initVotingSystem();
});

// Function to initialize all images
function initializeImages() {
    const images = document.querySelectorAll('.image');
    images.forEach(img => {
        // Force a reload of the image
        const src = img.src;
        img.src = '';
        setTimeout(() => {
            img.src = src;
        }, 10);
        
        // Reset any transforms
        img.style.transform = '';
    });
}

// Initialize voting system
function initVotingSystem() {
    const form = document.getElementById('email-vote-form');
    const emailInput = document.getElementById('email-input');
    const voteButtons = document.querySelectorAll('.vote-button');
    const submitButton = document.getElementById('submit-button');
    const formMessage = document.getElementById('form-message');
    const voteInput = document.getElementById('vote-input');
    
    let selectedOption = null;
    
    // Handle vote button selection
    voteButtons.forEach(button => {
        button.addEventListener('click', function() {
            voteButtons.forEach(btn => btn.classList.remove('selected'));
            this.classList.add('selected');
            selectedOption = this.getAttribute('data-option');
            voteInput.value = selectedOption;
        });
    });
    
    // Handle form submission
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        if (!emailInput.value || !selectedOption) {
            formMessage.textContent = 'Please enter a valid email and select an option.';
            return;
        }

        // Show submitting message
        formMessage.textContent = 'Submitting...';
        
        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: {
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();
            
            if (data.ok) {
                // Success
                formMessage.textContent = 'Email and Vote Received, Thank You.';
                formMessage.classList.remove('fade-out');
                form.reset();
                voteButtons.forEach(btn => btn.classList.remove('selected'));
                selectedOption = null;

                // Fade out the message after 3 seconds
                setTimeout(() => {
                    formMessage.classList.add('fade-out');
                    // Remove the message after fade-out
                    setTimeout(() => {
                        formMessage.textContent = '';
                        formMessage.classList.remove('fade-out');
                    }, 1000);
                }, 3000);
            } else {
                // Error from Formspree
                formMessage.textContent = 'There was an error submitting the form. Please try again.';
            }
        } catch (error) {
            // Network or other error
            formMessage.textContent = 'There was an error submitting the form. Please try again.';
        }
    });
}

// Add an event listener for when the page becomes visible again
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // Page is now visible again
        initializeImages();
    }
});

const track = document.getElementById("image-track");

// Initialize track data attributes
if (!track.dataset.prevPercentage) track.dataset.prevPercentage = "0";
if (!track.dataset.percentage) track.dataset.percentage = "0";
if (!track.dataset.mouseDownAt) track.dataset.mouseDownAt = "0";

// On page load, initialize images with correct object position
for(const image of track.getElementsByClassName("image")) {
    image.style.objectPosition = `100% center`;
}

const handleOnDown = e => {
    track.dataset.mouseDownAt = e.clientX;
    
    // On first click, don't let the images jump
    if (track.dataset.prevPercentage === "0" && track.dataset.percentage === "0") {
        for(const image of track.getElementsByClassName("image")) {
            image.animate({
                objectPosition: `100% center`
            }, { duration: 0, fill: "forwards" });
        }
    }
};

const handleOnUp = () => {
    track.dataset.mouseDownAt = "0";  
    track.dataset.prevPercentage = track.dataset.percentage;
};

const handleOnMove = e => {
    if(track.dataset.mouseDownAt === "0") return;
    
    const mouseDelta = parseFloat(track.dataset.mouseDownAt) - e.clientX;
    const maxDelta = window.innerWidth / 2;
    
    const percentage = (mouseDelta / maxDelta) * -100;
    const nextPercentageUnconstrained = parseFloat(track.dataset.prevPercentage) + percentage;
    const nextPercentage = Math.max(Math.min(nextPercentageUnconstrained, 0), -100);
    
    track.dataset.percentage = nextPercentage;
    
    track.animate({
        transform: `translate(${nextPercentage}%, -50%)`
    }, { duration: 1200, fill: "forwards" });
    
    for(const image of track.getElementsByClassName("image")) {
        image.animate({
            objectPosition: `${100 + nextPercentage}% center`
        }, { duration: 1200, fill: "forwards" });
    }
    
    // Add support for form container if needed
    const formContainer = track.querySelector(".form-container");
    if (formContainer) {
        formContainer.animate({
            transform: `translateX(${nextPercentage * 0.5}%)`
        }, { duration: 1200, fill: "forwards" });
    }
};

// Event listeners
window.onmousedown = e => handleOnDown(e);
window.ontouchstart = e => handleOnDown(e.touches[0]);
window.onmouseup = e => handleOnUp(e);
window.ontouchend = e => handleOnUp(e.touches[0]);
window.onmousemove = e => handleOnMove(e);
window.ontouchmove = e => handleOnMove(e.touches[0]);