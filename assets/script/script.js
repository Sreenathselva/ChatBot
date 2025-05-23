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
const steps = ["name", "email",  "jobTitle", "company", "phone"];

const userData = {
    name: "",
    email: "",
    purpose: "",
    jobTitle: "",
    company: "",
    phone: ""
};

let skipSave = false;


userData.sessionId = crypto.randomUUID(); // or any other UID generator 

function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
}

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
                <div class="message-text">${text}
                <div class="message-time">${getCurrentTime()}</div>
                </div>
                    
            </div>`, "user-message", "message");
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
};

const addBotMessage = (text) => {
    const msg = createMessageElement(`
        <div class="message bot-message">
                <img src="assets/images/traicon-1by1.png" class="bot-img" alt="">
                <div class="message-text">${text}
                <div class="message-time">${getCurrentTime()}</div>
                </div>
                    
            </div>`, "bot-message", "message");
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
};

const contactCont = document.querySelector(".contact-cont");

const showNextBotQuestion = () => {
    const isFinalStep = currentStep >= steps.length;

    // Save the previous input
    if (!skipSave && currentStep > 0 && currentStep <= steps.length) {
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

    skipSave = false;

    if (isFinalStep) {
        const thinking = addThinkingMessage();

        setTimeout(() => {
            thinking.remove();
            addBotMessage("Thank you for your information! We will get back to you shortly.");
            addBotMessage("<span>If you have any other questions, feel free to ask!</span> ");
            chatBot1.style.display = "none";
             chatBot2.style.display = "flex";
            console.log("Final User Data:", userData);
            setTimeout(() => {
                // contactCont.style.left="0";
            }, 1000);
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
            // case "purpose":
            //     showPurposeOptions();
            //     break;
            case "name":
                addBotMessage("What's your full name?");
                break
            case "email":
                addBotMessage(`<div>Hi there! <span>${userData.name}</span> <br> Could you please provide your official <span> Email Address</span>?</div>`);
                addBotMessage("Note: please use your official email.");
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
    // currentStep++;
    // showNextBotQuestion();
    // Save purpose immediately
    fetch("assets/php/save_user_data.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        field: "purpose",
        value: selectedPurpose,
        sessionId: userData.sessionId,
    }),
})
.then(async (res) => {
    const text = await res.text();  // get raw text
    console.log("Raw response:", text);
    try {
        const data = JSON.parse(text);
        console.log("Saved purpose:", data);
        if (!data.success) {
            console.error("Error saving purpose:", data.error);
        }
    } catch (e) {
        console.error("JSON parsing error:", e, "Raw:", text);
    }
})
.catch((err) => console.error("Fetch error (purpose):", err));

document.querySelector("#purpose").style.display = "none";
    
    currentStep = 0; // Start steps from name
    showNextBotQuestion();
};
// Attach click listeners to static HTML elements
document.querySelectorAll("#user-type-options li").forEach(li => {
    li.addEventListener("click", () => {
        const choice = li.getAttribute("data-type");
        handlePurposeSelection(choice);
        document.querySelectorAll(".chat-input").forEach(el => {
          el.classList.add("chat-msg-active");
      });
    });
});

// const showPurposeOptions = () => {
//     const thinking = addThinkingMessage();
//     setTimeout(() => {
//         thinking.remove();
//         const optionsHTML = `
//                <div class="message bot-message">
//                 <img src="assets/images/traicon-1by1.png" class="bot-img" alt="">
//                 <div class="message-text">
//                     <span>Please let us know what you are interested in</span>
//                     <ul id="user-type-options">
//                         <li data-type="Delegate">Delegate - VIP</li>
//                         <li data-type="Speaker">Speaker</li>
//                         <li data-type="Sponsorship">Sponsor</li>
//                         <li data-type="Solution Provider">Solution Provider</li>
//                         <li data-type="Media Partner">Media Partner</li>
//                         <li data-type="Others">Others</li>
//                     </ul>
//                 </div>
//             </div>
//         `;

//         const botMsg = createMessageElement(optionsHTML, "bot-message");
//         chatBody.appendChild(botMsg);
//         chatBody.scrollTop = chatBody.scrollHeight;

//         document.querySelectorAll("#user-type-options li").forEach(li => {
//             li.addEventListener("click", () => {
//                 const choice = li.getAttribute("data-type");
//                 userData.purpose = choice;
//                 messageInput.dataset.lastInput = choice; 
//                 addUserMessage(choice);
//                 currentStep++;
//                 showNextBotQuestion();
//             });
//         });
//     }, 1500);
// };

const greetingKeywords = ["hi", "hello", "hey","hlo","hoi", "good morning", "good afternoon"];
const eventKeywords = ["event", "details", "date", "when", "where"];
const questionKeywords = ["sponsor", "delegate", "sponsorship", "enquiry", "exhibitor","packages", "exhibition", "register", "registration", "attend", "participate", "participating", "join", "joining"];
const Qac = ["people", "attendees", "participants", "delegates", "guests", "audience", "visitors",];
const negativeKeywords = ["not interested", "no","I won't", "I can't","na", "nothing", "no thanks", "stop", "nope"];


function messageContainsKeyword(message, keywordList) {
    const words = message.toLowerCase().split(/\s+|[,?.!;:()]+/);
    const matched = keywordList.find(keyword => words.includes(keyword.toLowerCase()));
    if (matched) console.log(`Matched keyword: ${matched}`);
    return !!matched;
}

const handleOutgoingMessage = (e) => {
    e.preventDefault();
    const input = messageInput.value.trim();
    const field = steps[currentStep];

    if (!input && currentStep !== 2) return;

    addUserMessage(input); // Always show user's message in chat
    messageInput.value = ""; // Clear input box

    // Greeting check
    if (messageContainsKeyword(input, greetingKeywords)) {
        const thinking = addThinkingMessage();
        skipSave = true;
        setTimeout(() => {
            thinking.remove();
            addBotMessage("Hello! 👋 How can I help you regarding the event?");
            showNextBotQuestion();
        }, 600);
        return;
    }

    // Event info check
    if (messageContainsKeyword(input, eventKeywords)) {
        const thinking = addThinkingMessage();
        skipSave = true;
        setTimeout(() => {
            thinking.remove();
            addBotMessage("The Fintech Revolution Summit – Malaysia 2025 will be held in Kuala Lumpur on July 23rd. Let me know what else you'd like to know!");
            showNextBotQuestion();
        }, 600);
        return;
    }

    // Negative response check
    if (messageContainsKeyword(input, negativeKeywords)) {
        const thinking = addThinkingMessage();
        skipSave = true;
        setTimeout(() => {
            thinking.remove();
            addBotMessage("To assist you better, we really need your input. Could you please provide your answer?");
            showNextBotQuestion();
        }, 600);
        return;
    }

    // Q&A content check
    if (messageContainsKeyword(input, Qac)) {
        const thinking = addThinkingMessage();
        skipSave = true;
        setTimeout(() => {
            thinking.remove();
            addBotMessage(`
                Over 200 pre-screened delegates will be attending.
                Featured in 50+ media mentions.
                Backed by 100+ leading organizations.
                Hear from 30+ renowned industry experts.
                Connect with 25+ top solution providers.
                Enjoy 8+ hours of dedicated networking opportunities.
            `);
            showNextBotQuestion();
        }, 600);
        return;
    }

    // Question check
    if (messageContainsKeyword(input, questionKeywords)) {
        const thinking = addThinkingMessage();
        skipSave = true;
        setTimeout(() => {
            thinking.remove();
            addBotMessage("To learn more about our packages, attend as a delegate, or for any additional details, kindly <span>fill out the form on our website or provide the necessary information here in this chat.</span> We're happy to assist you further.");
            showNextBotQuestion();
        }, 600);
        return;
    }

    // Input validation
    if (field === "email" && !/^\S+@\S+\.\S+$/.test(input)) {
        const thinking = addThinkingMessage();

        setTimeout(() => {
            thinking.remove();
            addBotMessage(`I'm sorry ${userData.name}, that doesn't look like an email address. Can you try again?`);
        }, 600);
        
        return;
    }

    if (field === "phone" && !/^\+?\d{7,15}$/.test(input)) {

        const thinking = addThinkingMessage();
        setTimeout(() => {
            thinking.remove();
            addBotMessage("Please enter a valid phone number with your country code.");    
        }, 600);
        
        return;
    }

    userData[field] = input;
    messageInput.dataset.lastInput = input;
    currentStep++;
    showNextBotQuestion();
};


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
        Your name is "Trait'an The Bot"
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
    if (!userData.message) return;
    aiMessage.value = "";

    // Create message container
    const outgoingMessageDiv = createMessageElement("", "user-message");

    // Add user message text
    const messageTextDiv = document.createElement("div");
    messageTextDiv.className = "message-text";
    messageTextDiv.textContent = userData.message;

    // Add timestamp
    const timeDiv = document.createElement("div");
    timeDiv.className = "message-time";
    timeDiv.textContent = getCurrentTime();

    messageTextDiv.appendChild(timeDiv);
    outgoingMessageDiv.appendChild(messageTextDiv);
    chatBody.appendChild(outgoingMessageDiv);

    // Add thinking animation
    const thinking = addThinkingMessage();
    chatBody.appendChild(thinking);
    chatBody.scrollTop = chatBody.scrollHeight;

    // Simulate delay, then show bot reply
    setTimeout(async () => {
        const botReply = await generateBotRespose();
        thinking.remove(); // remove thinking
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
sendMessage.addEventListener("click", (e) => handleOutgoingMessage(e));


// chat pop animations
const firstMSg = document.querySelectorAll(".firstMSg");
const thinKing = document.querySelector("#thinKing");
const chatMsg = document.querySelector(".chat-msg");
const chatPopCont = document.querySelector(".chat-pop-cont");
const chatMsgClose = document.querySelector(".chat-msg-close");

  document.addEventListener("DOMContentLoaded", function () {
   setTimeout(() => {
    
    chatPopCont.style.display = "flex";
    setTimeout(() => {
        chatMsg.classList.add("chat-msg-active");
    }, 300);
   }, 3000); 
   chatMsgClose.addEventListener("click", () => {
        chatMsg.classList.remove("chat-msg-active");
    });
});


const clickPop = () => {
    setTimeout(() => {
        chatBox.classList.toggle('chat-up');
        chatMsg.classList.remove("chat-msg-active");
    }, 100);
    // const thinKing = addThinkingMessage();
    chatPop.classList.toggle('scale');
    

    firstMSg.forEach(msg => {
        msg.classList.add("f-active");
    });

    setTimeout(() => {
    // thinKing.remove();
        firstMSg.forEach(msg => {
             msg.classList.remove("f-active");
        });
    }, 1000);
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


