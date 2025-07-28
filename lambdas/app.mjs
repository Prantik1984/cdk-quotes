import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    ScanCommand,
    PutCommand,
    DeleteCommand
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dnclient = DynamoDBDocumentClient.from(client);

/// delete an item 
async function deleteItem(id) {
    try {
        
        const command = new DeleteCommand({
            TableName: process.env.MY_TABLE,
            Key: {
                id: id 
            }
        });

        await dnclient.send(command);
        return `Item with id :${id} deleted`;
    } catch (err) {
        throw new Error(err.message);
    }
}

/// function to list all quotes

async function listQuotes() {
    let items = [];
    let ExclusiveStartKey = undefined;

    do {
        const command = new ScanCommand({
            TableName: process.env.MY_TABLE,
            ExclusiveStartKey
        });

        const response = await dnclient.send(command);
        items = items.concat(response.Items || []);
        ExclusiveStartKey = response.LastEvaluatedKey;
    } while (ExclusiveStartKey);

    return items;
}

/// function to save quote
async function saveQuote(data) {
    const datetime = new Date().getTime().toString();

    const quote = {
        id: datetime, 
        quote: data.quote,
        author: data.author,
    };

    try {
        const command = new PutCommand({
            TableName: process.env.MY_TABLE,
            Item: quote
        });

        await dnclient.send(command);
        return `Item added at ${datetime}`;

    } catch (error) {
        throw new Error(error.message);
    }
    

    
}

//async function deleteQuote(id) {
//    const params = {
//        TableName: MY_TABLE,
//        Key: {
//            id: id,
//        },
//    };
//    return DynamoDBClient
//        .delete(params)
//        .promise()
//        .then(() => {
//            return id;
//        });
//}

//async function updateQuote(id, data) {
//    const datetime = new Date().toISOString();
//    const params = {
//        TableName: MY_TABLE,
//        Key: {
//            id: id,
//        },

//        ExpressionAttributeValues: {
//            ":quote": data.quote,
//            ":author": data.author,
//            ":updatedAt": datetime,
//        },
//        UpdateExpression:
//            "SET quote = :quote, author = :author, updatedAt = :updatedAt",
//        ReturnValues: "UPDATED_NEW",
//    };
//    await DynamoDBClient
//        .update(params)
//        .promise()
//        .then(() => {
//            return "Item updated!";
//        });
//}

//async function getQuote(id) {
//    const params = {
//        TableName: MY_TABLE,
//        Key: {
//            id: id,
//        },
//    };
//    return dynamo
//        .get(params)
//        .promise()
//        .then((item) => {
//            return item.Item;
//        });
//}

export const handler = async (event) => {
  const path = event.resource;
  const httpMethod = event.httpMethod?.toUpperCase(); // Fix typo
  const route = `${httpMethod} ${path}`;
  const data = event.body ? JSON.parse(event.body) : {};

  let statusCode = 200;
  let body;

  try {
    switch (route) {
        case "GET /quotes":
            body = await listQuotes();
            break;

      case "POST /quotes":
            body = await saveQuote(data);
            break;
       case "DELETE /quotes/{id}":
            body = await deleteItem(event.pathParameters.id);
            break;
      //  case "PUT /quotes/{id}":
      //      body = await updateQuote(event.pathParameters.id, data);
      //      break;
      //  case "GET /quotes/{id}":
      //      body = await getQuote(event.pathParameters.id);
      //      break;
      default:
        statusCode = 404;
        body = "Route not found";
    }
  } catch (err) {
    console.log(err);
    statusCode = 400;
    body = err.message;
  }

  return {
    statusCode,
      headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
      },
    body: JSON.stringify(body),
  };
};
