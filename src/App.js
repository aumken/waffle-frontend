import React, { useState, useEffect } from 'react';
import './App.css';
import { Box, Flex, Image, Text, useBreakpointValue, Input, Button, AspectRatio, Link} from '@chakra-ui/react';
import waffleImage from './waffle.png';
import Chat from './Chat.js';

function App() {
  const flexDirection = useBreakpointValue({ base: 'column', sm: 'row', md: 'row' });
  const fontSize = useBreakpointValue({ base: '7xl', sm: '7xl' });

  const [youtubeLink, setYoutubeLink] = useState('');
  const [videoDetails, setVideoDetails] = useState(null);
  const [showChat, setShowChat] = useState(false);

  const API_KEY = process.env.REACT_APP_API_KEY;

  const [recentVideos, setRecentVideos] = useState([]);

  useEffect(() => {
    const videos = JSON.parse(localStorage.getItem("videos")) || [];
    setRecentVideos(videos);
  }, []);

  const getVideoIdFromLink = (link) => {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = link.match(regExp);
    if (match && match[2].length === 11) {
      return match[2];
    }
    return null;
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

        const currentVideoDetail = {
          videoId,  // Adding this
          link: youtubeLink,
          details: {
            title: videoData.title,
            thumbnail: videoData.thumbnails.high
              ? videoData.thumbnails.high.url
              : videoData.thumbnails.default.url,
            views: stats.viewCount,
            creator: videoData.channelTitle
          }
        };

        // Check for duplicates in localStorage
        let videos = JSON.parse(localStorage.getItem("videos")) || [];
        if (!videos.some(video => video.videoId === currentVideoDetail.videoId)) {
          videos.push(currentVideoDetail);
          while (videos.length > 4) videos.shift(); // Ensure only the last 4 are saved
          localStorage.setItem("videos", JSON.stringify(videos));
        }

        setVideoDetails({
          title: videoData.title,
          thumbnail: {
            default: videoData.thumbnails.default.url,
            high: videoData.thumbnails.high
              ? videoData.thumbnails.high.url
              : videoData.thumbnails.default.url
          },
          views: stats.viewCount,
          creator: videoData.channelTitle
        });
        console.log("Video details found");
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

  const isMobile = useBreakpointValue({ base: true, sm: false });
  const paddingTopValue = isMobile ? '10vh' : (videoDetails ? '5vh' : '25vh');

  const handleRecentVideoClick = (link) => {
    setYoutubeLink(link);
  };


  return (
    <Box className="AppBackground">
      {!showChat && <Flex className="App" justifyContent="center" alignItems="flex-start" pt={paddingTopValue}>
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
              value={youtubeLink}
              onKeyDown={handleKeyDown}
              onChange={handleInputChange}
            />
            {isValidYoutubeLink(youtubeLink) && videoDetails && (
              <Button id="main" colorScheme="white" backgroundColor="#cdd7de" color="black" ml={3} onClick={handleButtonClick}>
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
          {!isValidYoutubeLink(youtubeLink) && !videoDetails &&
            <Flex
              direction={flexDirection}
              overflowX="auto"
              overflowY="auto"
              mt={4}
              mb="4rem"  // Add this line
              flexWrap="wrap"
              justifyContent="center"
            >
              {recentVideos.map((video, index) => (
              video.details && (
                <Box
                  key={index}
                  borderWidth="1px"
                  borderRadius="lg"
                  overflow="hidden"
                    backgroundColor="#cdd7de"
                  p={2}
                  width="300px"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  margin={2}  // Provide even margin all around
                  position="relative"
                  cursor="pointer"
                  onClick={() => handleRecentVideoClick(video.link)}
                >
                  <AspectRatio ratio={16 / 9} width="100%">
                    <Image
                      src={video.details.thumbnail}
                      alt={video.details.title}
                      borderRadius="md"
                      objectFit="cover"
                    />
                  </AspectRatio>
                  <Box
                    position="absolute"
                    top={0}
                    bottom={0}
                    left={0}
                    right={0}
                    backgroundColor="rgba(0,0,0,0.9)"
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    opacity={0}
                    transition="opacity 0.3s ease"
                    _hover={{ opacity: 1 }}
                  >
                      <Text
                        fontWeight="bold"
                        color="white"
                        fontSize="xl"
                        mb={2}
                        textAlign="center"
                        p="3"
                        overflow="hidden"
                        maxWidth="95%"
                      >
                        {video.details.title}
                      </Text>
                      <Text p="1" color="white" mb={2} textAlign="center" overflow="hidden"
                        textOverflow="ellipsis"
                        maxWidth="95%">
                      {video.details.creator}
                    </Text>
                  </Box>
                </Box>
              )
            ))}
          </Flex>
      }
        </Flex>
      </Flex>}
      {!showChat &&
        <Flex
          position="absolute"
          bottom="0"
          width="100%"
          justifyContent="center"
          alignItems="center"
          padding="1rem"
          zIndex="10"  // Add this line
          backgroundColor="rgba(0,0,0,0.5)"  // Add this line to give a light background
        >

          <Text fontSize="sm" color="white">
            Made with {'\u2764\uFE0F'} by
            <Link href="https://www.aumken.com" target="_blank" fontWeight="bold" ml={1}>Aum</Link>
            <Box as="span">,</Box>
            <Link href="https://github.com/arvindh-manian" target="_blank" fontWeight="bold" ml={1}>Arvindh</Link>
            <Box as="span">,</Box> and
            <Link href="https://github.com/wpan26" target="_blank" fontWeight="bold" ml={1}>Billy</Link>.
          </Text>
        </Flex>
      }
      {showChat &&
        <Chat videoId={getVideoIdFromLink(youtubeLink)} videoTitle={videoDetails.title} channelName={videoDetails.creator} />
      }
    </Box>
  );
}

export default App;