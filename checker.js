(async function () {
  console.log("Checker script loaded");
  const appUrl = "http://localhost:58386/"; // Angular app URL
  const scriptTag = document.currentScript;
  const urlParams = new URLSearchParams(scriptTag.src.split("?")[1]);
  const apiKey = urlParams.get("key");
  const adminEmail = "ahmdalsayed92@gmail.com";

  if (!apiKey) {
    console.error("API key is missing.");
    return;
  }
  verifyAdmin();
  function getAdminDataByDomain() {}

  function verifyAdmin() {
    const url = "http://localhost:3000/api/entities/validate";

    const data = {
      domain: window.location.host,
      apiKey: apiKey,
      adminEmail: adminEmail,
    };

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((result) => {
        console.log("Success:", result);
        addingCheckerBtnStyleTag();
        drawCheckerBtn();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function openWidget() {
    const overlay = document.createElement("div");
    overlay.classList.add("overlay");
    const iframe = document.createElement("iframe");
    iframe.src = appUrl; // Angular app URL
    iframe.id = "iframeApp";

    document.body.appendChild(iframe);
    document.body.appendChild(overlay);
    iframe.onload = function () {
      const iframeWindow = iframe.contentWindow;
      iframeWindow.postMessage(
        { message: "domain", domain: window.location.href },
        appUrl
      );
    };
  }

  async function axeScanner() {
    return new Promise((resolve, reject) => {
      // Load axe-core
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.6.1/axe.min.js";
      script.onload = async () => {
        try {
          // Run axe-core
          const results = await axe.run();
          console.log("Results from axe: ", results);

          // Calculate accessibility score
          const totalRulesChecked =
            results.passes.length +
            results.violations.length +
            results.inapplicable.length;
          const rulesWithIssues = results.violations.length;
          const scorePercentage =
            totalRulesChecked === 0
              ? 100
              : ((totalRulesChecked - rulesWithIssues) / totalRulesChecked) *
                100;

          resolve(results);
        } catch (error) {
          reject(error);
        }
      };
      document.head.appendChild(script);
    });
  }

  // Listen for messages from Angular app
  window.addEventListener("message", async (event) => {
    if (event.data.message === "start the scan!") {
      console.log("Starting accessibility scan...");
      try {
        const results = await axeScanner();
        const currentPageUrl = window.location.href;

        const iframeApp = document.getElementById("iframeApp");
        iframeApp.contentWindow.postMessage(
          { message: "results", results, currentPageUrl },
          appUrl
        );
      } catch (error) {
        console.error("Error in accessibility scan:", error);
      }
    }
    if (event.data.message === "close the widget!") {
      const overlay = document.querySelector(".overlay");
      const iframe = document.getElementById("iframeApp");
      overlay?.remove();
      iframe?.remove();
    }
  });

  function drawCheckerBtn() {
    // Create the sticky "Checker" button
    const checkerButton = document.createElement("button");
    iconSVG = `<svg width="19" height="25" viewBox="0 0 19 25" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.25 7.75C15.9422 7.75 16.6189 7.54473 17.1945 7.16014C17.77 6.77556 18.2186 6.22893 18.4835 5.58939C18.7485 4.94985 18.8178 4.24612 18.6827 3.56719C18.5477 2.88825 18.2143 2.26461 17.7248 1.77513C17.2354 1.28564 16.6117 0.952301 15.9328 0.817253C15.2539 0.682205 14.5501 0.751516 13.9106 1.01642C13.271 1.28133 12.7244 1.72993 12.3398 2.30551C11.9552 2.88108 11.75 3.55777 11.75 4.25C11.75 5.17826 12.1187 6.0685 12.7751 6.72488C13.4315 7.38125 14.3217 7.75 15.25 7.75ZM15.25 2.5C15.5961 2.5 15.9344 2.60264 16.2222 2.79493C16.51 2.98722 16.7343 3.26053 16.8668 3.58031C16.9992 3.90008 17.0339 4.25194 16.9663 4.59141C16.8988 4.93088 16.7321 5.2427 16.4874 5.48744C16.2427 5.73218 15.9308 5.89885 15.5914 5.96638C15.2519 6.0339 14.9 5.99924 14.5803 5.86679C14.2605 5.73434 13.9872 5.51004 13.7949 5.22225C13.6026 4.93446 13.5 4.59612 13.5 4.25C13.5 3.78587 13.6843 3.34075 14.0125 3.01256C14.3407 2.68438 14.7858 2.5 15.25 2.5ZM14.375 17.375C14.375 18.7595 13.9644 20.1128 13.1953 21.264C12.4261 22.4151 11.3328 23.3123 10.0538 23.8422C8.77467 24.372 7.36721 24.5106 6.00934 24.2405C4.65147 23.9704 3.40419 23.3037 2.42522 22.3247C1.44626 21.3458 0.779572 20.0985 0.509475 18.7406C0.239379 17.3828 0.378002 15.9753 0.907815 14.6962C1.43763 13.4171 2.33484 12.3239 3.48598 11.5547C4.63712 10.7855 5.9905 10.375 7.37497 10.375C7.60704 10.375 7.8296 10.4672 7.99369 10.6313C8.15778 10.7954 8.24997 11.0179 8.24997 11.25C8.24997 11.4821 8.15778 11.7046 7.99369 11.8687C7.8296 12.0328 7.60704 12.125 7.37497 12.125C6.33662 12.125 5.32159 12.4329 4.45823 13.0098C3.59487 13.5867 2.92196 14.4066 2.5246 15.3659C2.12724 16.3252 2.02328 17.3808 2.22585 18.3992C2.42842 19.4176 2.92844 20.3531 3.66266 21.0873C4.39689 21.8215 5.33235 22.3216 6.35075 22.5241C7.36915 22.7267 8.42475 22.6227 9.38406 22.2254C10.3434 21.828 11.1633 21.1551 11.7402 20.2917C12.3171 19.4284 12.625 18.4134 12.625 17.375C12.625 17.1429 12.7172 16.9204 12.8813 16.7563C13.0453 16.5922 13.2679 16.5 13.5 16.5C13.732 16.5 13.9546 16.5922 14.1187 16.7563C14.2828 16.9204 14.375 17.1429 14.375 17.375ZM18.552 13.3205C18.6339 13.4206 18.6926 13.5377 18.7238 13.6633C18.755 13.7889 18.758 13.9199 18.7325 14.0467L16.9825 22.7967C16.9428 22.995 16.8357 23.1734 16.6794 23.3016C16.523 23.4298 16.3271 23.4999 16.125 23.5C16.0669 23.5001 16.009 23.4942 15.9522 23.4825C15.7248 23.4368 15.5249 23.3028 15.3963 23.1098C15.2677 22.9168 15.221 22.6807 15.2664 22.4533L16.8075 14.75H9.99997C9.84627 14.7502 9.69522 14.71 9.56202 14.6333C9.42882 14.5566 9.31818 14.4461 9.24123 14.3131C9.16428 14.18 9.12374 14.029 9.12368 13.8753C9.12362 13.7216 9.16406 13.5706 9.24091 13.4375L11.435 9.62031C9.90952 8.82351 8.18315 8.49371 6.4714 8.67208C4.75966 8.85045 3.13837 9.5291 1.80997 10.6233C1.72324 10.7062 1.62039 10.7703 1.50782 10.8117C1.39524 10.8532 1.27535 10.8711 1.15559 10.8642C1.03582 10.8574 0.918746 10.826 0.811627 10.772C0.704508 10.718 0.609637 10.6425 0.532907 10.5503C0.456178 10.4581 0.399228 10.3511 0.365597 10.2359C0.331965 10.1208 0.32237 9.99996 0.337407 9.88095C0.352445 9.76194 0.391794 9.64729 0.453009 9.54412C0.514225 9.44096 0.595999 9.35148 0.693253 9.28125C2.41756 7.85836 4.55101 7.02296 6.78303 6.89666C9.01505 6.77037 11.2291 7.35977 13.1029 8.57906C13.2903 8.70112 13.4239 8.89029 13.4762 9.10773C13.5284 9.32518 13.4955 9.55439 13.384 9.74828L11.5115 13H17.875C18.0045 13 18.1324 13.0287 18.2495 13.0841C18.3666 13.1395 18.4699 13.2203 18.552 13.3205Z" fill="white"/>
</svg>
`;
    const icon = document.createElement("svg");
    const btnText = document.createElement("span");
    icon.innerHTML = iconSVG;
    btnText.innerText = "Scan For Accessibility";

    checkerButton.appendChild(icon);
    checkerButton.appendChild(btnText);
    checkerButton.classList.add("checker-btn");

    document.body.appendChild(checkerButton);

    checkerButton.onclick = function () {
      openWidget();
    };
  }

  function addingCheckerBtnStyleTag() {
    // adding styles for the checker btn
    const style = document.createElement("style");
    style.innerText = `
    .checker-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 266px;
      height: 52px;
      border-radius: 8px;
      padding: 12px 24px;
      color: #fff;
      background-color: #92722A;
      border: none;
      font-size: 18px;
      cursor: pointer;
      transition: all .4s;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: space-around;
    }
    .checker-btn:hover {
      background-color:rgb(116, 88, 24);
    }
    iframe {
      position: fixed;
      width: 90%;
      height: 90vh;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #ffffff;
      z-index: 99999999;
      border: 1px solid #B68A35;
      outline: none;
      border-radius: 12px;
    }
    .overlay {
      position: fixed;
      top: 0;
      bottom: 0px;
      left: 0px;
      right: 0px;
      background-color: #000000bf;
      z-index: 99999;
    }
  `;

    document.head.appendChild(style);
  }
})();
