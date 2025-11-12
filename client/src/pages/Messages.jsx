import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { messagesAPI } from '../services/api';
import socketService from '../services/socket';
import { FaPaperPlane, FaCheckDouble, FaCheck } from 'react-icons/fa';
import '../styles/Messages.css';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState(null);
  const messagesEndRef = useRef(null);
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    fetchMessages();
    
    const socket = socketService.connect();
    const householdId = `household_${currentUserId}`;
    socketService.joinHousehold(householdId);

    const handleMessageReceived = (data) => {
      setMessages(prev => [...prev, data.message]);
      scrollToBottom();
      
      // Mark as read if I'm the recipient
      if (data.message.recipient.id === parseInt(currentUserId)) {
        markMessageAsRead(data.message.id);
      }
    };

    socketService.on('message-received', handleMessageReceived);

    return () => {
      socketService.off('message-received', handleMessageReceived);
    };
  }, [currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      // Get current user's partner
      const userResponse = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const userData = await userResponse.json();
      
      if (userData.partnerId) {
        setPartner({ id: userData.partnerId });
        
        // Fetch conversation with partner
        const response = await messagesAPI.getConversation(userData.partnerId);
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markMessageAsRead = async (messageId) => {
    try {
      await messagesAPI.markAsRead(messageId);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true, readAt: new Date() } : msg
      ));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !partner) return;

    try {
      await messagesAPI.create({
        recipientId: partner.id,
        content: newMessage.trim(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading messages...</div>;
  }

  if (!partner) {
    return (
      <div className="messages-container">
        <div className="empty-state">
          <h2>No Partner Linked</h2>
          <p>Please link with your partner to start messaging.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="messages-container"
    >
      <div className="messages-header">
        <h1>💬 Messages</h1>
        <p>Chat with your household members</p>
      </div>

      <div className="messages-content">
        <div className="messages-list">
          {messages.length === 0 ? (
            <div className="empty-chat">
              <p>No messages yet. Start a conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isMine = message.sender.id === parseInt(currentUserId);
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`message ${isMine ? 'mine' : 'theirs'}`}
                >
                  <div className="message-bubble">
                    <div className="message-content">{message.content}</div>
                    <div className="message-meta">
                      <span className="message-time">
                        {new Date(message.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      {isMine && (
                        <span className="message-status">
                          {message.isRead ? (
                            <FaCheckDouble className="read" />
                          ) : (
                            <FaCheck className="sent" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  {!isMine && (
                    <span className="message-sender">{message.sender.displayName}</span>
                  )}
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="message-input-form">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="message-input"
          />
          <button type="submit" className="send-button" disabled={!newMessage.trim()}>
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default Messages;
