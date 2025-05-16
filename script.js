    // popup of chatbot
    // const chatPop = document.querySelector('.chat-pop');
    // const chatBox = document.querySelector('#chatbot');
    // const chatClose = document.querySelector('.chat-close');

    // const clickPop = () => {
    //     setTimeout(() => {
            
    //     chatBox.classList.toggle('chat-up');
    //     }, 100);
    //     chatPop.classList.toggle('scale');
    // };

    // chatPop.addEventListener('click', clickPop);
    // chatClose.addEventListener('click', clickPop);

    // //////////////////////////////////////
    // const sendMessage = document.querySelector("#send-message");
    // const messageInput = document.querySelector(".message-input");
    // const chatBody = document.querySelector(".chat-body");


    // API Setup
    const API_KEY ="AIzaSyAvT16qiF3SMZklOwSjPbFkUyNxmUyfKLM";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    const userData = {
        message : null
    }

    // create message element with dynamic classes and return it

    const createMessageElement = (content,  ...classes) =>{
        const div = document.createElement("div");
        div.classList.add("message", ...classes);
        div.innerHTML =content;
        return div;
    }

    // Generate bot response using API

    const generateBotRespose = async () => {
        if (!userData.message) {
            console.warn("No message to send.");
            return "No message.";
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
                        parts: [{ text: userData.message }]
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

    const handleOutgoingMessage = (e) =>{
        e.preventDefault();
        userData.message = messageInput.value.trim();
        messageInput.value = "";


        // create and display user message
        const messageContent = ` <div class="message-text"></div>`;
        
        const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
        outgoingMessageDiv.querySelector(".message-text").textContent = userData.message;
        chatBody.appendChild(outgoingMessageDiv);

        // stimulate bot resoins with thinking indicator after a delay
        setTimeout(async () => {
            const incomingMessageDiv = createMessageElement(`<div class="message">
                <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><linearGradient id="a" x1="5.972" x2="505.481" y1="262.606" y2="250.259" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#58c8dd"></stop><stop offset="1" stop-color="#53a7dd"></stop></linearGradient><path fill="url(#a)" fill-rule="evenodd" d="M255.752.447c141.376 0 256 114.587 256 255.963s-114.623 256.007-256 256.007-256-114.63-256-256.007S114.368.447 255.752.447zM234.488 147.77a29.973 29.973 0 0 0 16.02 8.356v21.018H261v-21.018a30.091 30.091 0 1 0-26.507-8.356zm153.294 79.749v99.8h7.55a15.952 15.952 0 0 0 15.894-15.9v-68a15.953 15.953 0 0 0-15.894-15.9zm-264.064 99.8v-99.8h-7.548a15.958 15.958 0 0 0-15.893 15.9v68a15.957 15.957 0 0 0 15.893 15.9zM346.1 187.638H165.4a31.283 31.283 0 0 0-31.185 31.188v117.181A31.3 31.3 0 0 0 165.4 367.2h58.92v.018a5.213 5.213 0 0 1 4.526 2.625l5.693 9.851c.056.087.112.174.162.268l21.056 36.469 26.657-46.169a5.242 5.242 0 0 1 4.768-3.062H346.1a31.3 31.3 0 0 0 31.186-31.194v-117.18a31.283 31.283 0 0 0-31.186-31.188zM215.345 311.6a45.574 45.574 0 0 0 80.813 0 5.222 5.222 0 1 0-9.257-4.837 35.137 35.137 0 0 1-62.3 0 5.221 5.221 0 1 0-9.254 4.837zM319.7 234.1a24.593 24.593 0 1 0 17.394 7.2 24.5 24.5 0 0 0-17.394-7.2zm9.977 14.618a14.112 14.112 0 1 0 4.13 9.975 14.074 14.074 0 0 0-4.13-9.975zM191.8 234.1a24.6 24.6 0 1 0 17.385 7.2 24.512 24.512 0 0 0-17.385-7.2zm9.974 14.618a14.112 14.112 0 1 0 4.13 9.975 14.087 14.087 0 0 0-4.129-9.974z" opacity="1" data-original="url(#a)" class=""></path></g></svg>
                <div class="message-text">
                    <div class="thinking-indicator">
                        <div class="text-dot"></div>
                        <div class="text-dot"></div>
                        <div class="text-dot"></div>
                    </div>
                </div>
            </div>`, "bot-message", "thinking");
            chatBody.appendChild(incomingMessageDiv);
            const botReply = await generateBotRespose();

            // Remove thinking message
            incomingMessageDiv.remove();

            // Show actual response
            const botMessageElement = createMessageElement(`<div class="message-text">${botReply}</div>`, "bot-message");
            chatBody.appendChild(botMessageElement);
        }, 500);

    };

    // handle Enter key press for sending messages
    messageInput.addEventListener("keydown",(e)=>{
        const userMessage = e.target.value.trim();
        if(e.key === "Enter" && !e.shiftKey && userMessage){
            handleOutgoingMessage(e);
        }
    })

    sendMessage.addEventListener("click",(e) => handleOutgoingMessage(e));