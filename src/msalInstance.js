import { PublicClientApplication } from "@azure/msal-browser";

// MSAL configuration (for personal Microsoft accounts)
const msalConfig = {
  auth: {
    clientId: "2b21f41c-a40c-4798-a2e1-923b759f966a",
    authority: "https://login.microsoftonline.com/common", // Use "common" for both personal & org accounts
    redirectUri: "http://localhost:3000",
  },
  cache: {
    cacheLocation: 'sessionStorage', // or 'localStorage'
  },

};

const msalInstance = new PublicClientApplication(msalConfig);

export default msalInstance;