import { OpenAI } from "@langchain/openai";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import wxflows from "@wxflows/sdk/langchain";
import SYSTEM_MESSAGE from "@/constants/systemMessage";
import{ ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts"
import { SystemMessage, trimMessages} from "@langchain/core/messages";
import {
    MessagesAnnotation,
    START,
    StateGraph
} from "@langchain/langgraph";

const trimmer = trimMessages({
    maxTokens: 10,
    strategy: "last",
    tokenCounter: (msgs) => msgs.length,
    includeSystem: true,
    allowPartial: false,
    startOn: "human",
});

// Connect to wxflows
const toolClient = new wxflows({
    endpoint: process.env.WXFLOWS_ENDPOINT || "",
    apikey: process.env.WXFLOWS_API_KEY,
});

// Retrieve the tools
const tools = await toolClient.lcTools;
const toolNode = new ToolNode(tools);

const initializeModel = () => {
    const model = new OpenAI({
        modelName: "GPT-4 Turbo",
        openAIApiKey: process.env.OPENAI_API_KEY,
        temperature: 0.7, // Higher temperature for more creative response
        maxTokens: 4096, // Higher max tokens for longer responses
        streaming: true // Enable streaming for SSE

        // Prompt Caching using Anthropic API
        // clientOptions: {
        //     defaultHeaders: {
        //         "anthropic-beta": "prompt-caching-2024-07-31",
        //     },
        // },
        // callbacks: {
                // {
                //     handleLLMStart: async () => {
                //         // console.log("Starting LLM Call");
                //     },
                //     handleLLMEnd: async (output) => {
                //         console.log("End LLM call", output);
                //         const usage = output.llmOutput?.usage;
                //         if (usage) {
                //             // console.log("Token Usage: ", {
                //                 input_tokens: usage.input_tokens,
                //                 output_tokens: usage.output_tokens,
                //                 total_tokens: usage.input_tokens + usage.output_tokens,
                //                 cache_creation_input_tokens:
                //                     usage.cache_creation_input_tokens || 0,
                //                 cache_read_input_token: usage.cache_read_input_tokens || 0,
                //             });
                //         }
                //     },
                //     handleLLMNewToken: async (token: string) => {
                //         console.log("New token:", token);
                //     }
                // }
        // }
    })
    // }).bindTools(tools) // Add the bindTools method after replacing OpenAI with Anthropic Claude LLM

    return model;
};

const createWorkflow = () => {
    const model = initializeModel();

    const stateGraph = new StateGraph(MessagesAnnotation).addNode(
        "agent",
        async (state) => {
            // Create the system message content
            const systemContent = SYSTEM_MESSAGE;

            // Create the prompt template with system message and messages placeholder
            const promptTemplate = ChatPromptTemplate.fromMessages([
                new SystemMessage(systemContent, {
                    cache_control: { type: "ephemeral" }, // set a cache breakpoint (max number of breakpoints is 4)
                }),
                new MessagesPlaceholder("messages"),
            ]);

            // Trim the messages to manage conversation history
            const trimmedMessages = await trimmer.invoke(state.messages);

            // Format the prompt with the current messages
            const prompt = await promptTemplate.invoke({ messages: trimmedMessages });

            // Get response from the model
            const response = await model.invoke(prompt);

            return { messages: [response] }
        }
    )
}