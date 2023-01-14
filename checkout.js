const stripe = Stripe('pk_test_51MOgjgB55MqJsEUBvQWZmlrgJYHgZ7EdEiB8z2HVky5FhxWkDtr2dmz8lbvdmSjVwSYLDAF6v1uec9FbBTkcKLoD00WDb0HtNp')

window.onmessage = (event) => {
     if (event.data) {
       console.log(`HTML Component received a message: ${event.data}`);
       processTransaction(event.data)
     }

async function processTransaction(clientSecret) {
    const paymentOptions = getOptions(clientSecret) 
    const paymentElement = await elements.create("payment", paymentElementOptions);
    paymentElement.mount("#payment-element");
}


function getOptions(clientSecret) {
    return {
        clientSecret: secret,
        appearance: {
            theme: 'stripe',
            layout: {
                type: 'tabs',
                defaultCollapsed: false,
                },
            variables: {
                colorPrimary: '#61767b',
                colorBackground: '#ffffff',
                colorText: '#414a4c',
                colorDanger: '#df1b41',
                fontFamily: 'Avenir LT W01 45 Book',
                spacingUnit: '2px',
                borderRadius: '0px',
                },
            rules: {
               '.Tab': {
                    border: '1px solid #61767b',
                    boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 6px rgba(18, 42, 66, 0.02)',
                },
                '.Tab:hover': {
                    color: 'var(--colorText)',
                },
                '.Tab--selected': {
                    borderColor: '#E0E6EB',
                    boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 6px rgba(18, 42, 66, 0.02), 0 0 0 2px var(--colorPrimary)',
                },
                '.Input--invalid': {
                    boxShadow: '0 1px 1px 0 rgba(0, 0, 0, 0.07), 0 0 0 2px var(--colorDanger)',
                },
            }
        }
    }
}

async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);

  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: "http://checkout.html",
    },
  });
    
  if (error.type === "card_error" || error.type === "validation_error") {
    showMessage(error.message);
  } else {
    showMessage("An unexpected error occurred.");
  }

  setLoading(false);
}

async function checkStatus() {
  const clientSecret = new URLSearchParams(window.location.search).get(
    "payment_intent_client_secret" );

  if (!clientSecret) {
    return;
  }

  const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

  switch (paymentIntent.status) {
    case "succeeded":
      showMessage("Payment succeeded!");
      break;
    case "processing":
      showMessage("Your payment is processing.");
      break;
    case "requires_payment_method":
      showMessage("Your payment was not successful, please try again.");
      break;
    default:
      showMessage("Something went wrong.");
      break;
  }
}

// ------- UI helpers -------

function showMessage(messageText) {
  const messageContainer = document.querySelector("#payment-message");

  messageContainer.classList.remove("hidden");
  messageContainer.textContent = messageText;

  setTimeout(function () {
    messageContainer.classList.add("hidden");
    messageText.textContent = "";
  }, 4000);
}

// Show a spinner on payment submission
function setLoading(isLoading) {
  if (isLoading) {
    // Disable the button and show a spinner
    document.querySelector("#submit").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
  } else {
    document.querySelector("#submit").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
  }
}
