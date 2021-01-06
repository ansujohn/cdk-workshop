import * as cdk from '@aws-cdk/core';
import { Code, Function as LambdaFunction, Runtime } from '@aws-cdk/aws-lambda';
import * as apigw from '@aws-cdk/aws-apigateway';
import { TableViewer } from 'cdk-dynamo-table-viewer';

import { HitCounter } from './hitCounter';

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const hello = new LambdaFunction(this, 'HelloHandler', {
      runtime: Runtime.NODEJS_10_X,
      code: Code.fromAsset('lambda'),
      handler: 'hello.handler'
    });

    const helloWithCounter = new HitCounter(this, 'HelloHitCounter', {
      downstream: hello
    });

    // defines an API Gateway REST API resource backed by our "hello" function.
    const restAPI = new apigw.LambdaRestApi(this, 'Endpoint', {
      handler: helloWithCounter.handler
    });

    //Output API's URL
    new cdk.CfnOutput(this, 'APIUrl', {
      value: `https://${restAPI.restApiId}.execute-api.${this.region}.amazonaws.com/prod/`,
    });

    cdk.Tags.of(this).add('cdk-workshop', 'Y');

    //exposes a public HTTP endpoint which displays an HTML page with the contents of a DynamoDB table in your stack.
    //not for PROD, only for dev purposes
    new TableViewer(this, 'ViewHitCounter', {
      title: 'Hello Hits',
      table: helloWithCounter.table,
      sortBy: '-hits' 
    });
  }
}
