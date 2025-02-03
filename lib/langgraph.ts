import {ChatAnthropic} from "@langchain/anthropic";
import {ToolNode} from "@langchain/langgraph/prebuilt";
import wxflows from "@wxflows/sdk/langchain"
import {END, MessagesAnnotation, START, StateGraph} from "@langchain/langgraph";

//Customers at: https://introspection.apis.stepzen.com/customers
//Comments at : https://dummyjson.com/comments

// Connect to wxflows
const toolClient = new wxflows({
    endpoint: process.env.WXFLOWS_ENDPOINT || "",
    apikey: process.env.WXFLOWS_APIKEY,
})

//retrieve the tools
const tools = await toolClient.lcTools;
const toolNode = new ToolNode(tools);

const initializeModel = () => {
    const model = new ChatAnthropic({
        modelName:"claud-3-5-sonnet-20241022",
        anthropicApiKey:process.env.ANTHROPIC_API_KEY,
        temperature:0.7, //Higher Temprature for more creative responses;
        maxTokens: 4096, //Higher max tokens for longer responses;
        streaming:true, //Enable streaming for SSE;

        clientOptions:{
            defaultHeaders:{
                "anthropic-beta":"prompt-chaining-2024-07-31",
            }
        },
        callbacks: [
            {
              handleLLMStart: async () => {
                // console.log("🤖 Starting LLM call");
              },
              handleLLMEnd: async (output) => {
                console.log("🤖 End LLM call", output);
                const usage = output.llmOutput?.usage;
                if (usage) {
                  // console.log("📊 Token Usage:", {
                  //   input_tokens: usage.input_tokens,
                  //   output_tokens: usage.output_tokens,
                  //   total_tokens: usage.input_tokens + usage.output_tokens,
                  //   cache_creation_input_tokens:
                  //     usage.cache_creation_input_tokens || 0,
                  //   cache_read_input_tokens: usage.cache_read_input_tokens || 0,
                  // });
                }
              },
              // handleLLMNewToken: async (token: string) => {
              //   // console.log("🔤 New token:", token);
              // },
            },
          ],
    }).bindTools(tools);

    return model;
}


const createWorkflow = () => {
  const model = initializeModel();

  return new StateGraph(MessagesAnnotation)
    .addNode("agent", async (state) => {
      // Create the system message content
      const systemContent = SYSTEM_MESSAGE;

      // Create the prompt template with system message and messages placeholder
      const promptTemplate = ChatPromptTemplate.fromMessages([
        new SystemMessage(systemContent, {
          cache_control: { type: "ephemeral" },
        }),
        new MessagesPlaceholder("messages"),
      ]);

      // Trim the messages to manage conversation history
      const trimmedMessages = await trimmer.invoke(state.messages);

      // Format the prompt with the current messages
      const prompt = await promptTemplate.invoke({ messages: trimmedMessages });

      // Get response from the model
      const response = await model.invoke(prompt);

      return { messages: [response] };
    })
    .addNode("tools", toolNode)
    .addEdge(START, "agent")
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", "agent");
};