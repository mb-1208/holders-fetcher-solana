const fs = require('fs');
const axios = require('axios');
const config = require('./config');

// Contract address
const address = config.contractAddress;

// Alchemy API key
const apiKey = config.apiKey;

// Alchemy URL
const baseURL = `https://eth-mainnet.g.alchemy.com/nft/v2/${apiKey}/getOwnersForToken`;

async function saveCSVToFile(data, filename) {
  try {
    fs.writeFileSync(filename, data);
    console.log(`CSV data saved to ${filename}`);
  } catch (error) {
    console.error('Error saving CSV file:', error.message);
  }
}

async function getOwnersForToken(contractAddress, tokenId) {
  const url = `${baseURL}?contractAddress=${contractAddress}&tokenId=${tokenId}`;
  const config = {
    method: 'get',
    url: url,
  };

  try {
    const response = await axios(config);
    return response.data.owners; // Extract the owners array from the response
  } catch (error) {
    console.error(`Error fetching data for token ID ${tokenId}:`, error.message);
    return null;
  }
}

async function main() {
  const results = [];

  for (let tokenId = config.startFromTokenID; tokenId <= config.totalTokenID; tokenId++) {
    const owners = await getOwnersForToken(address, tokenId);

    if (owners && owners.length > 0) {
      results.push({ tokenId, owners });
    }

    // Print progress
    console.log(`Fetching data for token ID ${tokenId} - Progress: ${(tokenId / config.totalTokenID) * 100}%`);
  }

  // Format data in CSV
  const csvData = `Token ID,Owner Wallet\n${results.map(result => `${result.tokenId},${result.owners[0]}`).join('\n')}`;

  // Save CSV data to a file
  await saveCSVToFile(csvData, 'token_owners.csv');
}

main();
