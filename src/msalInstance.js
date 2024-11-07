import { PublicClientApplication } from "@azure/msal-browser";

// MSAL configuration (for personal Microsoft accounts)
const msalConfig = {
  auth: {
    clientId: "<YOUR_CLIENT_ID>", // Replace with your actual Client ID
    authority: "https://login.microsoftonline.com/common", // Use "common" for personal accounts
    redirectUri: "http://localhost:3000", // Your redirect URI (localhost for development)
  },
};

const msalInstance = new PublicClientApplication(msalConfig);

export default msalInstance;