import { getResourceParameters, updateOrderStatus, sendMessage } from './service/service.mjs';

// TODO: import heimdall sdk and log config

// TODO: create logger

let DDB_TABLE_NAME, QUEUE_URL;

export const handler = async (event, context) => {
  if (!DDB_TABLE_NAME || !QUEUE_URL) {
    const params = await getResourceParameters();
    DDB_TABLE_NAME = params.DDB_TABLE_NAME;
    QUEUE_URL = `${params.QUEUE_URI}/${params.PAID_QUEUE_NAME}`;
  }

  try {
    // TODO: Replace all existing console.log() statements in the Lambda function to appropriate log levels like logger.info(), logger.error(), etc.
    console.log('Hello from Lambda');
    console.debug('Hello from Lambda');
    console.error('Hello from Lambda');
    console.warn('Hello from Lambda');

    // Update DDB
    const currentDate = new Date().toISOString();
    const ddbParams = {
      TableName: DDB_TABLE_NAME,
      Key: {
        orderId: event.orderId,
      },
      UpdateExpression: 'SET event = list_append(event, :paidEvent), lastUpdatedAt = :currentTime',
      // ExpressionAttributeNames: {
      //    '#event': 'event',
      //    '#lastUpdatedAt': 'lastUpdatedAt'
      // },
      ExpressionAttributeValues: {
        ':paidEvent': [{ PAID: currentDate }],
        ':currentTime': currentDate,
      },
      ReturnValues: 'ALL_NEW',
    };
    const ddbResult = await updateOrderStatus(ddbParams);
    console.log('ddb result: ', ddbResult);

    // Send Message
    const sqsParams = {
      QueueUrl: QUEUE_URL,
      MessageAttributes: {
        key: 'value',
      },
      MessageBody: 'hello',
    };
    const sqsResult = await sendMessage(sqsParams);
    console.log('sqs result: ', sqsResult);
  } catch (e) {
    const error = new Error(e);
    error.code = 500;
    throw error;
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'sucess',
    }),
  };
};
