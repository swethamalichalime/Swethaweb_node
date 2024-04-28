const http = require("http");
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

// Port number that server listens to
const PORT = 5897;

const getEventsData = async (client) => {
    //Fetches records from given database
    const cursor = await client.db("EventPlanner").collection("Events").find({});
    const results = await cursor.toArray();
    return results;
}

http.createServer(async (req, res) => {
    console.info(req.url);
    if (req.url === "/api") {
        const URL = "mongodb+srv://malichalimeswetha143:Swetha%40123@event-plannercluster.6tfdprc.mongodb.net/?retryWrites=true&w=majority";
        // Creating a new client for connecting to database
        const client = new MongoClient(URL);
        try {
            //Connects to database
            await client.connect();
            console.log("Database is connected sucessfully");
            const eventsData = await getEventsData(client);
            console.log(JSON.stringify(eventsData));
            //Handling CORS Issue
            res.setHeader("Access-Control-Allow-Origin", '*');
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify(eventsData));
            }
            catch (e) {
                console.error("Error connecting in database : ", e);
            }
            finally {
                //Closing connection to database
                await client.close();
                console.log("Database connection closed")
            }
    }
    else {
        let contentType; 
        let filePath = path.join(__dirname, "public", req.url === "/" ? "index.html" : req.url);
        let fileExtension = path.extname(filePath);
        switch (fileExtension) {
            case ".html":
                contentType = "text/html";
                break;
            case ".css":
                contentType = "text/css";
                break;
            case ".js":
                contentType = "application/javascript";
                break;
            case ".json":
                contentType= "application/json";
                break;
            case ".svg":
                contentType = "image/svg+xml";
                break;
            default:
                contentType = "text/plain";
                break;
        }
        fs.readFile(filePath, (err, data) => {
            if (err) {
                if (err.code === "ENOENT") {
                    res.writeHead(404,{"content-type":"text/html"});
                    res.end("<h1>404 Page Not Found!</h1>");
                }
                else {
                    res.writeHead(500, { "content-type": "text/plain" });
                    res.end("Internal Server Error");
                }
            }
            else {
                res.writeHead(200, { "content-type": contentType });
                res.end(data);
            }
        })
    }
}
).listen(PORT, () => console.log(`Server is running on port ${PORT}`));

