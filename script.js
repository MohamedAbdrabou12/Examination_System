const pages = {
    home: document.getElementById('home-page'), // New home page
    registration: document.getElementById('registration-page'),
    signin: document.getElementById('signin-page'),
    exam: document.getElementById('exam-page'),
    timeout: document.getElementById('timeout-page'),
    grades: document.getElementById('grades-page')
  };
  
  const mainContentWrapper = document.getElementById('main-content-wrapper');
  const navRegister = document.getElementById('nav-register');
  const navLogin = document.getElementById('nav-login');
  const navLogout = document.getElementById('nav-logout');
  const navHome = document.getElementById('nav-home');
  const welcomeMessageElement = document.getElementById('welcome-message'); // New: Welcome message element
  const darkModeToggle = document.getElementById('dark-mode-toggle'); // New: Dark mode toggle button
  
  
  const showPage = (pageId) => {
    // Hide all pages and remove 'active' class
    for (const id in pages) {
        pages[id].classList.add('hidden');
        pages[id].classList.remove('active'); // For animation trigger
    }
  
    // Determine background class based on pageId
    let bgClass = 'bg-home'; // Default background
    if (pageId === 'registration') {
        bgClass = 'bg-registration';
    } else if (pageId === 'signin') {
        bgClass = 'bg-signin';
    } else if (pageId === 'exam') {
        bgClass = 'bg-exam';
    } else if (pageId === 'timeout' || pageId === 'grades') {
        bgClass = 'bg-result'; // Use a common background for results/timeout
    }
  
    // Apply specific background class to the wrapper
    mainContentWrapper.className = ''; // Clear previous classes
    mainContentWrapper.classList.add(bgClass);
  
    // Show the target page and add 'active' class
    pages[pageId].classList.remove('hidden');
    // Force reflow to re-trigger CSS transition
    void pages[pageId].offsetWidth;
    pages[pageId].classList.add('active');
  
    updateNavbarVisibility(); // Update navbar links and welcome message on page change
  };
  
  const updateNavbarVisibility = () => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  
    if (loggedInUser) {
        navRegister.classList.add('hidden');
        navLogin.classList.add('hidden');
        navLogout.classList.remove('hidden');
        navHome.classList.remove('hidden');
        welcomeMessageElement.classList.remove('hidden');
        welcomeMessageElement.textContent = `Welcome, ${loggedInUser.firstName}!`;
    } else {
        navRegister.classList.remove('hidden');
        navLogin.classList.remove('hidden');
        navLogout.classList.add('hidden');
        navHome.classList.remove('hidden');
        welcomeMessageElement.classList.add('hidden'); // Hide welcome message if not logged in
        welcomeMessageElement.textContent = '';
    }
  };
  
  // --- Dark Mode Logic ---
  const enableDarkMode = () => {
    document.body.classList.add('dark-mode');
    darkModeToggle.textContent = '☀️'; // Sun icon for light mode
    localStorage.setItem('darkMode', 'enabled');
  };
  
  const disableDarkMode = () => {
    document.body.classList.remove('dark-mode');
    darkModeToggle.textContent = '🌙'; // Moon icon for dark mode
    localStorage.setItem('darkMode', 'disabled');
  };
  
  darkModeToggle.addEventListener('click', () => {
    if (document.body.classList.contains('dark-mode')) {
        disableDarkMode();
    } else {
        enableDarkMode();
    }
  });
  
  // Check for dark mode preference on load
  document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('darkMode') === 'enabled') {
        enableDarkMode();
    } else {
        disableDarkMode(); // Ensure correct icon on load if not dark mode
    }
  
    const registeredUser = JSON.parse(localStorage.getItem('registeredUser'));
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  
    if (loggedInUser) {
        currentUser = loggedInUser; // Re-establish currentUser
        startExam(); // If already logged in, go to exam page
    } else if (registeredUser) {
        showPage('signin'); // If registered but not logged in, go to sign-in
    } else {
        showPage('home'); // If not registered, go to home/welcome page
    }
    updateNavbarVisibility();
  });
  
  // --- Home Page Buttons ---
  document.getElementById('home-register-btn').addEventListener('click', () => showPage('registration'));
  document.getElementById('home-login-btn').addEventListener('click', () => showPage('signin'));
  
  // --- Navigation Bar Event Listeners ---
  navHome.addEventListener('click', (e) => {
    e.preventDefault();
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser) {
        // If logged in, clicking Home should take them to the exam
        startExam();
    } else {
        showPage('home'); // Otherwise, go to the general home page
    }
  });
  
  navRegister.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('registration');
  });
  
  navLogin.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('signin');
  });
  
  navLogout.addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('loggedInUser');
        clearInterval(examTimerInterval); // Stop timer if active
        // Reset exam state completely
        questions = [];
        userAnswers = [];
        markedQuestions.clear();
        timeLeft = EXAM_DURATION_MINUTES * 60;
        examStartTime = 0;
        
        // Clear input fields on registration and sign-in forms after logout
        document.getElementById('registration-form').reset();
        document.getElementById('signin-form').reset();
        // Hide any previous sign-in messages
        document.getElementById('signin-message').classList.add('hidden');
  
  
        // Clear validation styles for all forms if they were invalid
        const allInvalidInputs = document.querySelectorAll('.form-control.is-invalid');
        allInvalidInputs.forEach(input => {
            input.classList.remove('is-invalid');
            if (input.nextElementSibling && input.nextElementSibling.classList.contains('input-error')) {
                input.nextElementSibling.textContent = '';
            }
        });
  
        showPage('home'); // Go to home page after logout
    }
  });
  
  // Event listeners for switching between registration and sign-in
  document.getElementById('show-signin').addEventListener('click', (e) => {
    e.preventDefault();
    showPage('signin');
  });
  
  document.getElementById('show-registration').addEventListener('click', (e) => {
    e.preventDefault();
    showPage('registration');
  });
  
  
  // --- Registration Logic ---
  const registrationForm = document.getElementById('registration-form');
  registrationForm.addEventListener('submit', (e) => {
    e.preventDefault();
  
    const firstNameInput = document.getElementById('regFirstName');
    const lastNameInput = document.getElementById('regLastName');
    const emailInput = document.getElementById('regEmail');
    const passwordInput = document.getElementById('regPassword');
    const rePasswordInput = document.getElementById('regRePassword');
  
    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const rePassword = rePasswordInput.value;
  
    let isValid = true;
  
    // Helper to set invalid state
    const setInvalid = (inputElement, message) => {
        inputElement.classList.add('is-invalid');
        inputElement.nextElementSibling.textContent = message;
    };
  
    // Helper to set valid state
    const setValid = (inputElement) => {
        inputElement.classList.remove('is-invalid');
        inputElement.nextElementSibling.textContent = '';
    };
  
    // First Name and Last Name validation
    const nameRegex = /^[A-Za-z]+$/;
    if (!nameRegex.test(firstName)) {
        setInvalid(firstNameInput, 'First name must contain only alphabetical characters.');
        isValid = false;
    } else {
        setValid(firstNameInput);
    }
    if (!nameRegex.test(lastName)) {
        setInvalid(lastNameInput, 'Last name must contain only alphabetical characters.');
        isValid = false;
    } else {
        setValid(lastNameInput);
    }
  
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        setInvalid(emailInput, 'Please enter a valid email address.');
        isValid = false;
    } else {
        setValid(emailInput);
    }
  
    // Password validation
    if (password.length < 8) {
        setInvalid(passwordInput, 'Password must be at least 8 characters long.');
        isValid = false;
    } else {
        setValid(passwordInput);
    }
  
    if (password !== rePassword) {
        setInvalid(rePasswordInput, 'Passwords do not match.');
        isValid = false;
    } else {
        setValid(rePasswordInput);
    }
  
    if (isValid) {
        const user = { firstName, lastName, email, password };
        localStorage.setItem('registeredUser', JSON.stringify(user));
        alert('Registration successful! Please sign in.');
        showPage('signin');
        registrationForm.reset();
        // Clear any lingering invalid states after successful registration
        setValid(firstNameInput);
        setValid(lastNameInput);
        setValid(emailInput);
        setValid(passwordInput);
        setValid(rePasswordInput);
    }
  });
  
  // --- Sign In Logic ---
  const signInForm = document.getElementById('signin-form');
  const signInMessage = document.getElementById('signin-message');
  let currentUser = null; // Store current logged-in user
  
  signInForm.addEventListener('submit', (e) => {
    e.preventDefault();
  
    const emailInput = document.getElementById('signInEmail');
    const passwordInput = document.getElementById('signInPassword');
  
    const email = emailInput.value.trim();
    const password = passwordInput.value;
  
    const registeredUser = JSON.parse(localStorage.getItem('registeredUser'));
  
    // Helper to set invalid state for sign-in fields
    const setSignInInvalid = (inputElement, message) => {
        inputElement.classList.add('is-invalid');
        if (inputElement.nextElementSibling && inputElement.nextElementSibling.classList.contains('input-error')) {
            inputElement.nextElementSibling.textContent = message;
        }
    };
  
    // Helper to set valid state for sign-in fields
    const setSignInValid = (inputElement) => {
        inputElement.classList.remove('is-invalid');
        if (inputElement.nextElementSibling && inputElement.nextElementSibling.classList.contains('input-error')) {
            inputElement.nextElementSibling.textContent = '';
        }
    };
  
    setSignInValid(emailInput); // Clear previous errors
    setSignInValid(passwordInput);
    signInMessage.classList.add('hidden'); // Hide general message
  
    if (!registeredUser) {
        signInMessage.textContent = 'No user registered. Please register first.';
        signInMessage.classList.remove('hidden');
        setSignInInvalid(emailInput, ' '); // Trigger invalid styling without text
        setSignInInvalid(passwordInput, ' ');
        return;
    }
  
    if (email === registeredUser.email && password === registeredUser.password) {
        currentUser = registeredUser; // Set the current user
        localStorage.setItem('loggedInUser', JSON.stringify(currentUser)); // Store logged-in status
        signInMessage.classList.add('hidden');
        signInForm.reset(); // Clear sign-in form
        startExam(); // Proceed to exam page
    } else {
        signInMessage.textContent = 'Invalid email or password.';
        signInMessage.classList.remove('hidden');
        setSignInInvalid(emailInput, ' '); // Trigger invalid styling without text
        setSignInInvalid(passwordInput, ' ');
    }
  });
  
  // --- Exam Logic ---
  let questions = [];
  let currentQuestionIndex = 0;
  let userAnswers = []; // Stores selected answer index for each question
  let markedQuestions = new Set(); // Stores indices of marked questions
  let examTimerInterval;
  const EXAM_DURATION_MINUTES = 10; // Exam duration in minutes
  let timeLeft = EXAM_DURATION_MINUTES * 60; // Time left in seconds
  let examStartTime = 0; // To store the start time of the exam
  
  // Question and Answer Constructor Functions (ES6 Classes)
  class Answer {
    constructor(text) {
        this.text = text;
    }
  }
  
  class Question {
    constructor(text, choices, correctAnswerIndex) {
        this.text = text;
        this.choices = choices.map(choiceText => new Answer(choiceText)); // Array of Answer objects
        this.correctAnswerIndex = correctAnswerIndex; // Index of the correct answer in the choices array
    }
  }
  
  // Define your questions here
  const allQuestions = [
    new Question(
        "What is the capital of France?",
        ["Berlin", "Madrid", "Paris", "Rome"],
        2
    ),
    new Question(
        "Which planet is known as the Red Planet?",
        ["Earth", "Mars", "Jupiter", "Venus"],
        1
    ),
    new Question(
        "What is the largest ocean on Earth?",
        ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
        3
    ),
    new Question(
        "Who painted the Mona Lisa?",
        ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Claude Monet"],
        2
    ),
    new Question(
        "What is the chemical symbol for water?",
        ["O2", "H2O", "CO2", "NaCl"],
        1
    ),
    new Question(
        "Which country is famous for the Great Wall?",
        ["Japan", "India", "China", "Egypt"],
        2
    ),
    new Question(
        "What is the highest mountain in the world?",
        ["K2", "Mount Everest", "Kangchenjunga", "Lhotse"],
        1
    ),
    new Question(
        "What is the currency of Japan?",
        ["Yuan", "Won", "Yen", "Rupee"],
        2
    ),
    new Question(
        "Which animal is known as the 'King of the Jungle'?",
        ["Tiger", "Lion", "Elephant", "Bear"],
        1
    ),
    new Question(
        "What is the largest continent by land area?",
        ["Africa", "Europe", "Asia", "North America"],
        2
    )
  ];
  
  // Shuffle questions function
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // ES6 destructuring for swap
    }
    return array;
  };
  
  const startExam = () => {
    currentUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!currentUser) {
        showPage('signin');
        return;
    }
  
    questions = shuffleArray([...allQuestions]); // Create a shuffled copy of allQuestions
    userAnswers = new Array(questions.length).fill(null); // Initialize user answers
    markedQuestions.clear(); // Clear any previous marked questions
    currentQuestionIndex = 0;
    timeLeft = EXAM_DURATION_MINUTES * 60; // Reset timer
    examStartTime = Date.now(); // Record exam start time
  
    document.getElementById('total-questions').textContent = questions.length;
    renderQuestion();
    renderMarkedQuestionsList(); // Initial render of marked questions list
    startTimer();
    showPage('exam'); // Ensure this is called to set the background
    updateNavbarVisibility(); // Update navbar after starting exam
  };
  
  const questionTextElement = document.getElementById('question-text');
  const choicesListElement = document.getElementById('choices-list');
  const currentQuestionNumberElement = document.getElementById('current-question-number');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const markBtn = document.getElementById('mark-btn');
  const submitExamBtn = document.getElementById('submit-exam-btn');
  const markedQuestionsListElement = document.getElementById('marked-questions-list');
  const examTimerElement = document.getElementById('exam-timer');
  const clearCurrentAnswerBtn = document.getElementById('clear-current-answer-btn');
  const clearAllAnswersBtn = document.getElementById('clear-all-answers-btn');
  const reexamBtn = document.getElementById('reexam-btn');
  const reexamBtnTimeout = document.getElementById('reexam-btn-timeout');
  
  
  const renderQuestion = () => {
    const question = questions[currentQuestionIndex];
    currentQuestionNumberElement.textContent = currentQuestionIndex + 1;
    questionTextElement.textContent = question.text;
    choicesListElement.innerHTML = ''; // Clear previous choices
  
    question.choices.forEach((choice, index) => {
        const listItem = document.createElement('li');
        const radioId = `choice-${currentQuestionIndex}-${index}`; // Unique ID for each radio button
        listItem.innerHTML = `
            <input class="form-check-input" type="radio" name="question-choice-${currentQuestionIndex}" id="${radioId}" value="${index}">
            <label class="form-check-label" for="${radioId}">${choice.text}</label>
        `;
  
        // Add event listener to the list item itself for the active class visual feedback
        // and to select the answer
        listItem.addEventListener('click', function() {
            const radio = this.querySelector('input[type="radio"]');
            if (!radio.checked) { // Only update if not already checked
                radio.checked = true;
                choicesListElement.querySelectorAll('li').forEach(li => li.classList.remove('active'));
                this.classList.add('active');
                selectAnswer(parseInt(radio.value)); // Ensure value is parsed as int
            }
        });
  
        // Ensure radio button change also triggers selection and active class (for accessibility/tabbing)
        listItem.querySelector('input[type="radio"]').addEventListener('change', function() {
            choicesListElement.querySelectorAll('li').forEach(li => li.classList.remove('active'));
            this.closest('li').classList.add('active');
            selectAnswer(parseInt(this.value));
        });
  
        choicesListElement.appendChild(listItem);
    });
  
    // Highlight selected answer if already answered
    if (userAnswers[currentQuestionIndex] !== null) {
        const selectedChoiceIndex = userAnswers[currentQuestionIndex];
        const radio = choicesListElement.querySelector(`#choice-${currentQuestionIndex}-${selectedChoiceIndex}`);
        if (radio) {
            radio.checked = true;
            radio.closest('li').classList.add('active');
        }
    }
  
    // Update button states
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.disabled = currentQuestionIndex === questions.length - 1;
  
    // Update mark button text
    if (markedQuestions.has(currentQuestionIndex)) {
        markBtn.textContent = 'Unmark';
        markBtn.classList.remove('btn-secondary');
        markBtn.classList.add('btn-warning');
    } else {
        markBtn.textContent = 'Mark';
        markBtn.classList.remove('btn-warning');
        markBtn.classList.add('btn-secondary');
    }
  };
  
  const selectAnswer = (answerIndex) => {
    userAnswers[currentQuestionIndex] = answerIndex;
  };
  
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    }
  };
  
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
    }
  };
  
  const toggleMarkQuestion = () => {
    if (markedQuestions.has(currentQuestionIndex)) {
        markedQuestions.delete(currentQuestionIndex);
    } else {
        markedQuestions.add(currentQuestionIndex);
    }
    renderMarkedQuestionsList();
    renderQuestion(); // Update mark button text
  };
  
  const renderMarkedQuestionsList = () => {
    markedQuestionsListElement.innerHTML = '';
    if (markedQuestions.size === 0) {
        markedQuestionsListElement.textContent = 'No questions marked.';
        return;
    }
    const sortedMarked = Array.from(markedQuestions).sort((a, b) => a - b);
    sortedMarked.forEach(index => {
        const span = document.createElement('span');
        span.textContent = `Q${index + 1}`;
        span.classList.add('badge'); // Custom class for badges
        span.addEventListener('click', () => {
            currentQuestionIndex = index;
            renderQuestion();
        });
        markedQuestionsListElement.appendChild(span);
    });
  };
  
  const startTimer = () => {
    clearInterval(examTimerInterval); // Clear any existing timer
    examTimerInterval = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        examTimerElement.textContent =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
        if (timeLeft <= 0) {
            clearInterval(examTimerInterval);
            submitExam(true); // Submit due to timeout
        }
    }, 1000);
  };
  
  const submitExam = (isTimeout = false) => {
    clearInterval(examTimerInterval); // Stop the timer
  
    if (isTimeout) {
        document.getElementById('timeout-user-name').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
        showPage('timeout'); // Ensure this is called to set the background
    } else {
        let score = 0;
        questions.forEach((question, index) => {
            if (userAnswers[index] !== null && userAnswers[index] === question.correctAnswerIndex) {
                score++;
            }
        });
  
        const examEndTime = Date.now();
        const totalTimeTakenSeconds = Math.floor((examEndTime - examStartTime) / 1000);
        const minutesTaken = Math.floor(totalTimeTakenSeconds / 60);
        const secondsTaken = totalTimeTakenSeconds % 60;
        const formattedTimeTaken = `${minutesTaken.toString().padStart(2, '0')}:${secondsTaken.toString().padStart(2, '0')}`;
  
        document.getElementById('grades-user-name').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
        document.getElementById('final-score').textContent = score;
        document.getElementById('total-possible-score').textContent = questions.length;
        document.getElementById('time-taken').textContent = formattedTimeTaken;
        showPage('grades'); // Ensure this is called to set the background
    }
    localStorage.removeItem('loggedInUser'); // Clear logged-in user on exam completion
    updateNavbarVisibility(); // Update navbar after exam submission
  };
  
  const clearCurrentAnswer = () => {
    userAnswers[currentQuestionIndex] = null;
    renderQuestion(); // Re-render to show no answer selected
  };
  
  const clearAllAnswers = () => {
    if (confirm('Are you sure you want to clear all your answers? This action cannot be undone.')) {
        userAnswers.fill(null);
        renderQuestion(); // Re-render current question
        alert('All answers have been cleared.');
    }
  };
  
  // Event Listeners for Exam Page
  nextBtn.addEventListener('click', goToNextQuestion);
  prevBtn.addEventListener('click', goToPreviousQuestion);
  markBtn.addEventListener('click', toggleMarkQuestion);
  submitExamBtn.addEventListener('click', () => submitExam(false));
  clearCurrentAnswerBtn.addEventListener('click', clearCurrentAnswer);
  clearAllAnswersBtn.addEventListener('click', clearAllAnswers);
  reexamBtn.addEventListener('click', startExam); // Re-exam button on grades page
  reexamBtnTimeout.addEventListener('click', startExam); // Re-exam button on timeout page