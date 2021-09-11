import * as cdk from "@aws-cdk/core";
import * as apigw from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda-nodejs";
import * as customResources from "@aws-cdk/custom-resources";
import * as iam from "@aws-cdk/aws-iam";
import { join } from "path";

export class UsageQuotasAuthorizerStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new apigw.RestApi(this, "api", {
      apiKeySourceType: apigw.ApiKeySourceType.AUTHORIZER
    });

    const apiKey = api.addApiKey("lowTierKey");

    const lowTierPlan = api.addUsagePlan("lowTierPlan", {
      name: "Low",
      throttle: {
        rateLimit: 1,
        burstLimit: 1
      }
    });

    lowTierPlan.addApiKey(apiKey);
    lowTierPlan.addApiStage({ api: api, stage: api.deploymentStage });

    const apiKeyValueResource = new customResources.AwsCustomResource(
      this,
      "apiKeyValueResource",
      {
        onCreate: {
          service: "APIGateway",
          action: "getApiKey",
          parameters: {
            apiKey: "ugc17nljbl",
            includeValue: true
          },
          physicalResourceId:
            customResources.PhysicalResourceId.fromResponse("value")
        },
        onUpdate: {
          service: "APIGateway",
          action: "getApiKey",
          parameters: {
            apiKey: "ugc17nljbl",
            includeValue: true
          },
          physicalResourceId:
            customResources.PhysicalResourceId.fromResponse("value")
        },
        policy: {
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["apigateway:GET"],
              resources: [
                `arn:aws:apigateway:${cdk.Aws.REGION}::/apikeys/ugc17nljbl`
              ]
            })
          ]
        }
      }
    );

    const authorizerFN = new lambda.NodejsFunction(this, "authorizerHandler", {
      handler: "handler",
      entry: join(__dirname, "../functions/authorizer.ts"),
      environment: {
        API_KEY: apiKeyValueResource.getResponseField("value")
      }
    });

    const authorizer = new apigw.RequestAuthorizer(this, "authorizer", {
      handler: authorizerFN,
      identitySources: [apigw.IdentitySource.header("Authorization")],
      resultsCacheTtl: cdk.Duration.seconds(0)
    });

    const handler = new lambda.NodejsFunction(this, "handler", {
      handler: "handler",
      entry: join(__dirname, "../functions/entry.ts")
    });

    api.root.addMethod("GET", new apigw.LambdaIntegration(handler), {
      authorizer: authorizer
    });
  }
}
