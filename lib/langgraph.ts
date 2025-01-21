import { OpenAI } from "@langchain/openai";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import wxflows from "@wxflows/sdk/langchain";

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
    // }).bind(tools) // Add the bind method once the WXFlows tools are deployed

    return model;
};

const createWorkflow = () => {
    const model = initializeModel();
}