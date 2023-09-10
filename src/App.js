import React, { useState, useEffect } from 'react';
import './App.css';
import { Box, Flex, Image, Text, useBreakpointValue, Input, Button, AspectRatio } from '@chakra-ui/react';
import waffleImage from './waffle.png';
import Chat from './Chat.js';

function App() {
  const flexDirection = useBreakpointValue({ base: 'column', sm: 'row', md: 'row' });
  const fontSize = useBreakpointValue({ base: '7xl', sm: '7xl' });

  const [youtubeLink, setYoutubeLink] = useState('');
  const [videoDetails, setVideoDetails] = useState(null);
  const [showChat, setShowChat] = useState(false);

  const API_KEY = process.env.API_URL;

  const getVideoIdFromLink = (link) => {
    let videoId = null;
    if (link.includes('youtu.be/')) {
      videoId = link.split('youtu.be/')[1];
    } else if (link.includes('youtube.com/watch?v=')) {
      videoId = link.split('v=')[1].substring(0, 11);
    }
    return videoId && videoId.length === 11 ? videoId : null;
  }

  const isValidYoutubeLink = (link) => {
    return getVideoIdFromLink(link) !== null;
  };

  const fetchVideoDetails = async (link) => {
    const videoId = getVideoIdFromLink(link);
    if (!videoId) return;
    const apiEndpoint = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${API_KEY}`;

    try {
      const response = await fetch(apiEndpoint);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const videoData = data.items[0].snippet;
        const stats = data.items[0].statistics;
        setVideoDetails({
          title: videoData.title,
          thumbnail: {
            default: videoData.thumbnails.default.url,
            high: videoData.thumbnails.high ? videoData.thumbnails.high.url : videoData.thumbnails.default.url
          },
          views: stats.viewCount,
          creator: videoData.channelTitle
        });
        console.error("Video details found");
      } else {
        console.error("No video details found");
      }
    } catch (error) {
      console.error("Failed to fetch video details", error);
    }
  }

  useEffect(() => {
    const videoId = getVideoIdFromLink(youtubeLink);
    if (videoId) {
      fetchVideoDetails(youtubeLink);
    } else {
      // Reset videoDetails to null if link is invalid
      setVideoDetails(null);
    }
    // eslint-disable-next-line
  }, [youtubeLink]);


  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      setShowChat(true);
    }
  };

  const handleButtonClick = () => {
    setShowChat(true);
  };

  const handleInputChange = (event) => {
    setYoutubeLink(event.target.value);
  }

  return (
    <Box className="AppBackground">
      {!showChat && <Flex className="App" justifyContent="center" alignItems="flex-start" pt={videoDetails ? '5vh' : '30vh'}>
        <Flex flexDirection="column" alignItems="center" textAlign="center" spacing={4}>
          <Flex flexDirection={flexDirection} alignItems="center">
            <Image
              src={waffleImage}
              alt="Waffle Logo"
              mb={['0', '0', '0']}
              width="100px"
              className={isValidYoutubeLink(youtubeLink) && videoDetails ? 'rotate-in' : 'rotate-out'}
            />
            <Text color="black" fontSize={fontSize} fontWeight="bold" mb={['0', '2', '2']} ml={['0', '4', '4']}>waffle</Text>
          </Flex>
          <Flex>
            <Input
              id="main"
              borderColor="transparent"
              backgroundColor="whiteAlpha.700"
              color="black"
              placeholder="youtube link"
              _placeholder={{ color: "blackAlpha.700" }}
              onKeyDown={handleKeyDown}
              onChange={handleInputChange}
            />
            {isValidYoutubeLink(youtubeLink) && videoDetails && (
              <Button id="main" colorScheme="green" color="black" onClick={handleButtonClick}>
                Go
              </Button>
            )}
          </Flex>
          {isValidYoutubeLink(youtubeLink) && videoDetails && (
            <Box
              mt={6}
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              backgroundColor="white"
              p={4}
              width="300px"
              id="main"
              display="flex"
              flexDirection="column"
              alignItems="center"
              className="fade-in"
            >
              {/* Get the high resolution thumbnail and ensure it fits within the container */}
              <AspectRatio ratio={16 / 9} width="100%" mb={4}>
                <Image
                  src={videoDetails.thumbnail.high}
                  alt={videoDetails.title}
                  borderRadius="md"
                  objectFit="cover"
                />
              </AspectRatio>
              <Text as="a" href={youtubeLink} target="_blank" rel="noopener noreferrer" fontWeight="bold" color="blue.600" fontSize="xl" mb={2} textAlign="center">{videoDetails.title}</Text>
              <Text color="gray.600" mb={2} textAlign="center">{videoDetails.creator}</Text>
              <Text color="gray.600" textAlign="center">{Number(videoDetails.views).toLocaleString()} views</Text>
            </Box>
          )}
        </Flex>
      </Flex>}
      {showChat &&
        <Chat videoId={getVideoIdFromLink(youtubeLink)} videoTitle={videoDetails.title} channelName={videoDetails.creator} />
      }
    </Box>
  );
}

export default App;