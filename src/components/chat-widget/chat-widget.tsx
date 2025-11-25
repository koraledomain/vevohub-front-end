import {useState, useRef, useEffect} from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';
import {useSocket} from "../../hooks/use-socket";

// ----------------------------------------------------------------------

type Message = {
  id: string;
  text: string;
  sender: 'system' | 'user';
  timestamp: string;
  avatar?: string;
};

type ChatWidgetProps = {
  brandName?: string;
  brandLogo?: string;
  isOnline?: boolean;
};

export default function ChatWidget({
                                     brandName = 'AI Assistant',
                                     brandLogo,
                                     isOnline = true
                                   }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! How can I help you today?',
      sender: 'system',
      timestamp: new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'}),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const socket = useSocket("http://localhost:4000");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  };

  useEffect(() => {
    const socketInstance = socket.current;
    if (!socketInstance) return;

    // Handle incoming messages from socket.io server
    const handleNewMessage = (msg: Message) => {
      // Convert ISO timestamp to locale time string for display
      const formattedMessage: Message = {
        ...msg,
        timestamp: new Date(msg.timestamp).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }),
      };
      setMessages((prev) => [...prev, formattedMessage]);
    };

    socketInstance.on("newMessage", handleNewMessage);

    // CLEANUP: Return a function to remove the listener when the component unmounts
    return () => {
      socketInstance.off("newMessage", handleNewMessage);
    };
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    if (!socket.current) return;
    
    // Send message via socket.io - the server will handle user message and AI response
    socket.current.emit("sendMessage", inputValue);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Show only the trigger button if chat is not open
  if (!isOpen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1300,
        }}
      >
        <Button
          variant="contained"
          onClick={() => setIsOpen(true)}
          startIcon={<Iconify icon="solar:chat-round-dots-bold"/>}
          sx={{
            borderRadius: 2,
            boxShadow: 3,
            minWidth: {xs: 120, sm: 160},
          }}
        >
          {brandName}
        </Button>
      </Box>
    );
  }

  // Show minimized button if chat is open but minimized
  if (isMinimized) {
    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1300,
        }}
      >
        <Button
          variant="contained"
          onClick={() => setIsMinimized(false)}
          startIcon={<Iconify icon="solar:chat-round-dots-bold"/>}
          sx={{
            borderRadius: 2,
            boxShadow: 3,
            minWidth: {xs: 120, sm: 160},
          }}
        >
          {brandName}
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        width: {xs: 'calc(100% - 48px)', sm: 400},
        height: {xs: 'calc(100vh - 48px)', sm: 600},
        maxHeight: {xs: 'calc(100vh - 48px)', sm: 600},
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        boxShadow: 6,
        overflow: 'hidden',
        zIndex: 1300,
        bgcolor: 'background.paper',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" flex={1}>
          {brandLogo && (
            <Avatar
              src={brandLogo}
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.dark',
              }}
            />
          )}
          <Box>
            <Typography variant="subtitle2" sx={{fontWeight: 600}}>
              {brandName}
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: isOnline ? 'success.main' : 'grey.500',
                }}
              />
              <Typography variant="caption" sx={{opacity: 0.9}}>
                {isOnline ? 'Online' : 'Offline'}
              </Typography>
            </Stack>
          </Box>
        </Stack>
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            onClick={() => setIsMinimized(true)}
            sx={{color: 'primary.contrastText'}}
          >
            <Iconify icon="solar:minimise-square-bold"/>
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setIsOpen(false)}
            sx={{color: 'primary.contrastText'}}
          >
            <Iconify icon="solar:close-circle-bold"/>
          </IconButton>
        </Stack>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          bgcolor: 'grey.50',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {messages.map((message) => (
          <Stack
            key={message.id}
            direction="row"
            spacing={1}
            justifyContent={message.sender === 'user' ? 'flex-end' : 'flex-start'}
            sx={{
              alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
            }}
          >
            {message.sender === 'system' && (
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'primary.main',
                }}
              >
                <Iconify icon="solar:chat-round-dots-bold" width={20}/>
              </Avatar>
            )}
            <Box
              sx={{
                bgcolor: message.sender === 'user' ? 'primary.main' : 'background.paper',
                color: message.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                p: 1.5,
                borderRadius: 2,
                borderRadiusTopLeft: message.sender === 'system' ? 0 : 2,
                borderRadiusTopRight: message.sender === 'user' ? 0 : 2,
                boxShadow: 1,
              }}
            >
              <Typography variant="body2" sx={{whiteSpace: 'pre-wrap'}}>
                {message.text}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 0.5,
                  opacity: 0.7,
                  fontSize: '0.7rem',
                }}
              >
                {message.timestamp}
              </Typography>
            </Box>
            {message.sender === 'user' && (
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'grey.300',
                }}
              >
                <Iconify icon="solar:user-bold" width={20}/>
              </Avatar>
            )}
          </Stack>
        ))}
        <div ref={messagesEndRef}/>
      </Box>

      {/* Input */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth
            size="small"
            placeholder="Type your message here..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            multiline
            maxRows={3}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              '&.Mui-disabled': {
                bgcolor: 'action.disabledBackground',
              },
            }}
          >
            <Iconify icon="solar:plain-2-bold"/>
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );
}

