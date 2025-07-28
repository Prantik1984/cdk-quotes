import { RemovalPolicy,Stack,StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb'
export class CdkQuotesDirStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

     const table = new Table(this, 'quotes-tbl', {
       tableName: 'quotes',
       partitionKey: { name: 'id', type: AttributeType.STRING},
       billingMode: BillingMode.PAY_PER_REQUEST,
       removalPolicy: RemovalPolicy.DESTROY
       
    });

  }
}
