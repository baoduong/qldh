const dynamodb = require('./nodejs/node_modules/aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();
const tableName = 'Connections';

exports.getConnections = async () => {
    const { Items } = await docClient.get(paramsGet).promise();
    const activeConnection = Items.find(item => item.status === 'Active');
};

exports.saveConnection = async () => {

};