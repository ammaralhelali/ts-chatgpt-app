# ts-chatgpt-app

### node server that calls OpenAI api for chatgpt and returns a the response as a stream.

using postman:
- connect to the endpoint  http://ec2-16-170-203-69.eu-north-1.compute.amazonaws.com:5000/ and listen to 'chat-gpt-res' event
- hit a POST request to  http://ec2-16-170-203-69.eu-north-1.compute.amazonaws.com:5000/api/chat wiht a body: `{"question": "your question?"}` 

you will see the response stream result in the socket
