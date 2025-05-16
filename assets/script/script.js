const chatPop = document.querySelector('.chat-pop');
const chatBox = document.querySelector('#chatbot');
const chatClose = document.querySelector('.chat-close');
const sendMessage = document.querySelector("#send-message");
const sendChat = document.querySelector("#send-chat");
const messageInput = document.querySelector(".message-input");
const aiMessage = document.querySelector("#aiTextbox");
const chatBody = document.querySelector(".chat-body");
const chatInput = document.querySelector('#chat_input');
const chatBot1 = document.querySelector(".chatbot1");
const chatBot2 = document.querySelector(".chatbot2");

 // API Setup
    const API_KEY ="AIzaSyAvT16qiF3SMZklOwSjPbFkUyNxmUyfKLM";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    const userChat = {
        message : ""
    }

let currentStep = 0;
const steps = ["name", "email", "purpose", "jobTitle", "company", "phone"];

const userData = {
    name: "",
    email: "",
    purpose: "",
    jobTitle: "",
    company: "",
    phone: ""
};

userData.sessionId = crypto.randomUUID(); // or any other UID generator 


const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

const addThinkingMessage = () => {
    const thinkingMessage = createMessageElement(
        `<div class="message bot-message thinking">
                <img src="assets/images/traicon-1by1.png" class="bot-img" alt="">
                <div class="message-text">
                    <div class="thinking-indicator">
                        <div class="text-dot"></div>
                        <div class="text-dot"></div>
                        <div class="text-dot"></div>
                    </div>
                </div>
            </div>`,
        "bot-message", "thinking"
    );
    chatBody.appendChild(thinkingMessage);
    chatBody.scrollTop = chatBody.scrollHeight;
    return thinkingMessage;
};

const addUserMessage = (text) => {
    const msg = createMessageElement(`
        <div class="message user-message">
                <div class="message-text">${text}</div>
            </div>`, "user-message", "message");
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
};

const addBotMessage = (text) => {
    const msg = createMessageElement(`
        <div class="message bot-message">
                <img src="assets/images/traicon-1by1.png" class="bot-img" alt="">
                <div class="message-text">${text}</div>
            </div>`, "bot-message", "message");
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
};


const showNextBotQuestion = () => {
    const isFinalStep = currentStep >= steps.length;

    // Save the previous input
    if (currentStep > 0 && currentStep <= steps.length) {
        const prevField = steps[currentStep - 1];
        const inputValue = messageInput.dataset.lastInput || messageInput.value.trim();
        userData[prevField] = inputValue;
        messageInput.dataset.lastInput = ""; // Clear old value

        fetch("assets/php/save_user_data.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                field: prevField,
                value: inputValue,
                sessionId: userData.sessionId,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("Save response:", data);
                if (!data.success) {
                    console.error(`Error saving ${prevField}:`, data.error);
                } else {
                    console.log(`Saved ${prevField} successfully.`);
                }
            })
            .catch((err) => console.error("Fetch error:", err));
    }

    if (isFinalStep) {
        const thinking = addThinkingMessage();

        setTimeout(() => {
            thinking.remove();
            addBotMessage("Our team will get back to you soon.");
            chatBot1.style.display = "none";
             chatBot2.style.display = "flex";
            console.log("Final User Data:", userData);
            // document.querySelector(".contact-cont").style.left = "0";
        }, 1500);
        return;
    }

    const field = steps[currentStep];

    // Adjust input field type
    if (field === "email") {
        messageInput.type = "email";
    } else if (field === "phone") {
        messageInput.type = "tel";
        messageInput.pattern = "[0-9]+";
    } else {
        messageInput.type = "text";
    }

    // Show next bot question
    const thinking = addThinkingMessage();
    setTimeout(() => {
        thinking.remove();
        switch (field) {
            case "name":
                addBotMessage("What's your full name?");
                break
            case "email":
                addBotMessage(`<div>Thank you! <span>${userData.name}</span> <br> Could you please provide your official <span> Email Address</span>?</div>`);
                break;
            case "purpose":
                showPurposeOptions();
                break;
            case "jobTitle":
                addBotMessage("What's your current job title?");
                break;
            case "company":
                addBotMessage("Which company do you represent?");
                break;
            case "phone":
                addBotMessage("Now tell me your contact number?");
                break;
        }
    }, 1500);
};



const handlePurposeSelection = (selectedPurpose) => {
    userData.purpose = selectedPurpose;
    messageInput.dataset.lastInput = selectedPurpose;
    addUserMessage(selectedPurpose);
    messageInput.value = "";
    currentStep++;
    showNextBotQuestion();
};

const showPurposeOptions = () => {
    const thinking = addThinkingMessage();
    setTimeout(() => {
        thinking.remove();
        const optionsHTML = `
               <div class="message bot-message">
                <img src="assets/images/traicon-1by1.png" class="bot-img" alt="">
                <div class="message-text">
                    <span>Please let us know what you are interested in</span>
                    <ul id="user-type-options">
                        <li data-type="Delegate">Delegate - VIP</li>
                        <li data-type="Speaker">Speaker</li>
                        <li data-type="Sponsorship">Sponsor</li>
                        <li data-type="Solution Provider">Solution Provider</li>
                        <li data-type="Media Partner">Media Partner</li>
                        <li data-type="Others">Others</li>
                    </ul>
                </div>
            </div>
        `;

        const botMsg = createMessageElement(optionsHTML, "bot-message");
        chatBody.appendChild(botMsg);
        chatBody.scrollTop = chatBody.scrollHeight;

        document.querySelectorAll("#user-type-options li").forEach(li => {
            li.addEventListener("click", () => {
                const choice = li.getAttribute("data-type");
                userData.purpose = choice;
                messageInput.dataset.lastInput = choice; 
                addUserMessage(choice);
                currentStep++;
                showNextBotQuestion();
            });
        });
    }, 1500);
};

const handleOutgoingMessage = (e) => {
    e.preventDefault();
    const input = messageInput.value.trim();
    const field = steps[currentStep];

    if (!input && currentStep !== 2) return;

    if (field === "email" && !/^\S+@\S+\.\S+$/.test(input)) {
        addBotMessage(`I'm sorry ${userData.name}, that doesn't look like an email address. Can you try again?`);
        return;
    }

    if (field === "phone" && !/^\d{7,15}$/.test(input)) {
        addBotMessage("Please enter a valid phone number (digits only).");
        return;
    }

    if (currentStep === 2) {
        // showPurposeOptions();
        return;
    }

    userData[field] = input;
    messageInput.dataset.lastInput = input;
    addUserMessage(input);
    messageInput.value = "";

    currentStep++;
    showNextBotQuestion();
};

// sendMessage.addEventListener("click", () => {
    
//     const currentField = steps[currentStep];
//     const value = messageInput.value.trim();

//     if (value) {
//         userData[currentField] = value;
//         console.log(`Saved ${currentField}:`, value);

//         currentStep++;
//         showNextBotQuestion();
//     }
// });

sendMessage.addEventListener("click", handleOutgoingMessage);




   // Generate bot response using API

    const generateBotRespose = async () => {
        if (!userChat.message) {
            console.warn("No message to send.");
            //  return "Sorry, something went wrong.";
            // should also be added to chat
            addBotMessage("Sorry, something went wrong. Please try again.");
        }
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed, so add 1 and pad with leading zero if needed
        const day = String(today.getDate()).padStart(2, '0');      // Pad with leading zero if needed

        const currentDate = `${year}-${month}-${day}`;

        const eventPrompt = `
        You are a smart and friendly AI assistant designed to assist and guide attendees of the Fintech Revolution Summit – Malaysia 2025, organized by TraiCon Events.
            
        This is a high-level, business-focused summit taking place on July 23, 2025, in Kuala Lumpur, Malaysia. The event brings together fintech leaders, innovators, regulators, and financial institutions to explore emerging trends, technologies, and investment opportunities shaping the future of finance in Southeast Asia.
            
        Your Responsibilities:
            
        Greet users professionally and introduce the event.
            
        Collect attendee details (name, email, company, and designation) when prompted.
            
        Assist users with inquiries about:
            
        Event agenda and speaker sessions
            
        Venue location, access, and timing
            
        Delegate, sponsor, and exhibitor registration
            
        Networking opportunities
            
        Dress code and entry requirements
            
        Accommodation and nearby hotels
            
        Travel tips and visa information
            
        Local transportation in Kuala Lumpur
            
        Share details about keynote speakers, panel discussions, and tech showcases.
            
        Provide contact links for support or registration teams.
            
        Maintain a formal, informative, and approachable tone to match the business nature of the event.
            
        Additional Context:
            
        Expected attendees: 300+ professionals including CEOs, CTOs, fintech founders, banking executives, and government regulators.
            
        The summit includes:
            
        Keynotes from global fintech leaders
            
        Product demos and startup pitches
            
        Dedicated networking zones
            
        Exhibition space for solution providers
            
        The event is supported by financial institutions, investment firms, and tech innovators across Southeast Asia.
            
        `;

        const requestOptions = {
            method: "POST",
            headers:{ "Content-Type" : "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [{ text: eventPrompt }]
                    },
                    {
                        role: "user",
                        parts: [{ text: 'Todays date is' + currentDate }]
                    },
                    {
                        role: "user",
                        parts: [{ text: 'Note: Try to make the replies short as possible' }]
                    },
                    {
                        role:"user",
                        parts: [{ text: userChat.message }]
                }]
            })
        }

        try {
            const response = await fetch(API_URL, requestOptions);
            const data = await response.json();

            if (!response.ok) throw new Error(data.error.message);

            return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from bot.";
        } catch (error) {
            console.error(error);
            return "Sorry, something went wrong.";
        }
    }

        // handle outgoing messages

   const handleOutgoingChat = (e) => {
    e.preventDefault();
    userData.message = aiMessage.value.trim();
    aiMessage.value = "";

    // create and display user message
    const messageContent = `<div class="message-text"></div>`;
    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    outgoingMessageDiv.querySelector(".message-text").textContent = userData.message;
    chatBody.appendChild(outgoingMessageDiv);

    // Add 'thinking' animation
    const thinkingMessageDiv = createMessageElement(`
        <div class="message">
            <svg>...</svg> <!-- your icon -->
            <div class="message-text">
                <div class="thinking-indicator">
                    <div class="text-dot"></div>
                    <div class="text-dot"></div>
                    <div class="text-dot"></div>
                </div>
            </div>
        </div>`, 
        "bot-message", 
        "thinking"
    );
    chatBody.appendChild(thinkingMessageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;

    // Simulate delay, then show bot reply
    setTimeout(async () => {
        const botReply = await generateBotRespose();
        thinkingMessageDiv.remove(); // remove thinking
        addBotMessage(botReply);     // show reply
    }, 500);
};


    sendChat.addEventListener("click", handleOutgoingChat);

    // handle Enter key press for sending messages
    aiMessage.addEventListener("input", (e) => {
    userChat.message = e.target.value.trim();
});

 aiMessage.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && userChat.message) {
        e.preventDefault(); // to prevent newline from being added
        handleOutgoingChat(e);
    }
});

    sendChat.addEventListener("click",(e) => handleOutgoingChat(e))





messageInput.addEventListener("keydown", (e) => {
    const userMessage = e.target.value.trim();
    if (e.key === "Enter" && !e.shiftKey && userMessage) {
        handleOutgoingMessage(e);
    }
});

const firstMSg = document.querySelectorAll(".firstMSg");
const thinKing = document.querySelector("#thinKing");

sendMessage.addEventListener("click", (e) => handleOutgoingMessage(e));
const clickPop = () => {
    setTimeout(() => {
        chatBox.classList.toggle('chat-up');
    }, 100);
    
    chatPop.classList.toggle('scale');
    thinKing.style.display = "flex";

    firstMSg.forEach(msg => {
        msg.style.display = "none";
    });

    setTimeout(() => {
        thinKing.style.display = "none";
        firstMSg.forEach(msg => {
            msg.style.display = "flex";
        });
    }, 1500);
};

chatPop.addEventListener('click', clickPop);
chatClose.addEventListener('click', clickPop);

// 🟡 Close chat when clicking outside
document.addEventListener('click', function (event) {
    // If chat is open and click is outside the chatBox and not the chatPop button
    if (
        chatBox.classList.contains('chat-up') &&
        !chatBox.contains(event.target) &&
        !chatPop.contains(event.target)
    ) {
        chatBox.classList.remove('chat-up');
        chatPop.classList.remove('scale');
    }
});


// send data to database

