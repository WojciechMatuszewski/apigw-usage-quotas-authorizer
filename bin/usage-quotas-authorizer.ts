#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { UsageQuotasAuthorizerStack } from "../lib/usage-quotas-authorizer-stack";

const app = new cdk.App();
new UsageQuotasAuthorizerStack(app, "UsageQuotasAuthorizerStack");
