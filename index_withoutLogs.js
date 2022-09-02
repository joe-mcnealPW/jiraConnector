// Import statements
const axios = require("axios");
const fs = require("fs");
const dotenv = require("dotenv").config();

function main() {
  // Call function to get the total Issue record count
  const totalRecordCount = getTotalRecordCount();

  // Use the total record count to calculate how many iterations
  const numIterations = Math.floor(totalRecordCount / 1000) + 1;

  // Create JSON object from Jira data
  const jiraJSON = getJiraJSON(numIterations);

  createFile(jiraJSON, "jiraIssues.json");
}

const getTotalRecordCount = () => {
  let result = getJiraIssues(0, 1);
  let totalRecordCount = result["total"];

  return totalRecordCount;
};

const getJiraJSON = (numIterations) => {
  let jiraJSON = {
    startAt: null,
    maxResults: 1000,
    total: null,
    issues: [],
  };

  let i = 0;
  while (i < numIterations) {
    let startAt = 1000 * i;
    let maxResults = 1000;

    let result = getJiraIssues(startAt, maxResults);
    let newIssues = result["issues"];

    if (jiraJSON["total"] == null) {
      jiraJSON["total"] = result["total"];
    }

    jiraJSON["issues"] = jiraJSON["issues"].concat(newIssues);

    i++;
  }

  return jiraJSON;
};

const getJiraIssues = (startAt, maxResults) => {
  // Build API URL String
  let domain = "https://jira.atlassian.com/";
  let path = "rest/api/latest/issue/";
  let query = `?startAt=${startAt}&maxResults=${maxResults}`;
  let endpoint = domain + path + query;

  // Set Auth Header for API authentication
  const bearerToken = `Bearer ${process.env.AUTH_TOKEN}`;
  const authHeader = {
    headers: {
      Authorization: bearerToken,
    },
  };

  axios
    .get(endpoint, authHeader)
    .then((res) => {
      return res.data;
    })
    .catch((error) => {
      console.error(error);
    });
};

const createFile = (contents, name) => {
  let outputPath = `./output/${name}`;

  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }

  fs.appendFile(outputPath, JSON.stringify(contents), function (err) {
    if (err) {
      throw err;
    }
  });
};

main();
