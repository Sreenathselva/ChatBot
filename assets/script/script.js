// popup of chatbot
const chatPop = document.querySelector('.chat-pop');
const chatBox = document.querySelector('#chatbot');
const chatClose = document.querySelector('.chat-close');

const clickPop = () => {
    setTimeout(() => {
        
    chatBox.classList.toggle('chat-up');
    }, 100);
    chatPop.classList.toggle('scale');
};

chatPop.addEventListener('click', clickPop);
chatClose.addEventListener('click', clickPop);

//////////////////////////////////////
const sendMessage = document.querySelector("#send-message");
const messageInput = document.querySelector(".message-input");
const chatBody = document.querySelector(".chat-body");

const userData={
    message : null
}

// create message element with dynamic classes and return it

const createMessageElement = (content,  ...classes) =>{
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML =content;
    return div;
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
    setTimeout(() => {
          // create and display user message
            const messageContent = ` 
            <div class="message bot-message thinking">
                <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><linearGradient id="a" x1="5.972" x2="505.481" y1="262.606" y2="250.259" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#58c8dd"></stop><stop offset="1" stop-color="#53a7dd"></stop></linearGradient><path fill="url(#a)" fill-rule="evenodd" d="M255.752.447c141.376 0 256 114.587 256 255.963s-114.623 256.007-256 256.007-256-114.63-256-256.007S114.368.447 255.752.447zM234.488 147.77a29.973 29.973 0 0 0 16.02 8.356v21.018H261v-21.018a30.091 30.091 0 1 0-26.507-8.356zm153.294 79.749v99.8h7.55a15.952 15.952 0 0 0 15.894-15.9v-68a15.953 15.953 0 0 0-15.894-15.9zm-264.064 99.8v-99.8h-7.548a15.958 15.958 0 0 0-15.893 15.9v68a15.957 15.957 0 0 0 15.893 15.9zM346.1 187.638H165.4a31.283 31.283 0 0 0-31.185 31.188v117.181A31.3 31.3 0 0 0 165.4 367.2h58.92v.018a5.213 5.213 0 0 1 4.526 2.625l5.693 9.851c.056.087.112.174.162.268l21.056 36.469 26.657-46.169a5.242 5.242 0 0 1 4.768-3.062H346.1a31.3 31.3 0 0 0 31.186-31.194v-117.18a31.283 31.283 0 0 0-31.186-31.188zM215.345 311.6a45.574 45.574 0 0 0 80.813 0 5.222 5.222 0 1 0-9.257-4.837 35.137 35.137 0 0 1-62.3 0 5.221 5.221 0 1 0-9.254 4.837zM319.7 234.1a24.593 24.593 0 1 0 17.394 7.2 24.5 24.5 0 0 0-17.394-7.2zm9.977 14.618a14.112 14.112 0 1 0 4.13 9.975 14.074 14.074 0 0 0-4.13-9.975zM191.8 234.1a24.6 24.6 0 1 0 17.385 7.2 24.512 24.512 0 0 0-17.385-7.2zm9.974 14.618a14.112 14.112 0 1 0 4.13 9.975 14.087 14.087 0 0 0-4.129-9.974z" opacity="1" data-original="url(#a)" class=""></path></g></svg>
                <div class="message-text">
                    <div class="thinking-indicator">
                        <div class="text-dot"></div>
                        <div class="text-dot"></div>
                        <div class="text-dot"></div>
                    </div>
                </div>
            </div>`;
            
            const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
            chatBody.appendChild(incomingMessageDiv);
    }, 300);

}

// handle Enter key press for sending messages
messageInput.addEventListener("keydown",(e)=>{
    const userMessage = e.target.value.trim();
    if(e.key === "Enter" && !e.shiftKey && userMessage){
        handleOutgoingMessage(e);
    }
})

sendMessage.addEventListener("click",(e) => handleOutgoingMessage(e))