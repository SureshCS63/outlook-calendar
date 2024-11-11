import React, { useState, useEffect } from "react"; 
import msalInstance from "./msalInstance"; 
import axios from "axios"; 

const CalendarApp = () => { 
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [userInfo, setUserInfo] = useState(null); 
  const [events, setEvents] = useState([]);
  const [emails, setEmails] = useState([]);
  const [fetchType, setFetchType] = useState('events');

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

  const login = async () => { 
    try { 
      const response = await msalInstance.loginPopup({ 
        scopes: ["User.Read", "Calendars.Read", 'Mail.Read'], 
      }); 
      setIsAuthenticated(true); 
      setUserInfo(response.account); 
    } catch (error) { 
      console.error(error); 
    } 
  };

  const logout = () => { 
    msalInstance.logoutPopup(); 
    setIsAuthenticated(false); 
    setUserInfo(null); 
  };

  const fetchCalendarEvents = async () => { 
    if (!isAuthenticated) return;
    setFetchType('events');
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

      const sortedEvents = response.data.value.sort((a, b) => new Date(a.start.dateTime) - new Date(b.start.dateTime));
      setEvents(sortedEvents);
    } catch (error) { 
      console.error("Error fetching events", error); 
    } 
  };

  const fetchEmails = async () => {
    if (!isAuthenticated) return;
    setFetchType('emails');
    try {
      const account = msalInstance.getAllAccounts()[0];
      const accessTokenResponse = await msalInstance.acquireTokenSilent({
        scopes: ['Mail.Read'],
        account: account
      });

      const accessToken = accessTokenResponse.accessToken;

      const response = await axios.get('https://graph.microsoft.com/v1.0/me/messages', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      setEmails(response.data.value);
    } catch (error) {
      console.error('Error fetching emails', error);
    }
  };

  const getDate = (date) => {
    const newDate = new Date(date);
    const options = { month: 'short', day: 'numeric' };
    return newDate.toLocaleDateString('en-US', options);
  };

  return ( 
    <div className="container py-4">
      {isAuthenticated ? (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="text-dark">Welcome back, {userInfo?.name}</h2>
            <button className="btn btn-outline-danger" onClick={logout}>Logout</button>
          </div>
          <div className="d-flex justify-content-center mb-4">
            <button className="btn btn-outline-success mx-2" onClick={fetchCalendarEvents}>View Your Upcoming Calendar Events</button>
            <button className="btn btn-outline-success mx-2" onClick={fetchEmails}>Load Your Emails</button>
          </div>
          {fetchType === 'events' ? (
            <div className="mt-4">
              <h3 className="text-center mb-4">Stay Ahead with Your Upcoming Events</h3>
              {events.length > 0 ? (
                events.map((event) => {
                  const startDate = new Date(event.start.dateTime);
                  const endDate = new Date(event.end.dateTime);
                  const isSameDate = startDate.toDateString() === endDate.toDateString();
                  const formatDate = (date) => date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

                  return (
                    <div className="card mb-3" key={event.id}>
                      <div className="card-body">
                        <h5 className="card-title">{event.subject}</h5>
                        <p className="card-text">{event.bodyPreview}</p>
                        <div className="d-flex justify-content-between">
                          <div className="text-muted">
                            {isSameDate ? formatDate(startDate) : `${formatDate(startDate)} - ${formatDate(endDate)}`}
                          </div>
                          <div>
                            <strong>{startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</strong>
                            <span className="mx-2">-</span>
                            <strong>{endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-muted">No events found. Please click the button to load your events.</p>
              )}
            </div>
          ) : (
            <div className="mt-4">
              <h3 className="text-center mb-4">Your Recent Emails</h3>
              {emails.length > 0 ? (
                emails.map((email) => (
                  <div className="card mb-3" key={email.id}>
                    <div className="card-body">
                      <h4 className="card-title">{email.subject}</h4>
                      <p>
                        <strong>From:</strong> {`${email.from.emailAddress.name} (${email.from.emailAddress.address})`}
                      </p>
                      <p>
                        <strong>To:</strong> {email.toRecipients.map((recipient) => `${recipient.emailAddress.name} (${recipient.emailAddress.address})`).join(', ')}
                      </p>
                      <p>
                        <strong>Received on:</strong> {new Date(email.sentDateTime).toLocaleString('en-GB', {
                          weekday: 'short',
                          day: 'numeric',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        }).replace(',', '')}
                      </p>
                      <p className="card-text">{email.bodyPreview}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted">Oops! Looks like you don't have any emails right now.</p>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="d-flex justify-content-center mb-4">
          <button className="btn btn-outline-info mt-5" onClick={login}>Login with Microsoft</button>
        </div>
      )}
    </div>
  ); 
}; 

export default CalendarApp;
