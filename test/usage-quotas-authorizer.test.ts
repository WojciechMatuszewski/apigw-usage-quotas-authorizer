import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as UsageQuotasAuthorizer from '../lib/usage-quotas-authorizer-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new UsageQuotasAuthorizer.UsageQuotasAuthorizerStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
