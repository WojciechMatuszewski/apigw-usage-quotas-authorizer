import { APIGatewayAuthorizerHandler } from "aws-lambda";

export const handler: APIGatewayAuthorizerHandler = async (event, context) => {
  return {
    policyDocument: {
      Statement: [{ Action: "*", Effect: "Allow", Resource: "*" }],
      Version: "2012-10-17"
    },
    usageIdentifierKey: process.env.API_KEY,
    principalId: context.awsRequestId
  };
};
