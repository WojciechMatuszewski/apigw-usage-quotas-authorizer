# APIGW Usage Plans & Authorizer

## Learnings

- The usage plans can be associated with a given API stage but they will not take effect unless the requester is using either an API Key or
  the method uses an authorizer to associate the request with the usage plan.

- It is possible to create an _API Key_ that is **not associated with a usage plan**. Interesting design.

- You will get an `Unauthorized` error message if your authorizer does not have the `IdentitySources` specified (empty array) no matter what kind of request you send.

- There seem to be multiple versions of _non-Cognito_ authorizers

  - The **request** authorizer
  - The **token** authorizer

- **By default, APIGW DOES NOT use the API Key you have specified within the authorizer. You have to enable that part**.

  - [Here is an excellent article on the subject matter](https://cloudonaut.io/customized-rate-limiting-for-api-gateway-by-path-parameter-query-parameter-and-more/)

- What is the relation between a `Quota` and the `Rate` and `Burst` settings?

  - When I disable the `Quota` setting, this message pops up in the UI
    > Without quota limits, developers will not be restricted to the number of API calls they can make with this usage plan.
  - The `Rate` and `Burst` settings describe what the maximum RPS is the API can take
  - The `Quota` describes the **maximum requests over time (with `Rate` and `Burst` settings applied) that someone can issue**.

- There is **no way to get the API key value via CFN**. You can only get the _id_ of the API key.
  You could use a _custom resource_ to get the value by performing an API call. I've found the `AwsCustomResource`construct very handy for this.

- As for the `AwsCustomResource` construct.
  One thing to note here is that the `service` field is not the _service name_ in the context of IAM but rather in the context of the SDK.
  For example, let us say you want to perform an operation via _API Gateway_ control plane. The `service` would be `APIGateway` **and not** the `apigateway`.

- As good as the `AwsCustomResource` construct abstraction is, there are some issues with the `AwsCustomResourcePolicy.fromSdkCalls` is buggy.
  It does not create the policy correctly. You will be better off specifying the policy manually via the `iam` construct.

- How do you solve cyclic dependency issues while deploying _usage plan_, _api key_, the API itself with _authorizer_ and methods?
  - The problem arises when you want to pass the API key to the authorizer environment variables.
  - I could not make it work via dependencies. I even tried the `cdk.ConcreteDependable` construct.
    - What about the `CompositeDependable`?
      - It seems to me like this construct is something specific to given packages, for example, the `iam` or `vpc` packages.
  - Since we cannot get the _api key value_ directly via CFN, one way would be to deploy the stack twice and then paste the _api key value_ directly into the code - **I would not recommend this approach. It is like having your secrets in plain text within the repo**.
  - Another way I've found is to **hardcore the _api key id_ and reference that**. The _api key id_ is kind of safe to share since you need IAM permissions to read the underlying value.
