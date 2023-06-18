import express, { Request, Response } from 'express'
import { IncomingMessage, createServer } from 'http'
import OpenAiAPI from './openai'
import cors from 'cors'
import { Server } from 'socket.io'
const app = express()

app.use(cors())
app.use(express.json())
const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    }
})
io.on('connection', () => console.log("connected"))
io.emit("hello", "hello back")
const port = 8080
app.get('/', (_, res) => {
    res.status(200).send()
})

app.post('/api/chat', async (req: Request, res: Response) => {
    const {question} = req.body
    try {
        const completion = await OpenAiAPI.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages: [{role:'system',content: "You are a bot that returns only plain text for the user"},{ role: 'user', content: question}],
                stream: true,
            }, { responseType: 'stream' });

        const stream = completion.data as unknown as IncomingMessage;
        const chatgptResponse: { content: string; } = { content: '' };
        stream.on('data', (chunk: Buffer) => {
            const payloads = chunk.toString().split("\n\n");
            for (const payload of payloads) {
                if (payload.includes('[DONE]')) return;
                if (payload.startsWith("data:")) {
                    const data = JSON.parse(payload.replace("data: ", ""));
                    try {
                        const chunk: undefined | string = data.choices[0].delta?.content;
                        if (chunk) {
                            chatgptResponse.content += chunk;
                            io.emit('chat-gpt-res', { content: chatgptResponse.content });
                        }
                    } catch (err) {
                        io.emit('resError', { error: err });
                    }
                }
            }
        });

        stream.on('end', () => {
            setTimeout(() => {
                console.log('\nStream done');
                res.send({ message: 'Stream done' });
            }, 10);
        });

        stream.on('error', (err: Error) => {
            res.send(err);
        });
    } catch (err) {
        res.send(err);
    }
});

server.listen(port, () => console.log(`Running on port ${port}`))