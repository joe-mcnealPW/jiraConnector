// Import statements
const axios = require("axios");
const fs = require("fs");
const dotenv = require("dotenv").config();

function main() {
  console.log("****************************************************************");

  console.log("\t*----------------------------------------------*")
  console.log("\t\t\tPRE-PROCESSING DATA");
  console.log("\t*----------------------------------------------*")

  // Call function to get the total Issue record count
  const totalRecordCount = getTotalRecordCount();
  console.log("\t- Total API Issue Count: " + totalRecordCount);

  // Use the total record count to calculate how many iterations
  const numIterations = Math.floor(totalRecordCount / 1000) + 1;
  console.log("\t- Number of Iterations: " + numIterations);

  // Create JSON object from Jira data
  const jiraJSON = getJiraJSON(numIterations);


  console.log("\t*----------------------------------------------*")
  console.log("\t\t\tPOST-PROCESSING DATA");
  console.log("\t*----------------------------------------------*")
  console.log("\t- API Issue Count: " + totalRecordCount);
  console.log("\t- Output Issue Count: " + JSON.stringify(jiraJSON["values"].length));
  console.log("\t- Pre/Post Processing Issue Delta: " + JSON.stringify(jiraJSON["values"].length - totalRecordCount));

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

  console.log("\t*----------------------------------------------*")
  console.log("\t\t\tPROCESSING DATA")
  console.log("\t*----------------------------------------------*")



  let i = 0;
  while (i < numIterations) {
    let startAt = 1000 * i;
    let maxResults = 1000;

    if(i != 0) console.log("\t------------------------------------------------")
    console.log("\t- Getting Jira JSON for iteration " + (i+1) + " ...")

    let result = getJiraIssues(startAt, maxResults);
    let newIssues = result["issues"];
    console.log("\t- Processing Jira JSON for iteration " + (i+1) + " ...")

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

console.log("\tTEST1\tEndpoint: " + endpoint);

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

  return {
    values: [{ id: "1" }, { id: "4" }, { id: "3" }],
    total: 2100,
  };
};

const createFile = (contents, name) => {
  let outputPath = `./output/${name}`;

  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }

  fs.appendFile(outputPath, JSON.stringify(contents), function (err) {
    console.log("\t*----------------------------------------------*")
    console.log("\t\t\tRESULT")
    console.log("\t*----------------------------------------------*")

    if (err) {
       throw err;
       console.log("\t*********************************************************************************************");

    }

    console.log(`\t- Your file has been saved successfully.`);
    console.log("****************************************************************");

  });
};

main();