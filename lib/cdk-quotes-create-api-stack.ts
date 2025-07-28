import { RemovalPolicy,Stack,StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb'
export class CdkApitack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

      const table = new Table(this, 'quotes-tbl', {
          tableName: 'quotes',
          partitionKey: { name: 'id', type: AttributeType.STRING },
          billingMode: BillingMode.PAY_PER_REQUEST,
          removalPolicy: RemovalPolicy.DESTROY

      });
   
   const handlerFunction=new Function(this,"quotesHandler",{
      functionName:"quotes-handler",
      runtime: Runtime.NODEJS_22_X,
      memorySize:512,
      handler:"app.handler",
      code:Code.fromAsset(join(__dirname,"../lambdas")),
      environment: {
         MY_TABLE: "quotes" 
     }
   });

      table.grantReadWriteData(handlerFunction);
    
    const api=new apigateway.RestApi(this, 'quotes-api',{

    });

    const lambsaIntegration=new apigateway.LambdaIntegration(handlerFunction);

    const mainPath = api.root.addResource("quotes");
      const idPath = mainPath.addResource("{id}");

      mainPath.addMethod("GET",lambsaIntegration);
      mainPath.addMethod("POST", lambsaIntegration);

      idPath.addMethod("DELETE", lambsaIntegration);
      idPath.addMethod("GET", lambsaIntegration);
      idPath.addMethod("PUT", lambsaIntegration);
  }
}
