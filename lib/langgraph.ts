import {ChatAnthropic} from "@langchain/anthropic";

const initializeModel = () => {
    const model = new ChatAnthropic({
        modelName:"claud-3-5-sonnet-20241022",
        anthropicApiKey:process.env.ANTHROPIC_API_KEY,
    });

    return model;
}