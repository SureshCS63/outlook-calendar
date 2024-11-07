import React, { useState, useEffect } from "react";
import msalInstance from "./msalInstance";
import axios from "axios";

const CalendarApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [events, setEvents] = useState([]);

  // Check authentication status when component mounts
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const account = msalInstance.getAllAccounts()[0];
        if (account) {
          setIsAuthenticated(true);
          setUserInfo(account);
        }
      } catch (error) {
        console.log("Not authenticated");
      }
    };
    checkAuthentication();
  }, []);

  // Login function
  const login = async () => {
    try {
      const response = await msalInstance.loginPopup({
        scopes: ["User.Read", "Calendars.Read"], // Scopes to access user's info and calendar events
      });
      setIsAuthenticated(true);
      setUserInfo(response.account);
    } catch (error) {
      console.error(error);
    }
  };

  // Logout function
  const logout = () => {
    msalInstance.logoutPopup();
    setIsAuthenticated(false);
    setUserInfo(null);
  };

  // Fetch calendar events from Microsoft Graph API
  const fetchCalendarEvents = async () => {
    if (!isAuthenticated) return;

    try {
      const account = msalInstance.getAllAccounts()[0];
      const accessTokenResponse = await msalInstance.acquireTokenSilent({
        scopes: ["Calendars.Read"],
        account: account,
      });

      const accessToken = accessTokenResponse.accessToken;

      const response = await axios.get("https://graph.microsoft.com/v1.0/me/events", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setEvents(response.data.value);
    } catch (error) {
      console.error("Error fetching events", error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <>
          <h2>Welcome, {userInfo?.name}</h2>
          <button onClick={logout}>Logout</button>
          <button onClick={fetchCalendarEvents}>Fetch Calendar Events</button>
          <div>
            <h3>Upcoming Events:</h3>
            <ul>
              {events.map((event) => (
                <li key={event.id}>{event.subject}</li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <button onClick={login}>Login with Microsoft</button>
      )}
    </div>
  );
};

export default CalendarApp;
