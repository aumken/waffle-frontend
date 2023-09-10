import React, { useState, useEffect } from 'react';
import { Flex, Grid, GridItem, Button, Input, Box, Image, IconButton, VStack, Text, HStack } from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import waffleImage from './waffle.png';
import './Chat.css';

function Chat({ videoId, videoTitle, channelName }) {
    const [messages, setMessages] = useState([
        `Welcome to this video titled <span style="background-color: #cdd7de; color: black; border-radius: 5px; padding: 2px 5px;">${videoTitle}</span> by <span style="background-color: #cdd7de; color: black; border-radius: 5px; padding: 2px 5px;">${channelName}</span>, start chatting!`
    ]);
    const [currentMessage, setCurrentMessage] = useState('');
    const videoURL = "https://www.youtube.com/watch?v=" + videoId;
    const [transcript, setTranscript] = useState("")
    const [summary, setSummary] = useState("")
    const [links, setLinks] = useState([])
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true); // Set loading to true when we start fetching
                const response = await fetch('https://waffle-sie7.onrender.com/transcribe_and_summarize?url=' + videoURL);
                const data = await response.json(); // Assuming the API responds with JSON

                setTranscript(data.transcript);
                setSummary(data.summary);
                setLinks(data.links);
                setIsLoading(false); // Set loading to false when we've fetched data

            } catch (error) {
                console.error("There was an error fetching the API data", error);
                setIsLoading(false); // Set loading to false if there's an error
            }
        }
        fetchData();
    }, [videoURL]);

    function formatText(text) {
        return text.replace(/\\"/g, '"');
    }


    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    async function chatgpt(question) {
        const response = await fetch("https://waffle-sie7.onrender.com/ask/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "transcription": transcript,
                "question": question
            })
        })

        const responseData = await response.json();
        return responseData;
    }

    const [gptOngoingMessage, setGptOngoingMessage] = useState("");


    const handleSendMessage = async () => {
        const temp = currentMessage;
        setCurrentMessage('');
        if (temp.trim() !== '') {
            setMessages(prevMessages => [...prevMessages, temp, "..."]); // Setting the placeholder to '...'
            const gptResponse = await chatgpt(temp);
            // Initialize the ongoing message
            displayGptResponseWordByWord(gptResponse.answer);
        }
    };

    const displayGptResponseWordByWord = (responseText) => {
        let words = responseText.split(" ");
        let currentMessageIndex = 0;
        let currentOngoingMessage = "...";  // Initializing with '...'

        const displayNextWord = () => {
            if (currentMessageIndex < words.length) {
                currentOngoingMessage += " " + words[currentMessageIndex];
                setMessages(prevMessages => {
                    // Update the last message directly
                    const newMessages = [...prevMessages];
                    newMessages[newMessages.length - 1] = currentOngoingMessage;
                    return newMessages;
                });
                currentMessageIndex++;
                setTimeout(displayNextWord, 100); // This is the delay between words, you can adjust it
            } else {
                setMessages(prevMessages => {
                    let withoutLastMessage = prevMessages.slice(0, prevMessages.length - 1);
                    let modifiedLastMessage = currentOngoingMessage.substring(4).trim(); // remove the first four characters
                    return [...withoutLastMessage, modifiedLastMessage];
                });
            }
        };

        displayNextWord();
    };





    return (
        <>
            <Button
                position="fixed"
                top="2.5vh"
                left="5vh"
                zIndex="10"
                onClick={() => window.location.reload()}
                variant="outline"
                color="white"
            >
                back
            </Button>

            <Text
                fontSize={15}
                position="fixed"
                top="3vh"
                zIndex="10"
                color="white"
                textAlign="center"
                w="100%">
            </Text>

            <Image
                src={waffleImage}
                position="fixed"
                h="6.5vh"
                top="2vh"
                right="5vh"
                zIndex="10"
            />
            <Grid
                mb='5vh'
                mx='5vh'
                mt='10vh'
                h='85vh'
                overflowY="auto"
                templateRows={['repeat(4, 1fr)', 'repeat(2, 1fr)']}
                templateColumns={['1fr', 'repeat(2, 1fr)']}
                gap={4}
            >
                <GridItem borderRadius="lg" bg='#cdd7de' overflow="hidden">
                    <iframe
                        title="youtube"
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        allowFullScreen
                        borderRadius="lg"
                    ></iframe>
                </GridItem>
                <GridItem borderRadius="lg" rowSpan={2} bg='#fbdb83'>
                    <VStack spacing={4} h="100%" p={4} w="100%">
                        <Box
                            flexGrow={1}
                            bg="white"
                            borderRadius="lg"
                            p={3}
                            overflowY="auto"
                            w="100%"
                            display="flex"  // <-- Make it a flex container
                            flexDirection="column-reverse" // <-- Newest messages at the bottom
                        >
                            {[...messages].reverse().map((msg, index) => (
                                <Box
                                    backgroundColor={index % 2 === 0 ? "#0093E9" : "#cdd7de"}
                                    color={index % 2 === 0 ? "white" : "black"}
                                    borderRadius="12px"
                                    display="block"
                                    p="8px 12px"
                                    maxWidth="70%"
                                    alignSelf={index % 2 === 0 ? "flex-start" : "flex-end"}
                                    mb={2}
                                    wordBreak="break-word"
                                    key={index}
                                >
                                    <Text as="div" dangerouslySetInnerHTML={{ __html: msg === "typing..." ? gptOngoingMessage : msg }}></Text>
                                </Box>
                            ))}
                        </Box>

                        <HStack w="100%" spacing={2}>
                            <Input
                                variant="filled"
                                placeholder="chat with your video!"
                                _placeholder={{ color: "blackAlpha.700" }}
                                value={currentMessage}
                                onChange={(e) => setCurrentMessage(e.target.value)}
                                onKeyPress={handleKeyPress} // <-- Add this line
                                w="100%" // Ensure it takes up all available space
                                borderRadius="lg"
                                backgroundColor="white"
                                color="black"
                                _focus={{ bg: "white" }}  // Ensures the background remains white when focused
                                isDisabled={isLoading}
                            />
                            <IconButton
                                aria-label="Send message"
                                icon={<ArrowForwardIcon />}
                                borderRadius="lg"
                                backgroundColor="#0093E9"
                                onClick={handleSendMessage}
                                isDisabled={isLoading}
                            />
                        </HStack>

                    </VStack>
                </GridItem>
                <GridItem h="100%" borderRadius="lg" bg='#fbdb83' overflowY="auto">
                    <VStack spacing={4} h="100%" p={4} w="100%">
                        {isLoading ? (
                            <Flex
                                flexGrow={1}
                                bg="white"
                                borderRadius="lg"
                                p={2}
                                w="100%"
                                color="black"
                                alignItems="center"
                                justifyContent="center"
                                h="100%"
                            >
                                <Image src={waffleImage} alt="Loading spinner" boxSize="50px" animation="spin 1s linear infinite" />
                            </Flex>
                        ) : (
                            <Box flexGrow={1} bg="white" borderRadius="lg" p={2} w="100%" color="black" overflowY="auto">
                                <VStack align="start" spacing={2}>
                                    <Text fontWeight="bold">summary:</Text>
                                    <Text>{formatText(summary)}</Text>
                                    <Text mt={4} fontWeight="bold">links of interest:</Text>
                                    {links.slice(0, 3).map((link, index) => (
                                        <Text key={index} as="a" href={link} target="_blank" rel="noopener noreferrer">{link}</Text>
                                    ))}
                                </VStack>
                            </Box>
                        )}
                    </VStack>
                </GridItem>


            </Grid>
        </>
    );
}

export default Chat;
